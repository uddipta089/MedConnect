import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    module: {
      type: String,
      enum: ['Symptom Checker', 'Report Summary', 'Doctor Recommendation', 'Health Assistant'],
      required: true,
    },
    messages: [{
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    tokensUsed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ userId: 1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
