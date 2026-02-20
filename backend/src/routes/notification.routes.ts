import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread notifications count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

export default router;
