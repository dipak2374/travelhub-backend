import express from 'express';
import Route from '../models/Route.js';
import { getAll, getOne, create, update, remove, getMyListings } from '../controllers/genericController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAll(Route));
router.get('/my', protect, authorize('bus_operator', 'admin'), getMyListings(Route));
router.get('/:id', getOne(Route));
router.post('/', protect, authorize('bus_operator', 'admin'), create(Route));
router.put('/:id', protect, authorize('bus_operator', 'admin'), update(Route));
router.delete('/:id', protect, authorize('bus_operator', 'admin'), remove(Route));

export default router;
