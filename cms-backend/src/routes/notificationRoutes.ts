import express from 'express';
import {
  getNotifications,
  markAllRead,
  clearAll,
  markRead,
  deleteNotification,
  getUnReadNotifications,
} from '../controller/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.get('/unread',getUnReadNotifications)
router.post('/markAllRead', markAllRead);
router.delete('/clearAll', clearAll);
router.post('/:id/markRead', markRead);
router.delete('/:id', deleteNotification);

export default router; 