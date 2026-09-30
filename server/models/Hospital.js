import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: true,
      index: true,
    },
    regionName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    positionX: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    positionY: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    occupancy: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    efficiency: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
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

export const Hospital = mongoose.model('Hospital', HospitalSchema);
