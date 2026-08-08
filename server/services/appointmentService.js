import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import moment from 'moment';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Generate slots based on doctor's availability
export const generateAvailableSlots = async (doctorId, dateStr) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error('Doctor not found');
  if (!doctor.availability) throw new Error('Doctor availability not set');

  const date = moment(dateStr, 'YYYY-MM-DD');
  const dayOfWeek = date.format('dddd');

  if (!doctor.availability.workingDays.includes(dayOfWeek)) {
    return []; // Doctor not working on this day
  }

  // Check unavailable dates
  const isUnavailable = doctor.availability.unavailableDates?.some(
    d => moment(d).format('YYYY-MM-DD') === dateStr
  );
  if (isUnavailable) return [];

  const { startTime, endTime } = doctor.availability.workingHours;
  const slotDuration = doctor.availability.slotDuration || 30;
  const breakStart = doctor.availability.breakTime?.startTime;
  const breakEnd = doctor.availability.breakTime?.endTime;

  let currentSlotTime = moment(`${dateStr} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const endOfDay = moment(`${dateStr} ${endTime}`, 'YYYY-MM-DD HH:mm');
  
  const allSlots = [];

  while (currentSlotTime.isBefore(endOfDay)) {
    const slotStartTimeStr = currentSlotTime.format('HH:mm');
    const nextSlotTime = moment(currentSlotTime).add(slotDuration, 'minutes');
    const slotEndTimeStr = nextSlotTime.format('HH:mm');
    const slotStr = `${slotStartTimeStr} - ${slotEndTimeStr}`;

    let isBreak = false;
    if (breakStart && breakEnd) {
      const bStart = moment(`${dateStr} ${breakStart}`, 'YYYY-MM-DD HH:mm');
      const bEnd = moment(`${dateStr} ${breakEnd}`, 'YYYY-MM-DD HH:mm');
      if (currentSlotTime.isSameOrAfter(bStart) && currentSlotTime.isBefore(bEnd)) {
        isBreak = true;
      }
    }

    if (!isBreak) {
      allSlots.push(slotStr);
    }
    
    currentSlotTime = nextSlotTime;
  }

  // Fetch booked slots
  const startOfDay = moment(dateStr).startOf('day').toDate();
  const endOfDayDate = moment(dateStr).endOf('day').toDate();

  const bookedAppointments = await Appointment.find({
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDayDate },
    status: { $in: ['Pending', 'Confirmed', 'Completed', 'Rescheduled'] }
  });

  const bookedSlots = bookedAppointments.map(app => app.slot);

  // Return slots that are not booked
  return allSlots.filter(slot => !bookedSlots.includes(slot));
};

export const bookAppointment = async (userId, appointmentData) => {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new Error('Patient profile not found');

  const { doctorId, date, slot, reason, consultationMode } = appointmentData;
  const appointmentDate = moment(date, 'YYYY-MM-DD').toDate();

  // Validate that the slot is actually available on this day
  const availableSlots = await generateAvailableSlots(doctorId, date);
  if (!availableSlots.includes(slot)) {
    throw new Error('The requested time slot is not available on this date.');
  }

  // Double Booking Prevention via Transaction
  const session = await mongoose.startSession();
  let appointment;

  try {
    session.startTransaction();

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      slot,
      status: { $in: ['Pending', 'Confirmed'] }
    }).session(session);

    if (existingAppointment) {
      throw new Error('This slot is already booked.');
    }

    appointment = new Appointment({
      patientId: patient._id,
      doctorId,
      date: appointmentDate,
      slot,
      reason,
      consultationMode,
      qrCodeToken: crypto.randomBytes(20).toString('hex')
    });

    await appointment.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return appointment;
};

export const updateAppointmentStatus = async (appointmentId, status, cancelledBy = null, cancellationReason = null) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');
  
  if (appointment.status === 'Completed') {
    throw new Error('Cannot modify a completed appointment');
  }

  appointment.status = status;
  if (status === 'Cancelled' && cancelledBy) {
    appointment.cancelledBy = cancelledBy;
    appointment.cancellationReason = cancellationReason;
  }

  await appointment.save();
  return appointment;
};

export const generateAppointmentQR = async (appointmentId, userId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');
  
  const patient = await Patient.findOne({ userId });
  if (patient && appointment.patientId.toString() !== patient._id.toString()) {
    throw new Error('Not authorized to view this QR code');
  }

  // Generate QR code pointing to a check-in link (frontend handles the display)
  const checkInUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkin/${appointment.qrCodeToken}`;
  const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);
  
  return qrCodeDataUrl;
};

export const checkInAppointment = async (token) => {
  const appointment = await Appointment.findOne({ qrCodeToken: token });
  if (!appointment) throw new Error('Invalid or expired QR code');
  
  if (appointment.checkInTime) {
    throw new Error('Appointment has already been checked in');
  }

  appointment.checkInTime = new Date();
  appointment.status = 'Confirmed';
  await appointment.save();
  return appointment;
};

export const rescheduleAppointment = async (appointmentId, newDateStr, newSlot, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) throw new Error('Appointment not found');

    const patient = await Patient.findOne({ userId }).session(session);
    if (!patient || appointment.patientId.toString() !== patient._id.toString()) {
      throw new Error('Not authorized to reschedule this appointment');
    }

    if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
      throw new Error('Cannot reschedule a cancelled or completed appointment');
    }

    const appointmentDate = new Date(newDateStr);
    appointmentDate.setHours(0, 0, 0, 0);

    // Verify slot is valid for new date
    const availableSlots = await generateAvailableSlots(appointment.doctorId, newDateStr);
    if (!availableSlots.includes(newSlot)) {
      throw new Error('Requested slot is no longer available');
    }

    // Cancel old appointment internally or update it directly
    // Usually it's better to update the existing record
    appointment.date = appointmentDate;
    appointment.slot = newSlot;
    appointment.qrCodeToken = crypto.randomBytes(20).toString('hex'); // rotate QR for security
    
    await appointment.save({ session });
    await session.commitTransaction();
    session.endSession();
    return appointment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
