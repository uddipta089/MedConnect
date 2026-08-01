import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as patientService from '../services/patientService.js';
import User from '../models/User.js';

// @desc    Get patient profile
// @route   GET /api/v1/patients/profile
// @access  Private/Patient
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await patientService.getPatientProfile(req.user.id);
  sendResponse(res, 200, 'Patient profile fetched successfully', profile);
});

// @desc    Update patient profile
// @route   PUT /api/v1/patients/profile
// @access  Private/Patient
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await patientService.updatePatientProfile(req.user.id, req.body);
  sendResponse(res, 200, 'Patient profile updated successfully', updatedProfile);
});

// @desc    Upload patient profile image
// @route   POST /api/v1/patients/upload-profile
// @access  Private/Patient
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }
  
  const user = await User.findById(req.user.id);
  user.profileImage = req.file.path;
  await user.save();
  
  sendResponse(res, 200, 'Profile image uploaded successfully', { url: req.file.path });
});

// @desc    Add favourite doctor
// @route   POST /api/v1/patients/favourites/:doctorId
// @access  Private/Patient
export const addFavourite = asyncHandler(async (req, res) => {
  const favourites = await patientService.addFavouriteDoctor(req.user.id, req.params.doctorId);
  sendResponse(res, 200, 'Doctor added to favourites', favourites);
});

// @desc    Remove favourite doctor
// @route   DELETE /api/v1/patients/favourites/:doctorId
// @access  Private/Patient
export const removeFavourite = asyncHandler(async (req, res) => {
  const favourites = await patientService.removeFavouriteDoctor(req.user.id, req.params.doctorId);
  sendResponse(res, 200, 'Doctor removed from favourites', favourites);
});

// @desc    Get patient health timeline
// @route   GET /api/v1/patients/timeline
// @access  Private/Patient
export const getTimeline = asyncHandler(async (req, res) => {
  const timeline = await patientService.getHealthTimeline(req.user.id);
  sendResponse(res, 200, 'Health timeline fetched', timeline);
});
