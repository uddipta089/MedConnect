import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as adminService from '../services/adminService.js';
import Specialization from '../models/Specialization.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import { generateCSV, generateExcel, generatePDF } from '../utils/exportHelper.js';

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendResponse(res, 200, 'Dashboard stats fetched', stats);
});

// @desc    Get all doctors (Admin)
// @route   GET /api/v1/admin/doctors
// @access  Private/Admin
export const getAllDoctorsAdmin = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().populate('userId', 'firstName lastName email');
  sendResponse(res, 200, 'Doctors fetched successfully', doctors);
});

// @desc    Verify doctor
// @route   PUT /api/v1/admin/doctors/:id/verify
// @access  Private/Admin
export const verifyDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.verifyDoctor(req.params.id);
  sendResponse(res, 200, 'Doctor verified successfully', doctor);
});

// @desc    Toggle block user
// @route   PUT /api/v1/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await adminService.blockUser(req.params.id);
  sendResponse(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user);
});

// @desc    Create specialization
// @route   POST /api/v1/admin/specializations
// @access  Private/Admin
export const createSpecialization = asyncHandler(async (req, res) => {
  const spec = await Specialization.create(req.body);
  sendResponse(res, 201, 'Specialization created', spec);
});

// @desc    Create hospital
// @route   POST /api/v1/admin/hospitals
// @access  Private/Admin
export const createHospital = asyncHandler(async (req, res) => {
  const hospital = await Hospital.create(req.body);
  sendResponse(res, 201, 'Hospital created', hospital);
});

// @desc    Export users data
// @route   GET /api/v1/admin/export/users?format=csv|excel|pdf
// @access  Private/Admin
export const exportUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('firstName lastName email role -_id').lean();
  const format = req.query.format || 'csv';

  if (format === 'csv') {
    const csv = generateCSV(users, ['firstName', 'lastName', 'email', 'role']);
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    return res.send(csv);
  }

  if (format === 'excel') {
    const buffer = await generateExcel(users, ['firstName', 'lastName', 'email', 'role'], 'Users');
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('users.xlsx');
    return res.send(buffer);
  }

  if (format === 'pdf') {
    res.header('Content-Type', 'application/pdf');
    res.attachment('users.pdf');
    return generatePDF(users, 'User List', res);
  }

  res.status(400);
  throw new Error('Invalid format');
});

// @desc    Search Patients
// @route   GET /api/v1/admin/search/patients
// @access  Private/Admin
export const searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const patients = await User.find({
    role: 'Patient',
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).select('-password');
  sendResponse(res, 200, 'Patients found', patients);
});

// @desc    Search Appointments
// @route   GET /api/v1/admin/search/appointments
// @access  Private/Admin
export const searchAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);
    filter.date = { $gte: start, $lte: end };
  }
  
  const appointments = await Appointment.find(filter)
    .populate('patientId')
    .populate('doctorId');
  sendResponse(res, 200, 'Appointments found', appointments);
});
