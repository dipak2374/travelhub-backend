import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true },
    operator: { type: String, required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    busType: { type: String, enum: ['AC', 'Non-AC', 'Sleeper', 'Luxury'], default: 'AC' },
    totalSeats: { type: Number, default: 40 },
    availableSeats: { type: Number, default: 40 },
    seatLayout: { rows: Number, columns: Number },
    price: { type: Number, required: true },
    amenities: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Bus = mongoose.model('Bus', busSchema);
export default Bus;
