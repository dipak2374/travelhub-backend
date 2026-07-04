import mongoose from 'mongoose';

const buildSearchQuery = (Model, filters, approvedOnly = true) => {
  const query = { isActive: true };
  if (approvedOnly) query.isApproved = true;
  return { query, filters };
};

const getFieldPath = (Model, key) => {
  switch (key) {
    case 'city':
      if (Model.modelName === 'Hotel' || Model.modelName === 'Car') return 'location.city';
      if (Model.modelName === 'Bus') return 'route.destination';
      return 'destination';
    case 'origin':
      return Model.modelName === 'Flight' ? 'origin.city' : 'origin';
    case 'destination':
      return Model.modelName === 'Flight' ? 'destination.city' : 'destination';
    case 'minPrice':
      return Model.modelName === 'Hotel' ? 'pricePerNight'
        : Model.modelName === 'Car' ? 'pricePerDay'
        : 'price';
    case 'maxPrice':
      return Model.modelName === 'Hotel' ? 'pricePerNight'
        : Model.modelName === 'Car' ? 'pricePerDay'
        : 'price';
    default:
      return key;
  }
};

const isSupportedFilter = (Model, key) => {
  if (['page', 'limit', 'sort', 'search'].includes(key)) return false;
  if (['checkIn', 'checkOut', 'passengers'].includes(key)) return false;

  const fieldPath = getFieldPath(Model, key);
  if (fieldPath !== key) return true;

  return Object.prototype.hasOwnProperty.call(Model.schema.paths, fieldPath);
};

export const getAll = (Model, populateFields = []) => async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt', ...filters } = req.query;
    const query = { isActive: true };

    if (req.user?.role !== 'admin') {
      query.isApproved = true;
    }

    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (!value || !isSupportedFilter(Model, key)) return;

      const fieldPath = getFieldPath(Model, key);

      if (key === 'minPrice') {
        const currentValue = query[fieldPath];
        query[fieldPath] = currentValue ? { ...currentValue, $gte: Number(value) } : { $gte: Number(value) };
      } else if (key === 'maxPrice') {
        const currentValue = query[fieldPath];
        query[fieldPath] = currentValue ? { ...currentValue, $lte: Number(value) } : { $lte: Number(value) };
      } else if (['city', 'destination', 'origin'].includes(key)) {
        query[fieldPath] = new RegExp(value, 'i');
      } else {
        query[fieldPath] = value;
      }
    });

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      if (Model.modelName === 'Hotel') query.name = searchRegex;
      else if (Model.modelName === 'Tour') query.title = searchRegex;
      else if (Model.modelName === 'Car') query.$or = [{ make: searchRegex }, { model: searchRegex }];
    }

    let q = Model.find(query);
    populateFields.forEach((f) => { q = q.populate(f); });
    const items = await q
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);
    const total = await Model.countDocuments(query);

    res.json({ success: true, data: items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getOne = (Model, populateFields = []) => async (req, res, next) => {
  try {
    let q = Model.findById(req.params.id);
    populateFields.forEach((f) => { q = q.populate(f); });
    const item = await q;
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

import Route from '../models/Route.js';

export const create = (Model) => async (req, res, next) => {
  try {
    const bodyData = { ...req.body };
    if (Model.modelName === 'Bus' && bodyData.route && typeof bodyData.route === 'object') {
      const { origin, destination } = bodyData.route;
      if (origin && destination) {
        let routeDoc = await Route.findOne({
          origin: new RegExp(`^${origin.trim()}$`, 'i'),
          destination: new RegExp(`^${destination.trim()}$`, 'i'),
        });
        if (!routeDoc) {
          routeDoc = await Route.create({
            origin: origin.trim(),
            destination: destination.trim(),
            owner: req.user._id,
          });
        }
        bodyData.route = routeDoc._id;
      }
    }

    const item = await Model.create({ ...bodyData, owner: req.user._id, isApproved: true });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};


export const update = (Model) => async (req, res, next) => {
  // Validate ObjectId before proceeding
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID' });
  }

  try {
    let item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role !== 'admin' && item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bodyData = { ...req.body };
    if (Model.modelName === 'Bus' && bodyData.route && typeof bodyData.route === 'object') {
      const { origin, destination } = bodyData.route;
      if (origin && destination) {
        let routeDoc = await Route.findOne({
          origin: new RegExp(`^${origin.trim()}$`, 'i'),
          destination: new RegExp(`^${destination.trim()}$`, 'i'),
        });
        if (!routeDoc) {
          routeDoc = await Route.create({
            origin: origin.trim(),
            destination: destination.trim(),
            owner: req.user._id,
          });
        }
        bodyData.route = routeDoc._id;
      }
    }

    item = await Model.findByIdAndUpdate(req.params.id, bodyData, { new: true, runValidators: true });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const remove = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.user.role !== 'admin' && item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Model.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const approve = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved ?? true },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const getMyListings = (Model) => async (req, res, next) => {
  try {
    const items = await Model.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
