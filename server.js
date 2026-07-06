import path from 'path';
import { pathToFileURL } from 'url';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { configureEmail } from './config/email.js';
import Hotel from './models/Hotel.js';
import Flight from './models/Flight.js';
import Bus from './models/Bus.js';
import Car from './models/Car.js';
import Tour from './models/Tour.js';
import { createApp } from './app.js';

const { server, io } = createApp();
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  configureCloudinary();
  configureEmail();

  try {
    await Promise.all([
      Hotel.updateMany({ isApproved: { $ne: true } }, { isApproved: true }),
      Flight.updateMany({ isApproved: { $ne: true } }, { isApproved: true }),
      Bus.updateMany({ isApproved: { $ne: true } }, { isApproved: true }),
      Car.updateMany({ isApproved: { $ne: true } }, { isApproved: true }),
      Tour.updateMany({ isApproved: { $ne: true } }, { isApproved: true })
    ]);
    console.log('Successfully approved all unapproved listings in the database!');
  } catch (err) {
    console.error('Error auto-approving existing listings:', err);
  }

  server.listen(PORT, () => {
    console.log(`TravelHub server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startServer();
}

export { io, startServer };
