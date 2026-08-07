import express from 'express';
import {
  getMyProfile,
  updateProfile,
  search,
  getDoctorById,
  setAvailability,
  setLeave,
  uploadProfileImage,
  getHeatmap
} from '../controllers/doctorController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { updateDoctorProfileSchema, updateAvailabilitySchema } from '../validators/doctorValidator.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.get('/search', search);
router.get('/:id', getDoctorById);
router.get('/:id/heatmap', getHeatmap);

// Protected Doctor routes
router.use(protect);
router.use(authorize('Doctor'));

router.get('/profile/me', getMyProfile);
router.put('/profile', validate(updateDoctorProfileSchema), updateProfile);
router.put('/availability', setAvailability);
router.post('/leave', setLeave);
router.post('/upload-profile', upload.single('image'), uploadProfileImage);

export default router;
