import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system', 'tool'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  toolCalls: [
    {
      tool: String,
      input: mongoose.Schema.Types.Mixed,
      output: mongoose.Schema.Types.Mixed,
    },
  ],
  tokensUsed: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ChatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    title: {
      type: String,
      default: 'Procurement AI Consultation',
    },
    messages: [ChatMessageSchema],
    totalTokens: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);
