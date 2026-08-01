import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  details: {
    type: Object
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
