import React from 'react';
import { X, Video } from 'lucide-react';

const TelemedicineRoom = ({ isOpen, onClose, url }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col p-4">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center py-4 shrink-0 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-400" /> Secure Telemedicine Room
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2">
          <X className="h-6 w-6" /> <span className="hidden sm:inline font-medium">Leave Room</span>
        </button>
      </div>
      
      <div className="flex-1 w-full max-w-7xl mx-auto bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
        {url ? (
          <iframe
            src={url}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            Invalid Meeting URL
          </div>
        )}
      </div>
    </div>
  );
};

export default TelemedicineRoom;
