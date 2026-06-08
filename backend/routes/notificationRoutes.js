import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

// Apply auth protection middleware to all notification endpoints
router.use(protect);

// GET /api/notifications - Retrieve notifications list
router.get('/', getNotifications);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark specific notification as read by ID
router.put('/:id/read', markAsRead);

export default router;
