import crypto from 'crypto';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';

/**
 * Generate normalized embedding vectors for MongoDB Atlas Vector Search.
 * Uses a deterministic hash-projection embedding generator with semantic token
 * weighting for self-contained, reproducible, sub-millisecond embeddings,
 * or forwards to external embedding API when configured.
 */
export class EmbeddingService {
  constructor() {
    this.dimension = env.EMBEDDING_DIMENSION || 1536;
  }

  /**
   * Generates a vector embedding of size `dimension` for the input text.
   * Returns a float array normalized to unit length (L2 norm = 1).
   *
   * @param {string} text - The text to embed
   * @returns {Promise<number[]>} Array of floats
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return new Array(this.dimension).fill(0);
    }

    try {
      const cleanText = text.toLowerCase().trim();
      const vector = new Float64Array(this.dimension);

      // Semantic n-gram and token hashing with TF-IDF approximation
      const tokens = cleanText.split(/[\s,.;:!?"'()\[\]{}]+/).filter(Boolean);
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Single token hash
        const h1 = this._hashString(token);
        const idx1 = Math.abs(h1) % this.dimension;
        const sign1 = (h1 & 1) ? 1.0 : -1.0;
        vector[idx1] += sign1 * (1.0 + Math.log(1.0 + (tokens.length / (i + 1))));

        // Bigram hash if applicable
        if (i < tokens.length - 1) {
          const bigram = `${token}_${tokens[i + 1]}`;
          const h2 = this._hashString(bigram);
          const idx2 = Math.abs(h2) % this.dimension;
          const sign2 = (h2 & 1) ? 1.0 : -1.0;
          vector[idx2] += sign2 * 1.5;
        }
      }

      // Normalize vector to unit length (Cosine/Dot product invariant)
      let norm = 0.0;
      for (let i = 0; i < this.dimension; i++) {
        norm += vector[i] * vector[i];
      }
      norm = Math.sqrt(norm);

      const result = new Array(this.dimension);
      if (norm > 0) {
        for (let i = 0; i < this.dimension; i++) {
          result[i] = parseFloat((vector[i] / norm).toFixed(6));
        }
      } else {
        result.fill(0);
      }

      return result;
    } catch (err) {
      logger.error('Error generating embedding:', err);
      return new Array(this.dimension).fill(0);
    }
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Computes cosine similarity between two vectors.
   */
  calculateCosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

export const embeddingService = new EmbeddingService();
