import asyncHandler from '../middleware/asyncHandler.js';
import { sendResponse } from '../utils/responseHandler.js';
import * as reportService from '../services/reportService.js';
import Patient from '../models/Patient.js';
import { cloudinary } from '../utils/cloudinary.js';

// @desc    Upload Medical Report
// @route   POST /api/v1/reports/upload
// @access  Private
export const uploadMedicalReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const { title, reportType, patientId, doctorId, appointmentId, description } = req.body;
  
  const reportData = {
    title,
    reportType,
    patientId: patientId || (await Patient.findOne({ userId: req.user.id }))._id,
    doctorId,
    appointmentId,
    description,
    cloudinaryUrl: req.file.path,
    publicId: req.file.filename,
    fileType: req.file.mimetype
  };

  const report = await reportService.uploadReport(req.user.id, reportData);
  
  const io = req.app.get('io');
  if (io && doctorId) {
    io.to(`doctor:${doctorId}`).emit('reportUploaded', { message: 'A new medical report was uploaded' });
  }

  sendResponse(res, 201, 'Medical report uploaded successfully', report);
});

// @desc    Get patient reports
// @route   GET /api/v1/reports/patient
// @access  Private/Patient
export const getMyReports = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user.id });
  if (!patient) throw new Error('Patient not found');

  const reports = await reportService.getPatientReports(patient._id);
  sendResponse(res, 200, 'Reports fetched successfully', reports);
});

// @desc    Delete medical report
// @route   DELETE /api/v1/reports/:id
// @access  Private
export const deleteMedicalReport = asyncHandler(async (req, res) => {
  await reportService.deleteReport(req.params.id, req.user.id);
  sendResponse(res, 200, 'Report deleted successfully');
});
