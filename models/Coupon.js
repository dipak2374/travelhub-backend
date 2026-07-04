import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    applicableTypes: [{
      type: String,
      enum: ['hotel', 'flight', 'bus', 'car', 'tour', 'all'],
    }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
