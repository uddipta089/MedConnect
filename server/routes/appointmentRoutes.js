import express from 'express';
import {
  getAvailableSlots,
  createAppointment,
  cancelAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentQR,
  processCheckIn,
  rescheduleAppointment,
  generateVideoRoom
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { audit } from '../middleware/audit.js';
import { validate } from '../middleware/validate.js';
import { bookAppointmentSchema, cancelAppointmentSchema } from '../validators/appointmentValidator.js';

const router = express.Router();

router.get('/slots/:doctorId/:date', getAvailableSlots);

router.use(protect);

router.post('/', authorize('Patient'), validate(bookAppointmentSchema), createAppointment);
router.put('/cancel/:id', authorize('Patient', 'Doctor', 'Admin'), validate(cancelAppointmentSchema), audit('CANCEL_APPOINTMENT', 'Appointment'), cancelAppointment);
router.put('/:id/reschedule', authorize('Patient'), audit('RESCHEDULE_APPOINTMENT', 'Appointment'), rescheduleAppointment);

router.get('/patient', authorize('Patient'), getPatientAppointments);
router.get('/doctor', authorize('Doctor'), getDoctorAppointments);
router.get('/:id/qr', authorize('Patient'), getAppointmentQR);
router.get('/:id/video', authorize('Patient', 'Doctor'), generateVideoRoom);
router.post('/checkin/:token', authorize('Doctor', 'Admin'), audit('CHECKIN_APPOINTMENT', 'Appointment'), processCheckIn);

export default router;
