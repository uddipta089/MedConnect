import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    height: {
      type: Number, // in cm
    },
    weight: {
      type: Number, // in kg
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    medicalHistory: {
      type: [String],
    },
    allergies: {
      type: [String],
    },
    chronicDiseases: {
      type: [String],
    },
    currentMedications: {
      type: [String],
    },
    favouriteDoctors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }]
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ userId: 1 });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
