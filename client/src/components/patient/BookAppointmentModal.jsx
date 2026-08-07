import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const BookAppointmentModal = ({ isOpen, onClose, onAppointmentBooked }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

    const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors/search');
      setDoctors(res.data.doctors || []);
    } catch (err) {
      toast.error('Failed to load doctors');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      return toast.error('Please fill all fields');
    }
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor,
        appointmentDate,
        appointmentTime
      });
      toast.success('Appointment booked successfully!');
      onAppointmentBooked();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Book Appointment</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              required
            >
              <option value="">Choose a specialist...</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.userId?.firstName} {doc.userId?.lastName} - {doc.specializationId?.name || 'Doctor'}
                </option>
              ))}
            </select>
          </div>

          <Input 
            label="Date" 
            type="date" 
            required 
            min={new Date().toISOString().split('T')[0]}
            value={appointmentDate} 
            onChange={(e) => setAppointmentDate(e.target.value)} 
          />
          
          <Input 
            label="Time" 
            type="time" 
            required 
            value={appointmentTime} 
            onChange={(e) => setAppointmentTime(e.target.value)} 
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Confirm Booking</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
