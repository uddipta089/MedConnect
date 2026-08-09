import axios from 'axios';
import Appointment from '../models/Appointment.js';

export const createVideoRoom = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error('Appointment not found');
  
  if (appointment.consultationMode !== 'Online') {
    throw new Error('This is not an online appointment');
  }

  // If already created, return existing
  if (appointment.videoMeetingUrl) {
    return appointment.videoMeetingUrl;
  }

  // Generate a free Jitsi Meet room (no API key required, no payment blocks)
  try {
    const roomName = `MedConnect-Room-${appointmentId}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    
    appointment.videoMeetingUrl = jitsiUrl;
    await appointment.save();
    return appointment.videoMeetingUrl;
  } catch (err) {
    console.error('Failed to generate video room:', err);
    throw new Error('Failed to generate video room');
  }
};
