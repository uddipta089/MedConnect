import React, { useState } from 'react';
import api from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { UploadCloud, X } from 'lucide-react';

const ReportUpload = ({ isOpen, onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !reportType) {
      return toast.error('Please select a file and report type');
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', reportType);

    try {
      await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Report uploaded successfully!');
      onUploadComplete();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Upload Medical Report</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <div className="text-sm text-slate-600">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500 mt-2">PDF, PNG, JPG up to 10MB</p>
            {file && <p className="mt-4 text-sm font-semibold text-emerald-600">{file.name}</p>}
          </div>

          <Input 
            label="Report Type (e.g. Blood Test, X-Ray)" 
            type="text" 
            required 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)} 
            placeholder="Blood Test"
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Upload</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUpload;
