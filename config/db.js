import mongoose from 'mongoose';

const connectDB = async () => {
  // Development fallback only. For production deployments on Render, set MONGODB_URI in Render Environment Variables.
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/travelhub';

  if (!mongoUri) {
    console.error('MongoDB connection string is missing. Set MONGODB_URI or MONGO_URI in the environment (for Render, add it under Environment Variables).');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
