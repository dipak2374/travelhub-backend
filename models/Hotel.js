import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      address: String,
      city: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: { lat: Number, lng: Number },
    },
    images: [String],
    amenities: [String],
    starRating: { type: Number, min: 1, max: 5, default: 3 },
    pricePerNight: { type: Number, required: true, min: 0 },
    totalRooms: { type: Number, default: 10 },
    availableRooms: { type: Number, default: 10 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hotelSchema.index({ 'location.city': 1, pricePerNight: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
