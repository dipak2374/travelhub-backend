import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingType: {
      type: String,
      enum: ['hotel', 'flight', 'bus', 'car', 'tour'],
      required: true,
    },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' },
    itemModel: {
      type: String,
      enum: ['Hotel', 'Flight', 'Bus', 'Car', 'Tour'],
      required: true,
    },
    bookingReference: { type: String, unique: true },
    checkIn: Date,
    checkOut: Date,
    travelDate: Date,
    passengers: { type: Number, default: 1 },
    guestDetails: [{
      name: String,
      email: String,
      phone: String,
      age: Number,
    }],
    seatNumbers: [String],
    flightClass: { type: String, enum: ['economy', 'business', 'firstClass'], default: 'economy' },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'cash'], default: 'razorpay' },
    paymentId: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'partial'],
      default: null,
    },
    refundAmount: { type: Number, default: 0 },
    refundRequestedAt: Date,
    specialRequests: String,
  },
  { timestamps: true }
);

bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference = `TH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
