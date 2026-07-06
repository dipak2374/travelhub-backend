import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://dipakchavda:your_password@cluster0.k7qg1jh.mongodb.net/?appName=Cluster0';

  if (!mongoUri || mongoUri.includes('your_password')) {
    console.error('MongoDB connection string is missing or still using the placeholder password.');
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
