import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: { // The doctor who uploaded/requested or whom it's shared with
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    title: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Ultrasound', 'Prescription', 'Vaccination Record', 'Discharge Summary', 'Other'],
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
    },
    description: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isSoftDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

medicalReportSchema.index({ patientId: 1 });
medicalReportSchema.index({ appointmentId: 1 });

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);
export default MedicalReport;
