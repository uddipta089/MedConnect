import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as notificationService from '../services/notificationService.js';

// @desc    Get all user notifications
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user.id);
  sendResponse(res, 200, 'Notifications fetched successfully', notifications);
});

// @desc    Get unread notifications
// @route   GET /api/v1/notifications/unread
// @access  Private
export const getUnread = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUnreadNotifications(req.user.id);
  sendResponse(res, 200, 'Unread notifications fetched successfully', notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/read/:id
// @access  Private
export const markRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);
  sendResponse(res, 200, 'Notification marked as read');
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  sendResponse(res, 200, 'All notifications marked as read');
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const removeNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  sendResponse(res, 200, 'Notification deleted');
});
