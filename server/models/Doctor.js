import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    specializationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialization',
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },
    qualification: {
      type: [String], // e.g. MBBS, MD
    },
    experience: {
      type: Number, // Years
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    languages: {
      type: [String],
    },
    bio: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    certificates: [{
      title: String,
      url: String
    }],
    availability: {
      workingDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }],
      workingHours: {
        startTime: String, // e.g. "09:00"
        endTime: String,   // e.g. "17:00"
      },
      breakTime: {
        startTime: String, // e.g. "13:00"
        endTime: String,   // e.g. "14:00"
      },
      slotDuration: {
        type: Number, // in minutes
        enum: [15, 20, 30, 45, 60],
        default: 30
      },
      unavailableDates: [Date]
    },
    consultationMode: {
      type: [String],
      enum: ['In Person', 'Online', 'Both'],
      default: ['Both']
    },
    isVerifiedByAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ userId: 1 });
doctorSchema.index({ hospitalId: 1 });
doctorSchema.index({ specializationId: 1 });
doctorSchema.index({ rating: -1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
