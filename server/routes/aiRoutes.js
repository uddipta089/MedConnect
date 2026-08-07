import express from 'express';
import {
  symptomChecker,
  summarizeReport,
  chat
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  symptomCheckerSchema,
  reportSummarySchema,
  chatSchema
} from '../validators/aiValidator.js';

const router = express.Router();

router.use(protect);

router.post('/symptom-checker', validate(symptomCheckerSchema), symptomChecker);
router.post('/report-summary', validate(reportSummarySchema), summarizeReport);
router.post('/chat', validate(chatSchema), chat);

export default router;
