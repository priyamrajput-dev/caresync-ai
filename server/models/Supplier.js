import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    reliabilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 85.0,
      index: true,
    },
    leadTimeDays: {
      type: Number,
      required: true,
      min: 1,
      default: 3,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    logisticsRiskScore: {
      type: Number,
      default: 10.0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Supplier = mongoose.model('Supplier', SupplierSchema);
