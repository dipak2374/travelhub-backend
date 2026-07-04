import express from 'express';
import Car from '../models/Car.js';
import { getAll, getOne, create, update, remove, approve, getMyListings } from '../controllers/genericController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getAll(Car));
router.get('/my', protect, authorize('car_rental_partner', 'admin'), getMyListings(Car));
router.get('/:id', getOne(Car, ['owner']));
router.post('/', protect, authorize('car_rental_partner', 'admin'), create(Car));
router.put('/:id', protect, authorize('car_rental_partner', 'admin'), update(Car));
router.delete('/:id', protect, authorize('car_rental_partner', 'admin'), remove(Car));
router.put('/:id/approve', protect, authorize('admin'), approve(Car));

router.post('/:id/images', protect, authorize('car_rental_partner', 'admin'), upload.array('images', 5), async (req, res, next) => {
  try {
    const urls = await Promise.all(req.files.map((f) => uploadToCloudinary(f.path)));
    const car = await Car.findByIdAndUpdate(req.params.id, { $push: { images: { $each: urls } } }, { new: true });
    res.json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
});

export default router;
