import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['gas', 'bed', 'pharma', 'blood', 'machine', 'device'],
      default: 'device',
    },
    unit: {
      type: String,
      required: true,
      default: 'percentage',
    },
    warningThreshold: {
      type: Number,
      required: true,
      default: 70.0,
      min: 0,
      max: 100,
    },
    criticalThreshold: {
      type: Number,
      required: true,
      default: 40.0,
      min: 0,
      max: 100,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Resource = mongoose.model('Resource', ResourceSchema);
