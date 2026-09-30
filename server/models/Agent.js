import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    agentType: {
      type: String,
      enum: [
        'supply_intelligence',
        'procurement',
        'risk_analysis',
        'emergency_monitoring',
        'operations',
        'executive_reporting',
      ],
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'idle', 'running', 'disabled'],
      default: 'active',
    },
    lastRunAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Agent = mongoose.model('Agent', AgentSchema);
