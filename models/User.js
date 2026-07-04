import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = [
  'customer',
  'travel_agency',
  'car_rental_partner',
  'bus_operator',
  'airline_partner',
  'admin',
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ROLES,
      default: 'customer',
    },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'wishlistModel' }],
    wishlistModel: [{ type: String, enum: ['Hotel', 'Flight', 'Bus', 'Car', 'Tour'] }],
    agencyProfile: {
      companyName: String,
      licenseNumber: String,
      description: String,
      address: String,
      isApproved: { type: Boolean, default: false },
    },
    partnerProfile: {
      companyName: String,
      description: String,
      address: String,
      isApproved: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
