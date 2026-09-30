import mongoose from 'mongoose';

const SupplierResourceSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

SupplierResourceSchema.index({ supplierId: 1, resourceId: 1 }, { unique: true });

export const SupplierResource = mongoose.model('SupplierResource', SupplierResourceSchema);
