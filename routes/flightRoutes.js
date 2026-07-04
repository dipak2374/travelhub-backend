import express from 'express';
import Flight from '../models/Flight.js';
import { getAll, getOne, create, update, remove, approve, getMyListings } from '../controllers/genericController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAll(Flight));
router.get('/my', protect, authorize('airline_partner', 'admin'), getMyListings(Flight));
router.get('/:id', getOne(Flight, ['owner']));
router.post('/', protect, authorize('airline_partner', 'admin'), create(Flight));
router.put('/:id', protect, authorize('airline_partner', 'admin'), update(Flight));
router.delete('/:id', protect, authorize('airline_partner', 'admin'), remove(Flight));
router.put('/:id/approve', protect, authorize('admin'), approve(Flight));

export default router;
