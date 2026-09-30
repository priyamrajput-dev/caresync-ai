import mongoose from 'mongoose';

const RiskScoreSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
      index: true,
    },
    contributingFactors: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

RiskScoreSchema.index({ hospitalId: 1, calculatedAt: -1 });

export const RiskScore = mongoose.model('RiskScore', RiskScoreSchema);
