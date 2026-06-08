import Notification from '../models/Notification.js';

/**
 * @desc    Get user notifications sorted by newest first
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    // req.user._id is populated by protect middleware
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark a specific notification as read by ID
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    // Find notification by ID matching the authenticated user
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Update status and save
    notification.read = true;
    await notification.save();

    return res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark all unread notifications of the user as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    // Update all matching documents in bulk
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
