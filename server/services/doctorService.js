import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

export const getDoctorProfile = async (userId) => {
  const doctor = await Doctor.findOne({ userId })
    .populate('userId', 'firstName lastName email profileImage isVerified')
    .populate('hospitalId')
    .populate('specializationId');
    
  if (!doctor) throw new Error('Doctor profile not found');

  const completedAppointments = await Appointment.find({ doctorId: doctor._id, status: 'Completed' });
  const totalEarnings = completedAppointments.length * (doctor.consultationFee || 0);

  return { ...doctor.toObject(), totalEarnings };
};

export const updateDoctorProfile = async (userId, profileData) => {
  let doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    throw new Error('Doctor profile not found');
  }
  
  Object.assign(doctor, profileData);
  await doctor.save();
  return doctor;
};

export const searchDoctors = async (query) => {
  const { name, city, specializationId, consultationMode, page = 1, limit = 10 } = query;
  
  const filter = { isVerifiedByAdmin: true };
  
  if (specializationId) filter.specializationId = specializationId;
  if (consultationMode) filter.consultationMode = { $in: [consultationMode] };
  
  // To search by name or city we need to join with User and Hospital. 
  // For simplicity with Mongoose, we'll fetch doctors and then populate and filter.
  // In a real high-performance app, we'd use aggregate.
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const doctorsQuery = Doctor.find(filter)
    .populate({
      path: 'userId',
      match: name ? { $or: [{ firstName: new RegExp(name, 'i') }, { lastName: new RegExp(name, 'i') }] } : {},
      select: 'firstName lastName profileImage'
    })
    .populate({
      path: 'hospitalId',
      match: city ? { city: new RegExp(city, 'i') } : {},
      select: 'name city'
    })
    .populate('specializationId', 'name')
    .skip(skip)
    .limit(parseInt(limit));
    
  let doctors = await doctorsQuery.exec();
  
  // Filter out those whose user or hospital didn't match
  doctors = doctors.filter(doc => doc.userId !== null && (!city || doc.hospitalId !== null));
  
  const total = await Doctor.countDocuments(filter); // Note: total count isn't perfectly accurate with this population filter method, but acceptable for this demo.
  
  return { doctors, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) };
};

export const updateAvailability = async (userId, availabilityData) => {
  let doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    throw new Error('Doctor profile not found');
  }
  
  const currentAvailability = doctor.availability ? doctor.toObject().availability : {};
  doctor.availability = { ...currentAvailability, ...availabilityData };
  await doctor.save();
  return doctor.availability;
};

export const addLeave = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');

  if (!doctor.availability.unavailableDates.includes(date)) {
    doctor.availability.unavailableDates.push(date);
    await doctor.save();
  }
  return doctor.availability;
};

export const getAvailabilityHeatmap = async (doctorId) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const appointments = await Appointment.aggregate([
    {
      $match: {
        doctorId: doctorId,
        date: { $gte: new Date(), $lte: thirtyDaysFromNow },
        status: { $in: ['Pending', 'Confirmed'] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        count: { $sum: 1 }
      }
    }
  ]);

  return appointments;
};
