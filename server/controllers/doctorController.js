import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as doctorService from '../services/doctorService.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// @desc    Get logged in doctor profile
// @route   GET /api/v1/doctors/profile
// @access  Private/Doctor
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await doctorService.getDoctorProfile(req.user.id);
  sendResponse(res, 200, 'Doctor profile fetched successfully', profile);
});

// @desc    Update doctor profile
// @route   PUT /api/v1/doctors/profile
// @access  Private/Doctor
export const updateProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await doctorService.updateDoctorProfile(req.user.id, req.body);
  sendResponse(res, 200, 'Doctor profile updated successfully', updatedProfile);
});

// @desc    Search doctors
// @route   GET /api/v1/doctors/search
// @access  Public
export const search = asyncHandler(async (req, res) => {
  const result = await doctorService.searchDoctors(req.query);
  sendResponse(res, 200, 'Doctors fetched successfully', result.doctors, null);
});

// @desc    Get doctor by ID
// @route   GET /api/v1/doctors/:id
// @access  Public
export const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'firstName lastName email profileImage')
    .populate('specializationId', 'name')
    .populate('hospitalId', 'name address city');
  
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  
  sendResponse(res, 200, 'Doctor fetched successfully', doctor);
});

// @desc    Update doctor availability
// @route   PUT /api/v1/doctors/availability
// @access  Private/Doctor
export const setAvailability = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });
  const availability = await doctorService.updateAvailability(doctor._id, req.body);
  sendResponse(res, 200, 'Availability updated successfully', availability);
});

// @desc    Add Leave (Unavailable Date)
// @route   POST /api/v1/doctors/leave
// @access  Private/Doctor
export const setLeave = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!req.body.date) throw new Error('Date is required');
  const availability = await doctorService.addLeave(doctor._id, req.body.date);
  sendResponse(res, 200, 'Leave added successfully', availability);
});

// @desc    Upload profile image
// @route   POST /api/v1/doctors/upload-profile
// @access  Private/Doctor
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

// @desc    Get Availability Heatmap
// @route   GET /api/v1/doctors/:id/heatmap
// @access  Public
export const getHeatmap = asyncHandler(async (req, res) => {
  const heatmap = await doctorService.getAvailabilityHeatmap(req.params.id);
  sendResponse(res, 200, 'Heatmap data fetched', heatmap);
});
