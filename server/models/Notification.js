import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Appointment', 'Prescription', 'Medical Report', 'Reminder', 'System', 'Announcement'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    redirectUrl: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ receiverId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
