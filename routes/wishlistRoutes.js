import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlist);

export default router;
