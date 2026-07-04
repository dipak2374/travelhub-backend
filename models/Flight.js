import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    origin: {
      city: { type: String, required: true },
      airport: { type: String, required: true },
      code: { type: String, required: true },
    },
    destination: {
      city: { type: String, required: true },
      airport: { type: String, required: true },
      code: { type: String, required: true },
    },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    price: {
      economy: { type: Number, required: true },
      business: { type: Number, default: 0 },
      firstClass: { type: Number, default: 0 },
    },
    totalSeats: { type: Number, default: 180 },
    availableSeats: { type: Number, default: 180 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

flightSchema.index({ 'origin.code': 1, 'destination.code': 1, departureTime: 1 });

const Flight = mongoose.model('Flight', flightSchema);
export default Flight;
