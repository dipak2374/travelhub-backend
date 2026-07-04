import express from 'express';
import {
  createBooking,
  getMyBookings,
  getPartnerBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  requestRefund,
  createPaymentOrder,
  verifyPayment,
  getDashboardStats,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/partner', protect, authorize('travel_agency', 'car_rental_partner', 'bus_operator', 'airline_partner', 'admin'), getPartnerBookings);
router.get('/stats', protect, authorize('admin'), getDashboardStats);
router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/status', protect, authorize('admin', 'travel_agency', 'car_rental_partner', 'bus_operator', 'airline_partner'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/refund', protect, requestRefund);
router.post('/payment/create-order', protect, createPaymentOrder);
router.post('/payment/verify', protect, verifyPayment);

export default router;
