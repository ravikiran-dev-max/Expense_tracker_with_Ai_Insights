import mongoose from 'mongoose';

/**
 * Notification Schema
 * Tracks budget alert notifications and system warnings sent to users.
 */
const notificationSchema = new mongoose.Schema(
  {
    // Reference to the User who owns this notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The notification message content
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    // Type of notification to control UI rendering styles (warning, info, success)
    type: {
      type: String,
      enum: ['warning', 'info', 'success'],
      default: 'info',
    },
    // Indicates if the user has viewed the notification
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically creates `createdAt` and `updatedAt` date fields
    timestamps: true,
  }
);

export default mongoose.model('Notification', notificationSchema);
