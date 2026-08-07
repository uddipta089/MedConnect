import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as authService from '../services/authService.js';
import User from '../models/User.js';

// @desc    Register a new patient
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerPatient(req.body);
  sendResponse(res, 201, 'Registration successful', { user, token });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token, refreshToken } = await authService.loginUser(email, password);
  sendResponse(res, 200, 'Login successful', { user, token, refreshToken });
});

// @desc    Refresh Token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new Error('Refresh token required');
  const { token } = await authService.refreshTokenService(refreshToken);
  sendResponse(res, 200, 'Token refreshed', { token });
});

// @desc    Logout user / clear cookie (if using cookies)
// @route   POST /api/v1/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res) => {
  sendResponse(res, 200, 'Logged out successfully');
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const resetToken = await authService.forgotPassword(email);
  
  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  // We are not throwing here so we can respond successfully even if email fails (in dev)
  try {
    // await sendEmail({ email, subject: 'Password reset token', message });
    console.log(message); // for testing
    sendResponse(res, 200, 'Email sent');
  } catch (error) {
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.params.resettoken, req.body.password);
  sendResponse(res, 200, 'Password updated successfully');
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  sendResponse(res, 200, 'Password changed successfully');
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  sendResponse(res, 200, 'User profile fetched successfully', { user });
});
