import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true,
    },
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },
    currentLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    capacityTotal: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['stable', 'warning', 'critical'],
      default: 'stable',
      index: true,
    },
    trend: {
      type: Number,
      enum: [-1, 0, 1], // -1: declining, 0: stable, 1: improving
      default: 0,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

InventorySchema.index({ hospitalId: 1, resourceId: 1 }, { unique: true });

export const Inventory = mongoose.model('Inventory', InventorySchema);
