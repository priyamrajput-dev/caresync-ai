import mongoose from 'mongoose';

const ForecastSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },
    forecastValues: [
      {
        timestamp: { type: Date, required: true },
        predictedValue: { type: Number, required: true },
        confidence: { type: Number, required: true },
      },
    ],
    projectedDeficit: {
      type: Number,
      default: 0,
    },
    horizonHours: {
      type: Number,
      default: 48,
    },
    modelVersion: {
      type: String,
      default: 'caresync-forecast-v2.0',
    },
    trend: {
      type: String,
      enum: ['stable', 'increasing', 'surge'],
      default: 'stable',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ForecastSchema.index({ hospitalId: 1, resourceId: 1, generatedAt: -1 });

export const Forecast = mongoose.model('Forecast', ForecastSchema);
