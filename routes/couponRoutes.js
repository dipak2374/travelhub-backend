import express from 'express';
import { getCoupons, createCoupon, validateCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCoupons);
router.post('/validate', protect, validateCoupon);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
