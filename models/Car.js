import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Economy', 'Compact', 'SUV', 'Luxury', 'Van'],
      default: 'Economy',
    },
    transmission: { type: String, enum: ['Automatic', 'Manual'], default: 'Automatic' },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], default: 'Petrol' },
    seats: { type: Number, default: 5 },
    pricePerDay: { type: Number, required: true },
    images: [String],
    features: [String],
    location: {
      city: { type: String, required: true },
      address: String,
      coordinates: { lat: Number, lng: Number },
    },
    isAvailable: { type: Boolean, default: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

carSchema.index({ 'location.city': 1, pricePerDay: 1 });

const Car = mongoose.model('Car', carSchema);
export default Car;
