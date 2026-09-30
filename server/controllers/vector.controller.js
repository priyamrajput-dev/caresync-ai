import { vectorService } from '../services/ai/vector.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function search(req, res, next) {
  try {
    const { query, category, region, limit = 5 } = req.body;
    if (!query) {
      return errorResponse(res, 'query is required', 400, 'VALIDATION_ERROR');
    }

    const results = await vectorService.searchSimilar(query, {
      limit: parseInt(limit, 10),
      category,
      region,
    });

    return successResponse(res, {
      query,
      resultsCount: results.length,
      results: results.map(r => ({
        id: r.chunk._id.toString(),
        title: r.chunk.title,
        content: r.chunk.content,
        category: r.chunk.category,
        region: r.chunk.region,
        tags: r.chunk.tags,
        score: Math.round(r.score * 1000) / 1000,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function ingest(req, res, next) {
  try {
    const { title, content, category, region, tags, metadata } = req.body;
    if (!title || !content) {
      return errorResponse(res, 'title and content are required', 400, 'VALIDATION_ERROR');
    }

    const chunks = await vectorService.ingestDocument({
      title,
      content,
      category,
      region,
      tags,
      metadata,
    });

    return successResponse(res, {
      title,
      chunksCreated: chunks.length,
    }, 'Document ingested into MongoDB Atlas Vector Search successfully', 201);
  } catch (err) {
    next(err);
  }
}

