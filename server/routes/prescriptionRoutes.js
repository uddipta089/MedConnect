import express from 'express';
import {
  createPrescription,
  getPrescriptionById,
  getPatientPrescriptions,
  downloadPrescriptionPDF
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createPrescriptionSchema } from '../validators/prescriptionValidator.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Doctor'), validate(createPrescriptionSchema), createPrescription);
router.get('/:id', authorize('Doctor', 'Patient'), getPrescriptionById);
router.get('/:id/download', authorize('Doctor', 'Patient'), downloadPrescriptionPDF);
router.get('/patient/:patientId', authorize('Doctor', 'Patient'), getPatientPrescriptions);

export default router;
