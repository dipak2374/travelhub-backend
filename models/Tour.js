import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    destination: { type: String, required: true },
    duration: { type: Number, required: true },
    durationUnit: { type: String, enum: ['days', 'hours'], default: 'days' },
    price: { type: Number, required: true },
    maxGroupSize: { type: Number, default: 20 },
    images: [String],
    itinerary: [{ day: Number, title: String, description: String }],
    inclusions: [String],
    exclusions: [String],
    startDates: [Date],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
