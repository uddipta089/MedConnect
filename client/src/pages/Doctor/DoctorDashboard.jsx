import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Calendar, Users, DollarSign, Clock, Settings, FileSignature, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import AvailabilityManager from '../../components/doctor/AvailabilityManager';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import TelemedicineRoom from '../../components/doctor/TelemedicineRoom';

const DoctorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isTelemedicineOpen, setIsTelemedicineOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const fetchDashboardData = async () => {
      try {
        const [profileRes, apptRes] = await Promise.all([
          api.get('/doctors/profile/me'),
          api.get('/appointments/doctor')
        ]);
        setProfile(profileRes.data.data);
        setAppointments(apptRes.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;

  const todayAppointments = appointments.filter(a => {
    const apptDate = new Date(a.date).toDateString();
    const today = new Date().toDateString();
    return apptDate === today;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          {profile?.isVerifiedByAdmin ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium border border-green-200">Verified Profile</span>
          ) : (
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium border border-amber-200">Pending Verification</span>
          )}
        </div>
        <button 
          onClick={() => setIsAvailabilityOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Settings className="h-4 w-4" />
          Manage Availability
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg"><Calendar className="text-blue-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Today's Appointments</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{todayAppointments.length}</p>
        </div>
        
        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg"><Users className="text-indigo-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{new Set(appointments.map(a => a.patientId?._id)).size}</p>
        </div>

        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg"><DollarSign className="text-emerald-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">₹{profile?.totalEarnings || 0}</p>
        </div>

        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-rose-100 p-2 rounded-lg"><Clock className="text-rose-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{appointments.filter(a => a.status === 'Pending').length}</p>
        </div>
      </div>

      <div className="glass rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          Today's Schedule
        </h2>
        
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Time Slot</th>
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Mode</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appt) => (
                  <tr key={appt._id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{appt.slot}</td>
                    <td className="px-6 py-4">{appt.patientId?.userId?.firstName || 'Unknown'} {appt.patientId?.userId?.lastName || ''}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${appt.consultationMode === 'Online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {appt.consultationMode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${appt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : appt.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {appt.dailyRoomUrl && (
                        <button 
                          onClick={() => { setVideoUrl(appt.dailyRoomUrl); setIsTelemedicineOpen(true); }}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <Video className="h-3 w-3" /> Join
                        </button>
                      )}
                      <button 
                        onClick={() => { setSelectedPatientId(appt.patientId?._id); setIsPrescriptionOpen(true); }}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                      >
                        <FileSignature className="h-3 w-3" /> Issue Rx
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AvailabilityManager 
        isOpen={isAvailabilityOpen} 
        onClose={() => setIsAvailabilityOpen(false)} 
        onUpdate={fetchDashboardData} 
      />

      <PrescriptionForm 
        isOpen={isPrescriptionOpen} 
        onClose={() => setIsPrescriptionOpen(false)} 
        patientId={selectedPatientId} 
      />

      <TelemedicineRoom 
        isOpen={isTelemedicineOpen} 
        onClose={() => { setIsTelemedicineOpen(false); setVideoUrl(''); }} 
        url={videoUrl} 
      />
    </div>
  );
};

export default DoctorDashboard;
