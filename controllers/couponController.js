import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true, validUntil: { $gte: new Date() } });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount, bookingType } = req.body;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is $${coupon.minOrderAmount}`,
      });
    }

    if (coupon.applicableTypes.length && !coupon.applicableTypes.includes('all') && !coupon.applicableTypes.includes(bookingType)) {
      return res.status(400).json({ success: false, message: 'Coupon not applicable for this booking type' });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ success: true, data: { coupon, discount, finalAmount: Math.max(0, amount - discount) } });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
};
