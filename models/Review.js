import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' },
    itemModel: {
      type: String,
      enum: ['Hotel', 'Flight', 'Bus', 'Car', 'Tour'],
      required: true,
    },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ item: 1, itemModel: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
