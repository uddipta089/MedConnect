import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';

export const generatePrescription = async (doctorId, prescriptionData) => {
  const { appointmentId, diagnosis, medicines, notes, followUpDate } = prescriptionData;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');
  
  if (appointment.doctorId.toString() !== doctorId) {
    throw new Error('Not authorized to prescribe for this appointment');
  }

  // Check if prescription already exists
  const existing = await Prescription.findOne({ appointmentId });
  if (existing) throw new Error('Prescription already generated for this appointment');

  const prescription = await Prescription.create({
    appointmentId,
    doctorId,
    patientId: appointment.patientId,
    diagnosis,
    medicines,
    notes,
    followUpDate
  });

  return prescription;
};

export const getPrescriptionById = async (id) => {
  return await Prescription.findById(id)
    .populate({
      path: 'doctorId',
      populate: [
        { path: 'userId', select: 'firstName lastName profileImage' },
        { path: 'hospitalId' },
        { path: 'specializationId' }
      ]
    })
    .populate('patientId')
    .populate('appointmentId');
};
