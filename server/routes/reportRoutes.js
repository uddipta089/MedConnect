import express from 'express';
import {
  uploadMedicalReport,
  getMyReports,
  deleteMedicalReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('file'), uploadMedicalReport);
router.get('/patient', authorize('Patient'), getMyReports);
router.delete('/:id', deleteMedicalReport);

export default router;
