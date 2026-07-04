import express from 'express';
import Bus from '../models/Bus.js';
import { getAll, getOne, create, update, remove, approve, getMyListings } from '../controllers/genericController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAll(Bus, ['route']));
router.get('/my', protect, authorize('bus_operator', 'admin'), getMyListings(Bus));
router.get('/:id', getOne(Bus, ['route', 'owner']));
router.post('/', protect, authorize('bus_operator', 'admin'), create(Bus));
router.put('/:id', protect, authorize('bus_operator', 'admin'), update(Bus));
router.delete('/:id', protect, authorize('bus_operator', 'admin'), remove(Bus));
router.put('/:id/approve', protect, authorize('admin'), approve(Bus));

export default router;
