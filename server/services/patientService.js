import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import MedicalReport from '../models/MedicalReport.js';

export const getPatientProfile = async (userId) => {
  const patient = await Patient.findOne({ userId })
    .populate('userId', 'firstName lastName email phone profileImage')
    .populate({
      path: 'favouriteDoctors',
      populate: [
        { path: 'userId', select: 'firstName lastName profileImage' },
        { path: 'specializationId', select: 'name' }
      ]
    });
    
  if (!patient) {
    throw new Error('Patient profile not found');
  }
  return patient;
};

export const updatePatientProfile = async (userId, updateData) => {
  let patient = await Patient.findOne({ userId });
  if (!patient) {
    throw new Error('Patient profile not found');
  }
  
  Object.assign(patient, updateData);
  await patient.save();
  return patient;
};

export const addFavouriteDoctor = async (userId, doctorId) => {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new Error('Patient not found');
  
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');
  
  if (!patient.favouriteDoctors.includes(doctorId)) {
    patient.favouriteDoctors.push(doctorId);
    await patient.save();
  }
  return patient.favouriteDoctors;
};

export const removeFavouriteDoctor = async (userId, doctorId) => {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new Error('Patient not found');
  
  patient.favouriteDoctors = patient.favouriteDoctors.filter(id => id.toString() !== doctorId.toString());
  await patient.save();
  return patient.favouriteDoctors;
};

export const getHealthTimeline = async (userId) => {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new Error('Patient not found');
  const patientId = patient._id;

  const appointments = await Appointment.find({ patientId }).populate('doctorId', 'userId');
  const prescriptions = await Prescription.find({ patientId }).populate('doctorId', 'userId');
  const reports = await MedicalReport.find({ patientId, isSoftDeleted: false }).populate('doctorId', 'userId');

  const timeline = [
    ...appointments.map(a => ({ type: 'APPOINTMENT', date: a.date, data: a })),
    ...prescriptions.map(p => ({ type: 'PRESCRIPTION', date: p.createdAt, data: p })),
    ...reports.map(r => ({ type: 'REPORT', date: r.createdAt, data: r }))
  ];

  // Sort descending by date
  return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
};
