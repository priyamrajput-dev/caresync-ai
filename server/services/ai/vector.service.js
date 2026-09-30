import { DocumentChunk } from '../../models/DocumentChunk.js';
import { embeddingService } from './embedding.service.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class VectorService {
  constructor() {
    this.indexName = env.ATLAS_VECTOR_INDEX_NAME;
  }

  /**
   * Ingest a document, split it into chunks, compute embeddings, and save to MongoDB.
   *
   * @param {Object} doc - Document to ingest
   * @param {string} doc.title - Title of document
   * @param {string} doc.content - Full text content
   * @param {string} doc.category - Category (guideline, supplier_intel, etc.)
   * @param {string} [doc.hospitalId] - Facility ID
   * @param {string} [doc.region] - Region name
   * @param {string[]} [doc.tags] - Search tags
   * @param {Object} [doc.metadata] - Extra metadata
   * @returns {Promise<DocumentChunk[]>} Created chunks
   */
  async ingestDocument(doc) {
    const { title, content, category = 'guideline', hospitalId = null, region = 'National', tags = [], metadata = {} } = doc;

    // Simple chunking: split text into paragraphs or ~500 char blocks with 50 char overlap
    const chunks = this._chunkText(content, 600, 80);
    const createdChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await embeddingService.generateEmbedding(`${title}. ${chunkText}`);

      const chunkDoc = await DocumentChunk.create({
        title,
        content: chunkText,
        category,
        hospitalId,
        region,
        tags,
        embedding,
        chunkIndex: i,
        metadata: {
          ...metadata,
          totalChunks: chunks.length,
        },
      });

      createdChunks.push(chunkDoc);
    }

    logger.info(`Ingested document "${title}" into ${createdChunks.length} vector chunks`);
    return createdChunks;
  }

  /**
   * Performs semantic vector search using MongoDB Atlas Vector Search ($vectorSearch).
   * Automatically falls back to cosine similarity calculation on local/standalone MongoDB instances.
   *
   * @param {string} queryText - User query string
   * @param {Object} options - Search options
   * @param {number} [options.limit=5] - Number of results to return
   * @param {string} [options.category] - Optional category filter
   * @param {string} [options.region] - Optional region filter
   * @returns {Promise<Array<{chunk: Object, score: number}>>}
   */
  async searchSimilar(queryText, options = {}) {
    const { limit = 5, category, region } = options;
    const queryVector = await embeddingService.generateEmbedding(queryText);

    try {
      // Build filter object if category or region specified
      const filter = {};
      if (category) filter.category = category;
      if (region && region !== 'National') filter.region = region;

      // 1. Try MongoDB Atlas Vector Search aggregation pipeline
      const pipeline = [
        {
          $vectorSearch: {
            index: this.indexName,
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: Math.max(limit * 10, 50),
            limit: limit,
            ...(Object.keys(filter).length > 0 ? { filter } : {}),
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            content: 1,
            category: 1,
            region: 1,
            hospitalId: 1,
            tags: 1,
            metadata: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ];

      const atlasResults = await DocumentChunk.aggregate(pipeline).exec();
      if (atlasResults && atlasResults.length > 0) {
        return atlasResults.map(doc => ({
          chunk: doc,
          score: doc.score || 1.0,
        }));
      }
    } catch (atlasErr) {
      // $vectorSearch is specific to MongoDB Atlas clusters with a Search index configured.
      // If run on a local standalone MongoDB, it throws a command error. We log and gracefully use the fallback.
      logger.debug('Atlas Vector Search pipeline unavailable locally; utilizing standard vector similarity scan:', atlasErr.message);
    }

    // 2. Resilient local fallback: query candidate chunks and rank via cosine similarity
    const queryFilter = {};
    if (category) queryFilter.category = category;
    if (region && region !== 'National') queryFilter.region = region;

    const candidateDocs = await DocumentChunk.find(queryFilter).lean().limit(100);

    const scored = candidateDocs.map(doc => {
      const score = embeddingService.calculateCosineSimilarity(queryVector, doc.embedding);
      return { chunk: doc, score };
    });

    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  /**
   * Chunks text with sliding window.
   */
  _chunkText(text, chunkSize = 600, overlap = 80) {
    if (!text || text.length <= chunkSize) return [text];
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = start + chunkSize;
      if (end < text.length) {
        // Try to break at a period, newline, or space
        const lastPeriod = text.lastIndexOf('.', end);
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastPeriod > start + chunkSize * 0.7) {
          end = lastPeriod + 1;
        } else if (lastSpace > start + chunkSize * 0.7) {
          end = lastSpace;
        }
      }
      chunks.push(text.slice(start, end).trim());
      start = end - overlap;
    }
    return chunks.filter(c => c.length > 0);
  }
}

export const vectorService = new VectorService();

