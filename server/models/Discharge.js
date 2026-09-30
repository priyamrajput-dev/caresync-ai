import mongoose from 'mongoose';

const DischargeSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    facilityName: {
      type: String,
      required: true,
      trim: true,
    },
    dischargeDate: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    attendingPhysician: {
      type: String,
      default: 'Dr. Sarah Chen',
    },
    followUpPlan: {
      type: String,
      default: 'Follow-up clinical assessment in 7 business days.',
    },
    status: {
      type: String,
      enum: ['discharged', 'transferred', 'pending_summary'],
      default: 'discharged',
    },
  },
  {
    timestamps: true,
  }
);

export const Discharge = mongoose.model('Discharge', DischargeSchema);
