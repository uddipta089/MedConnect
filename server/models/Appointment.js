import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String, // e.g., "09:00 - 09:30"
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'Rejected', 'Missed'],
      default: 'Pending',
    },
    reason: {
      type: String,
      required: true,
    },
    consultationMode: {
      type: String,
      enum: ['In Person', 'Online'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    notes: { type: String },
    cancellationReason: { type: String },
    qrCodeToken: { type: String, unique: true, sparse: true },
    checkInTime: { type: Date },
    videoMeetingUrl: { type: String },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
