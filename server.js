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
const PORT = Number(process.env.PORT) || 5000;

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

  const tryListen = (port, attempts = 0) => {
    const maxAttempts = 10;

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        if (attempts < maxAttempts) {
          console.error(`Port ${port} is already in use. Trying ${nextPort}...`);
          tryListen(nextPort, attempts + 1);
        } else {
          console.error('No free ports available for the server.');
          process.exit(1);
        }
      } else {
        console.error('Server startup error:', err);
        process.exit(1);
      }
    });

    server.listen(port, () => {
      console.log(`TravelHub server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  };

  tryListen(PORT);
};

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  startServer();
}

export { io, startServer };
