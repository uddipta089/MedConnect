import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  strength: { type: String },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true }, // e.g., "5 Days"
  beforeFood: { type: Boolean, default: false },
  afterFood: { type: Boolean, default: true },
  instructions: { type: String }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true // One prescription per appointment
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    diagnosis: {
      type: String,
      required: true
    },
    medicines: [medicineSchema],
    notes: {
      type: String,
    },
    followUpDate: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
