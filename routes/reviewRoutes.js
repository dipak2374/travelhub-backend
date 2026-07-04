import express from 'express';
import { createReview, getReviews, deleteReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:itemModel/:itemId', getReviews);
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

export default router;
