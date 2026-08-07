import express from 'express';
import {
  getNotifications,
  getUnread,
  markRead,
  markAllRead,
  removeNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread', getUnread);
router.put('/read-all', markAllRead);
router.put('/read/:id', markRead);
router.delete('/:id', removeNotification);

export default router;
