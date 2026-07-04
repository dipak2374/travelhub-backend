import express from 'express';
import Hotel from '../models/Hotel.js';
import { getAll, getOne, create, update, remove, approve, getMyListings } from '../controllers/genericController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getAll(Hotel));
router.get('/my', protect, authorize('travel_agency', 'admin'), getMyListings(Hotel));
router.get('/:id', getOne(Hotel, ['owner']));
router.post('/', protect, authorize('travel_agency', 'admin'), create(Hotel));
router.put('/:id', protect, authorize('travel_agency', 'admin'), update(Hotel));
router.delete('/:id', protect, authorize('travel_agency', 'admin'), remove(Hotel));
router.put('/:id/approve', protect, authorize('admin'), approve(Hotel));

router.post('/:id/images', protect, authorize('travel_agency', 'admin'), upload.array('images', 5), async (req, res, next) => {
  try {
    const urls = await Promise.all(req.files.map((f) => uploadToCloudinary(f.path)));
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, { $push: { images: { $each: urls } } }, { new: true });
    res.json({ success: true, data: hotel });
  } catch (error) {
    next(error);
  }
});

export default router;
