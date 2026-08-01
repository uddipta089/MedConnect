import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as prescriptionService from '../services/prescriptionService.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import sendEmail from '../utils/email.js';
import PDFDocument from 'pdfkit';
import Doctor from '../models/Doctor.js';

// @desc    Generate prescription
// @route   POST /api/v1/prescriptions
// @access  Private/Doctor
export const createPrescription = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user.id });
  if (!doctor) throw new Error('Doctor profile not found');

  const prescription = await prescriptionService.generatePrescription(doctor._id.toString(), req.body);
  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`patient:${req.body.patientId}`).emit('prescriptionCreated', {
      message: 'A new prescription has been added to your profile',
      prescription
    });
  }

  // Send Email Notification
  try {
    const patient = await Patient.findById(req.body.patientId).populate('userId');
    if (patient && patient.userId && patient.userId.email) {
      await sendEmail({
        email: patient.userId.email,
        subject: 'New Prescription Ready',
        html: `<h3>Your doctor has issued a new prescription for your recent appointment.</h3>
               <p>Please log in to MedConnect AI to view or download it.</p>`
      });
    }
  } catch (err) {
    console.error('Prescription email failed:', err.message);
  }

  sendResponse(res, 201, 'Prescription created successfully', prescription);
});

// @desc    Get prescription by ID
// @route   GET /api/v1/prescriptions/:id
// @access  Private
export const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);
  if (!prescription) {
    res.status(404);
    throw new Error('Prescription not found');
  }
  sendResponse(res, 200, 'Prescription fetched', prescription);
});

// @desc    Get patient prescriptions
// @route   GET /api/v1/prescriptions/patient
// @access  Private/Patient
export const getPatientPrescriptions = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) throw new Error('Patient not found');

  const prescriptions = await Prescription.find({ patientId: patient._id })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'firstName lastName' }
    })
    .sort('-createdAt');
    
  sendResponse(res, 200, 'Prescriptions fetched', prescriptions);
});
