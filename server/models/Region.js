import mongoose from 'mongoose';

const RegionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
    },
  },
  {
    timestamps: true,
  }
);

export const Region = mongoose.model('Region', RegionSchema);
