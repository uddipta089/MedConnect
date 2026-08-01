import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as appointmentService from '../services/appointmentService.js';
import * as telemedicineService from '../services/telemedicineService.js';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import sendEmail from '../utils/email.js';

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/v1/appointments/slots/:doctorId/:date
// @access  Public
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const slots = await appointmentService.generateAvailableSlots(req.params.doctorId, req.params.date);
  sendResponse(res, 200, 'Available slots fetched', slots);
});

// @desc    Book an appointment
// @route   POST /api/v1/appointments
// @access  Private/Patient
export const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.user.id, req.body);
  
  // Emitting Socket event for realtime notification
  const io = req.app.get('io');
  if (io) {
    io.to(`doctor:${req.body.doctorId}`).emit('appointmentCreated', {
      message: 'You have a new appointment request',
      appointment
    });
  }
  
  // Send Email Notification
  try {
    const p = await User.findById(req.user.id);
    await sendEmail({
      email: p.email,
      subject: 'Appointment Booked',
      html: `<h3>Your appointment is booked for ${appointment.date.toDateString()} at ${appointment.slot}</h3>`
    });
  } catch (err) {
    console.error('Email sending failed', err);
  }

  sendResponse(res, 201, 'Appointment booked successfully', appointment);
});

// @desc    Cancel an appointment
// @route   PUT /api/v1/appointments/cancel/:id
// @access  Private
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentStatus(
    req.params.id, 
    'Cancelled', 
    req.user.id, 
    req.body.cancellationReason
  );

  const io = req.app.get('io');
  if (io) {
    io.to(`patient:${appointment.patientId}`).emit('appointmentCancelled', { message: 'Your appointment was cancelled' });
    io.to(`doctor:${appointment.doctorId}`).emit('appointmentCancelled', { message: 'An appointment was cancelled' });
  }

  sendResponse(res, 200, 'Appointment cancelled', appointment);
});

// @desc    Get patient appointments
// @route   GET /api/v1/appointments/patient
// @access  Private/Patient
export const getPatientAppointments = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) throw new Error('Patient not found');

  const appointments = await Appointment.find({ patientId: patient._id })
    .populate('doctorId', 'userId specializationId')
    .sort('-date');
    
  sendResponse(res, 200, 'Appointments fetched', appointments);
});

// @desc    Get doctor appointments
// @route   GET /api/v1/appointments/doctor
// @access  Private/Doctor
export const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) throw new Error('Doctor not found');

  const appointments = await Appointment.find({ doctorId: doctor._id })
    .populate('patientId', 'userId')
    .sort('-date');
    
  sendResponse(res, 200, 'Appointments fetched', appointments);
});

// @desc    Generate QR Code for Appointment
// @route   GET /api/v1/appointments/:id/qr
// @access  Private/Patient
export const getAppointmentQR = asyncHandler(async (req, res) => {
  const qrDataUrl = await appointmentService.generateAppointmentQR(req.params.id, req.user.id);
  sendResponse(res, 200, 'QR Code generated', { qrCode: qrDataUrl });
});

// @desc    Check-in Appointment via QR Token
// @route   POST /api/v1/appointments/checkin/:token
// @access  Private/Doctor/Admin/Receptionist
export const processCheckIn = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.checkInAppointment(req.params.token);
  sendResponse(res, 200, 'Check-in successful', appointment);
});

// @desc    Reschedule Appointment
// @route   PUT /api/v1/appointments/:id/reschedule
// @access  Private/Patient
export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, slot } = req.body;
  if (!date || !slot) throw new Error('Date and slot are required to reschedule');
  
  const appointment = await appointmentService.rescheduleAppointment(req.params.id, date, slot, req.user.id);

  // Notify Doctor
  const io = req.app.get('io');
  if (io) {
    io.to(`doctor:${appointment.doctorId}`).emit('appointmentRescheduled', {
      message: 'An appointment has been rescheduled',
      appointment
    });
  }

  sendResponse(res, 200, 'Appointment rescheduled successfully', appointment);
});

// @desc    Generate Video Room URL
// @route   GET /api/v1/appointments/:id/video
// @access  Private/Doctor/Patient
export const generateVideoRoom = asyncHandler(async (req, res) => {
  const url = await telemedicineService.createVideoRoom(req.params.id);
  sendResponse(res, 200, 'Video room created', { url });
});
