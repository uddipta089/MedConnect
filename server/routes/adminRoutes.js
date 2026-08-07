import express from 'express';
import {
  getDashboardStats,
  verifyDoctor,
  toggleBlockUser,
  createSpecialization,
  createHospital,
  exportUsers,
  searchPatients,
  searchAppointments
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/dashboard', getDashboardStats);
router.get('/export/users', exportUsers);
router.put('/doctors/:id/verify', verifyDoctor);
router.put('/users/:id/block', toggleBlockUser);
router.post('/specializations', createSpecialization);
router.post('/hospitals', createHospital);
router.get('/search/patients', searchPatients);
router.get('/search/appointments', searchAppointments);

export default router;
