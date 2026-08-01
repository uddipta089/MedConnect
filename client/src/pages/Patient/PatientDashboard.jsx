import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Calendar, Clock, FileText, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/patients/timeline');
        setTimeline(res.data.data);
      } catch (err) {
        toast.error('Failed to load health timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-xl flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full"><Calendar className="text-blue-600 h-6 w-6" /></div>
          <div><p className="text-sm text-gray-500">Upcoming Appointments</p><p className="text-2xl font-bold">2</p></div>
        </div>
        <div className="glass p-6 rounded-xl flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full"><FileText className="text-green-600 h-6 w-6" /></div>
          <div><p className="text-sm text-gray-500">Medical Reports</p><p className="text-2xl font-bold">5</p></div>
        </div>
        <div className="glass p-6 rounded-xl flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full"><Activity className="text-purple-600 h-6 w-6" /></div>
          <div><p className="text-sm text-gray-500">Active Prescriptions</p><p className="text-2xl font-bold">1</p></div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" /> 
          Your Health Timeline
        </h2>
        
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading timeline...</p>
        ) : timeline.length === 0 ? (
          <p className="text-gray-500">No medical history found.</p>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {timeline.map((item, index) => (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                  {item.type === 'APPOINTMENT' && <Calendar className="h-5 w-5" />}
                  {item.type === 'PRESCRIPTION' && <FileText className="h-5 w-5" />}
                  {item.type === 'REPORT' && <Activity className="h-5 w-5" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-900">{item.type}</div>
                    <time className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</time>
                  </div>
                  <div className="text-slate-600 text-sm mt-2">
                    {item.type === 'APPOINTMENT' && `Consultation with Dr. ${item.data.doctorId?.userId?.firstName || 'Unknown'}`}
                    {item.type === 'PRESCRIPTION' && `Diagnosis: ${item.data.diagnosis}`}
                    {item.type === 'REPORT' && `Report: ${item.data.reportType}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
