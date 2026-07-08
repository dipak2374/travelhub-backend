import dotenv from 'dotenv';
import mongoose from 'mongoose';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const getMongoUri = () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URL;

  if (process.env.NODE_ENV === 'production') {
    return uri;
  }

  return uri || 'mongodb://127.0.0.1:27017/travelhub';
};

const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    console.error(
      'MongoDB connection string is missing. Set MONGODB_URI or MONGO_URI in the environment.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    if (
      process.env.NODE_ENV !== 'production' &&
      mongoUri.startsWith('mongodb+srv://') &&
      error.message.includes('querySrv')
    ) {
      console.error(
        'Atlas SRV lookup failed. Verify your cluster host, network access, and DNS settings. For local development, use a local URI like mongodb://127.0.0.1:27017/travelhub.'
      );
    }
    process.exit(1);
  }
};

export default connectDB;
