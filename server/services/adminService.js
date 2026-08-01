import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';

export const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const verifiedDoctors = await Doctor.countDocuments({ isVerifiedByAdmin: true });
  const pendingDoctors = await Doctor.countDocuments({ isVerifiedByAdmin: false });
  const totalHospitals = await Hospital.countDocuments();
  const totalAppointments = await Appointment.countDocuments();
  
  // Appointments today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const appointmentsToday = await Appointment.countDocuments({
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  // Advanced Analytics: Appointments per month for current year
  const currentYear = new Date().getFullYear();
  const appointmentsPerMonth = await Appointment.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$date" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Financial Analytics: Calculate total revenue (assuming 10% platform cut for example, or total gross)
  const completedAppointments = await Appointment.find({ status: 'Completed' }).populate('doctorId', 'consultationFee');
  let totalRevenue = 0;
  completedAppointments.forEach(app => {
    if (app.doctorId && app.doctorId.consultationFee) {
      totalRevenue += app.doctorId.consultationFee;
    }
  });

  return {
    totalUsers,
    totalPatients,
    totalDoctors,
    verifiedDoctors,
    pendingDoctors,
    totalHospitals,
    totalAppointments,
    appointmentsToday,
    appointmentsPerMonth,
    totalRevenue
  };
};

export const verifyDoctor = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');
  
  doctor.isVerifiedByAdmin = true;
  await doctor.save();
  return doctor;
};

export const blockUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  user.isBlocked = !user.isBlocked; // toggle
  await user.save();
  return user;
};
