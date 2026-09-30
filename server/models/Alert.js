import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
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
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null,
    },
    resourceName: {
      type: String,
      default: null,
    },
    alertType: {
      type: String,
      enum: ['shortage', 'delay', 'outbreak', 'threshold'],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved'],
      default: 'open',
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Alert = mongoose.model('Alert', AlertSchema);
