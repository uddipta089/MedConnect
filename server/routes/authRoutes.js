import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerPatientSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validate(registerPatientSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:resettoken', validate(resetPasswordSchema), resetPassword);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.get('/profile', protect, getProfile);

export default router;
