import express from 'express';
import { bootstrapAdmin, register, login, sendOTP, verifyOTP, getMe, updateProfile, getAllUsers, getUserById, createUser, updateUser, deleteUser, updateUserStatus, approvePartner } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/bootstrap-admin', bootstrapAdmin);
router.post('/register', register);
router.post('/login', login);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.post('/users', protect, authorize('admin'), createUser);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.put('/users/:id/status', protect, authorize('admin'), updateUserStatus);
router.put('/users/:id/approve', protect, authorize('admin'), approvePartner);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
