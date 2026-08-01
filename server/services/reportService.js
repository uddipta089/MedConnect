import MedicalReport from '../models/MedicalReport.js';
import Appointment from '../models/Appointment.js';

export const uploadReport = async (userId, reportData) => {
  return await MedicalReport.create({
    ...reportData,
    uploadedBy: userId
  });
};

export const getPatientReports = async (patientId) => {
  return await MedicalReport.find({ patientId, isSoftDeleted: false })
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'firstName lastName' } })
    .sort('-createdAt');
};

export const deleteReport = async (reportId, userId) => {
  const report = await MedicalReport.findById(reportId);
  if (!report) throw new Error('Report not found');
  
  if (report.uploadedBy.toString() !== userId) {
    throw new Error('Not authorized to delete this report');
  }

  report.isSoftDeleted = true;
  await report.save();
  return report;
};
