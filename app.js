import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import busRoutes from './routes/busRoutes.js';
import carRoutes from './routes/carRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllowedOrigins = () => {
  const configuredOrigins = [process.env.CLIENT_URL]
    .filter(Boolean)
    .map((origin) => origin.trim());

  const localOrigins = ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173'];

  return [...new Set([...configuredOrigins, ...localOrigins])];
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.includes(origin)) return true;

  return /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    || /^(https?:\/\/)([a-z0-9-]+\.)+(vercel\.app|vercel\.dev|now\.sh)(:\d+)?$/i.test(origin);
};

export const createApp = () => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, isAllowedOrigin(origin));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.use(cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  }));
  // Security middlewares
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'TravelHub API is running', timestamp: new Date().toISOString() });
  });

  app.get('/api/db-status', async (req, res) => {
    try {
      await mongoose.connection.db.admin().ping();
      res.json({ connected: true, message: 'MongoDB is connected' });
    } catch (err) {
      console.error('DB status error:', err);
      res.status(500).json({ connected: false, error: err.message });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/hotels', hotelRoutes);
  app.use('/api/flights', flightRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/buses', busRoutes);
  app.use('/api/cars', carRoutes);
  app.use('/api/tours', tourRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/wishlist', wishlistRoutes);

  app.use(errorHandler);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return { app, server, io };
};

const { app } = createApp();

export default app;
