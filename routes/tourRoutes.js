import express from 'express';
import Tour from '../models/Tour.js';
import { getAll, getOne, create, update, remove, approve, getMyListings } from '../controllers/genericController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getAll(Tour));
router.get('/my', protect, authorize('travel_agency', 'admin'), getMyListings(Tour));
router.get('/:id', getOne(Tour, ['owner']));
router.post('/', protect, authorize('travel_agency', 'admin'), create(Tour));
router.put('/:id', protect, authorize('travel_agency', 'admin'), update(Tour));
router.delete('/:id', protect, authorize('travel_agency', 'admin'), remove(Tour));
router.put('/:id/approve', protect, authorize('admin'), approve(Tour));

router.post('/:id/images', protect, authorize('travel_agency', 'admin'), upload.array('images', 5), async (req, res, next) => {
  try {
    const urls = await Promise.all(req.files.map((f) => uploadToCloudinary(f.path)));
    const tour = await Tour.findByIdAndUpdate(req.params.id, { $push: { images: { $each: urls } } }, { new: true });
    res.json({ success: true, data: tour });
  } catch (error) {
    next(error);
  }
});

export default router;
