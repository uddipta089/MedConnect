import mongoose from 'mongoose';

const specializationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
    },
    iconUrl: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const Specialization = mongoose.model('Specialization', specializationSchema);
export default Specialization;
