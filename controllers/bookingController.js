import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Flight from '../models/Flight.js';
import Bus from '../models/Bus.js';
import Car from '../models/Car.js';
import Tour from '../models/Tour.js';
import Coupon from '../models/Coupon.js';
import { createRazorpayOrder, createStripePaymentIntent, verifyRazorpayPayment } from '../services/paymentService.js';
import { sendBookingConfirmation } from '../services/emailService.js';
import { notifyUser } from '../services/notificationService.js';

const modelMap = { hotel: Hotel, flight: Flight, bus: Bus, car: Car, tour: Tour };
const itemModelMap = { hotel: 'Hotel', flight: 'Flight', bus: 'Bus', car: 'Car', tour: 'Tour' };

export const createBooking = async (req, res, next) => {
  try {
    const { bookingType, itemId, checkIn, checkOut, travelDate, passengers, guestDetails, seatNumbers, flightClass, couponCode, specialRequests, seatCharges = 0, addOnCharges = 0 } = req.body;

    const Model = modelMap[bookingType];
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid booking type' });

    const item = await Model.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    let totalAmount = 0;
    const numPassengers = passengers || 1;

    if (bookingType === 'hotel') {
      const nights = checkIn && checkOut
        ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
        : 1;
      totalAmount = item.pricePerNight * nights;
    } else if (bookingType === 'flight') {
      const classPrice = item.price[flightClass || 'economy'] || item.price.economy;
      totalAmount = (classPrice * numPassengers) + seatCharges + addOnCharges;
    } else if (bookingType === 'car') {
      const days = checkIn && checkOut
        ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
        : 1;
      totalAmount = item.pricePerDay * days;
    } else {
      totalAmount = (item.price || item.pricePerDay || item.pricePerNight) * numPassengers;
    }

    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() },
      });
      if (coupon && coupon.usedCount < coupon.usageLimit) {
        if (coupon.discountType === 'percentage') {
          discount = (totalAmount * coupon.discountValue) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = coupon.discountValue;
        }
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    totalAmount = Math.max(0, totalAmount - discount);

    const booking = await Booking.create({
      user: req.user._id,
      bookingType,
      item: itemId,
      itemModel: itemModelMap[bookingType],
      checkIn,
      checkOut,
      travelDate,
      passengers: numPassengers,
      guestDetails,
      seatNumbers,
      flightClass,
      totalAmount,
      discount,
      coupon: coupon?._id,
      specialRequests,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status && status !== 'all') filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('item')
      .populate('coupon')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getPartnerBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const ownerItems = await Promise.all([
      Hotel.find({ owner: req.user._id }).select('_id'),
      Flight.find({ owner: req.user._id }).select('_id'),
      Bus.find({ owner: req.user._id }).select('_id'),
      Car.find({ owner: req.user._id }).select('_id'),
      Tour.find({ owner: req.user._id }).select('_id'),
    ]);

    const itemIds = ownerItems.flat().map((i) => i._id);
    const filter = { item: { $in: itemIds } };
    if (status && status !== 'all') filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('item')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('item')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, data: bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item')
      .populate('user', 'name email phone')
      .populate('coupon');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('item');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const requestRefund = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'cancelled' && booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Cannot request refund for this booking' });
    }

    // Check if refund is eligible (within 24 hours for most items, or per policy)
    const createdDate = new Date(booking.createdAt);
    const hoursElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    
    let isEligible = true;
    let refundAmount = booking.totalAmount;

    if (booking.bookingType === 'flight') {
      // Flights: can be cancelled up to 2 hours before departure
      isEligible = hoursElapsed < 2;
      if (!isEligible) {
        refundAmount = booking.totalAmount * 0.5; // 50% refund if outside window
      }
    } else if (booking.bookingType === 'hotel') {
      // Hotels: free cancellation up to 24 hours
      isEligible = hoursElapsed < 24;
      if (!isEligible) {
        refundAmount = booking.totalAmount * 0.8; // 80% refund if outside window
      }
    } else {
      // Bus, Car, Tour: 24 hours
      isEligible = hoursElapsed < 24;
      if (!isEligible) {
        refundAmount = booking.totalAmount * 0.7; // 70% refund if outside window
      }
    }

    booking.refundStatus = isEligible ? 'approved' : 'partial';
    booking.refundAmount = refundAmount;
    booking.refundRequestedAt = new Date();
    
    // If already cancelled, mark as processing
    if (booking.status === 'cancelled') {
      booking.refundStatus = 'processing';
    }

    await booking.save();

    await notifyUser(req.io, booking.user._id, {
      title: 'Refund Request Received',
      message: `Your refund request for ${booking.bookingReference} has been received. Refund of ${refundAmount} will be processed within 5-7 business days.`,
      type: 'refund',
      link: `/refunds`,
    });

    res.json({ 
      success: true, 
      data: booking,
      message: isEligible ? 'Refund approved!' : `Partial refund of ${refundAmount} will be processed` 
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId, method = 'razorpay' } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (method === 'stripe') {
      const paymentIntent = await createStripePaymentIntent(booking.totalAmount);
      return res.json({ success: true, paymentIntent, method: 'stripe' });
    }

    const order = await createRazorpayOrder(booking.totalAmount, 'INR', booking.bookingReference);
    res.json({ success: true, order, method: 'razorpay', key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, method = 'razorpay' } = req.body;
    const booking = await Booking.findById(bookingId).populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Verify Razorpay signature if it's a real Razorpay payment
    if (method === 'razorpay' && razorpay_signature) {
      const isValid = verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!isValid) {
        booking.paymentStatus = 'failed';
        await booking.save();
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    booking.paymentStatus = 'paid';
    booking.paymentId = razorpay_payment_id || paymentId;
    booking.paymentMethod = method;
    booking.status = 'confirmed';
    await booking.save();

    await sendBookingConfirmation(booking.user.email, booking);
    await notifyUser(req.io, booking.user._id, {
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingReference} has been confirmed.`,
      type: 'booking',
      link: `/bookings/${booking._id}`,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalBookings, totalRevenue, pendingBookings, confirmedBookings] = await Promise.all([
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
    ]);

    const bookingsByType = await Booking.aggregate([
      { $group: { _id: '$bookingType', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const [totalUsers, totalPartnerAccounts, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: ['travel_agency', 'car_rental_partner', 'bus_operator', 'airline_partner'] } }),
      User.countDocuments({
        $or: [
          { role: 'travel_agency', 'agencyProfile.isApproved': false },
          { role: { $in: ['car_rental_partner', 'bus_operator', 'airline_partner'] }, 'partnerProfile.isApproved': false },
        ],
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingBookings,
        confirmedBookings,
        bookingsByType,
        monthlyRevenue,
        totalUsers,
        totalPartnerAccounts,
        pendingApprovals,
      },
    });
  } catch (error) {
    next(error);
  }
};
