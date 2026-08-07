import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode } from 'lucide-react';

const QRModal = ({ isOpen, onClose, appointmentId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" /> Check-in QR
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
            {/* Generate a QR code for the specific appointment ID to be scanned by the clinic */}
            <QRCodeSVG value={appointmentId || "invalid"} size={200} level="H" />
          </div>
          <p className="text-sm text-center text-slate-500">
            Show this QR code at the clinic reception for instant check-in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
