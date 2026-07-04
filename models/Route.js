import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    distance: { type: Number },
    duration: { type: Number },
    stops: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Route = mongoose.model('Route', routeSchema);
export default Route;
