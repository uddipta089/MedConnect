import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Users, UserPlus, Activity, Database, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = async (format) => {
    try {
      // Create a temporary anchor element to trigger the download
      const response = await api.get(`/admin/export/users?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading admin dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors">
            <Download className="h-4 w-4" /> PDF
          </button>
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition-colors">
            <Download className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg"><Users className="text-blue-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats?.totalUsers}</p>
        </div>
        
        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg"><UserPlus className="text-indigo-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Verified Doctors</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats?.verifiedDoctors}</p>
        </div>

        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg"><Activity className="text-emerald-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">₹{stats?.totalRevenue || 0}</p>
        </div>

        <div className="glass p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-amber-100 p-2 rounded-lg"><Database className="text-amber-600 h-5 w-5" /></div>
            <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">{stats?.totalAppointments}</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
        <div className="text-center py-12 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          Analytics charts and audit logs will render here.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
