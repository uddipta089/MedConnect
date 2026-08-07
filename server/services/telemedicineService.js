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

  // Generate Daily.co Room
  const DAILY_API_KEY = process.env.DAILY_API_KEY;
  if (!DAILY_API_KEY) {
    console.warn('DAILY_API_KEY is not set. Generating mock URL for development.');
    appointment.videoMeetingUrl = `https://medconnect.daily.co/mock-room-${appointmentId}`;
    await appointment.save();
    return appointment.videoMeetingUrl;
  }

  try {
    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
          enable_chat: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    appointment.videoMeetingUrl = response.data.url;
    await appointment.save();
    return appointment.videoMeetingUrl;
  } catch (err) {
    console.error('Failed to create Daily.co room:', err.response?.data || err.message);
    throw new Error('Failed to generate video room');
  }
};
