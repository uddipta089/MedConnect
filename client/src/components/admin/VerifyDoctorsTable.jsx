import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const VerifyDoctorsTable = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingDoctors = async () => {
    try {
      // Fetch all doctors and filter locally for simplicity, or if backend supports it, use query params
      const res = await api.get('/admin/doctors');
      const pending = res.data.data.filter(d => !d.isVerifiedByAdmin);
      setDoctors(pending);
    } catch (error) {
      toast.error('Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const handleVerify = async (doctorId, status) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/verify`, { isVerified: status === 'approve' });
      toast.success(`Doctor ${status === 'approve' ? 'verified' : 'rejected'} successfully`);
      fetchPendingDoctors();
    } catch (error) {
      toast.error('Failed to update doctor status');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-slate-100 rounded-lg"></div>;

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No pending doctor verifications.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3">Doctor Name</th>
            <th className="px-6 py-3">Specialization</th>
            <th className="px-6 py-3">Experience</th>
            <th className="px-6 py-3">License Number</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc._id} className="bg-white border-b hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">Dr. {doc.userId?.firstName} {doc.userId?.lastName}</td>
              <td className="px-6 py-4">{doc.specializationId?.name || 'Not specified'}</td>
              <td className="px-6 py-4">{doc.experience ? `${doc.experience} years` : 'Not specified'}</td>
              <td className="px-6 py-4 font-mono text-xs">{doc.licenseNumber || 'N/A'}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button 
                  onClick={() => handleVerify(doc._id, 'approve')}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <CheckCircle className="h-3 w-3" /> Approve
                </button>
                <button 
                  onClick={() => handleVerify(doc._id, 'reject')}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <XCircle className="h-3 w-3" /> Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerifyDoctorsTable;
