import Review from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Flight from '../models/Flight.js';
import Bus from '../models/Bus.js';
import Car from '../models/Car.js';
import Tour from '../models/Tour.js';

const modelMap = { Hotel, Flight, Bus, Car, Tour };

const updateItemRating = async (itemId, itemModel) => {
  const stats = await Review.aggregate([
    { $match: { item: itemId, itemModel, isApproved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const Model = modelMap[itemModel];
  if (Model) {
    await Model.findByIdAndUpdate(itemId, {
      averageRating: stats[0]?.avg ? Math.round(stats[0].avg * 10) / 10 : 0,
      reviewCount: stats[0]?.count || 0,
    });
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { item, itemModel, rating, title, comment, booking } = req.body;

    const existing = await Review.findOne({ user: req.user._id, item, itemModel });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this item' });
    }

    const review = await Review.create({
      user: req.user._id,
      item,
      itemModel,
      rating,
      title,
      comment,
      booking,
    });

    await updateItemRating(item, itemModel);
    await review.populate('user', 'name avatar');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { itemId, itemModel } = req.params;
    const reviews = await Review.find({ item: itemId, itemModel, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { item, itemModel } = review;
    await review.deleteOne();
    await updateItemRating(item, itemModel);

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
