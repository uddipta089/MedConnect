import Notification from '../models/Notification.js';

export const getUserNotifications = async (userId) => {
  return await Notification.find({ receiverId: userId })
    .populate('senderId', 'firstName lastName')
    .sort('-createdAt');
};

export const getUnreadNotifications = async (userId) => {
  return await Notification.find({ receiverId: userId, isRead: false })
    .populate('senderId', 'firstName lastName')
    .sort('-createdAt');
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  
  if (notification.receiverId.toString() !== userId) {
    throw new Error('Not authorized');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ receiverId: userId, isRead: false }, { isRead: true });
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new Error('Notification not found');
  
  if (notification.receiverId.toString() !== userId) {
    throw new Error('Not authorized');
  }

  await notification.deleteOne();
};

export const createNotification = async (notificationData) => {
  return await Notification.create(notificationData);
};
