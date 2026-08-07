import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { X, FileSignature } from 'lucide-react';

const PrescriptionForm = ({ isOpen, onClose, patientId }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', instructions: '' }]);
  const [loading, setLoading] = useState(false);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', instructions: '' }]);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis || !patientId || medicines[0].name === '') {
      return toast.error('Please fill required fields');
    }
    
    setLoading(true);
    try {
      await api.post('/prescriptions', {
        patientId,
        diagnosis,
        medicines,
        advice
      });
      toast.success('Prescription issued successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-blue-600" /> Issue Digital Prescription
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <Input 
            label="Diagnosis" 
            type="text" 
            required 
            placeholder="e.g. Viral Pharyngitis"
            value={diagnosis} 
            onChange={(e) => setDiagnosis(e.target.value)} 
          />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Medicines</label>
              <button type="button" onClick={handleAddMedicine} className="text-sm text-blue-600 font-medium hover:text-blue-700">
                + Add Medicine
              </button>
            </div>
            
            {medicines.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Input 
                  label="Name" 
                  value={med.name} 
                  required
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} 
                  placeholder="e.g. Paracetamol 500mg"
                />
                <Input 
                  label="Dosage" 
                  value={med.dosage} 
                  required
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} 
                  placeholder="e.g. 1-0-1"
                />
                <Input 
                  label="Instructions" 
                  value={med.instructions} 
                  onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)} 
                  placeholder="e.g. After meals"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Additional Advice</label>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Drink plenty of water..."
            />
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} isLoading={loading}>Issue & Email PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;
