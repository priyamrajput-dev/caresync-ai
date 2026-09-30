import mongoose from 'mongoose';

const DocumentChunkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['guideline', 'supplier_intel', 'outbreak_news', 'clinical_discharge', 'protocol'],
      default: 'guideline',
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true,
    },
    region: {
      type: String,
      default: 'National',
      index: true,
    },
    sourceUrl: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Vector embedding for MongoDB Atlas Vector Search
    embedding: {
      type: [Number],
      required: true,
      // Atlas Vector Index targets this field
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Standard indexes for metadata pre-filtering before/with vector search
DocumentChunkSchema.index({ category: 1, region: 1 });
DocumentChunkSchema.index({ tags: 1 });

export const DocumentChunk = mongoose.model('DocumentChunk', DocumentChunkSchema);
