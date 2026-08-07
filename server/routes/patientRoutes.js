import express from 'express';
import {
  getMyProfile,
  updateProfile,
  uploadProfileImage,
  addFavourite,
  removeFavourite,
  getTimeline
} from '../controllers/patientController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { updatePatientProfileSchema } from '../validators/patientValidator.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Patient', 'Admin'));

router.get('/profile', getMyProfile);
router.get('/timeline', getTimeline);
router.put('/profile', validate(updatePatientProfileSchema), updateProfile);
router.post('/upload-profile', upload.single('image'), uploadProfileImage);

router.post('/favourites/:doctorId', addFavourite);
router.delete('/favourites/:doctorId', removeFavourite);

export default router;
