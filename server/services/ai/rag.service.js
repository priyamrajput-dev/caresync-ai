import { vectorService } from './vector.service.js';
import { llmService } from './llm.service.js';
import { buildRagPrompt, RAG_SYSTEM_PROMPT } from '../../prompts/rag.prompt.js';
import { guardrailsService } from './guardrails.service.js';
import { logger } from '../../utils/logger.js';

export class RagService {
    /**
     * Executes RAG workflow over MongoDB Atlas Vector Search knowledge base.
     *
     * @param {string} query - Natural language query
     * @param {Object} [options={}] - Options (category, region, limit)
     * @returns {Promise<{answer: string, sources: Array, tokensUsed: number}>}
     */
    async answerWithRetrieval(query, options = {}) {
        const validation = guardrailsService.validateInput(query);
        if (!validation.isValid) {
            return {
                answer: `⚠️ Input validation alert: ${validation.error}`,
                sources: [],
                tokensUsed: 0,
            };
        }
        const cleanQuery = validation.sanitized;

        // 1. Vector Retrieval from MongoDB Atlas Vector Search
        const searchLimit = options.limit || 4;
        const searchResults = await vectorService.searchSimilar(cleanQuery, {
            limit: searchLimit,
            category: options.category,
            region: options.region,
        });

        const sources = searchResults.map((r) => ({
            id: r.chunk._id ? r.chunk._id.toString() : null,
            title: r.chunk.title,
            category: r.chunk.category,
            region: r.chunk.region,
            score: Math.round(r.score * 100) / 100,
            contentPreview: r.chunk.content.slice(0, 150) + '...',
        }));

        const contextChunks = searchResults.map((r) => ({
            title: r.chunk.title,
            category: r.chunk.category,
            content: r.chunk.content,
        }));

        // 2. Synthesize Prompt
        const promptContent = buildRagPrompt(cleanQuery, contextChunks);

        // 3. Call LLM with Context
        let llmResult;
        try {
            llmResult = await llmService.callWithTools({
                systemPrompt: RAG_SYSTEM_PROMPT,
                messages: [{ role: 'user', content: promptContent }],
                maxTokens: 1024,
                temperature: 0.1,
            });
        } catch (err) {
            logger.error('RAG LLM synthesis error:', err.message);
            return {
                answer: `Retrieved ${sources.length} matching operational records, but encountered an issue synthesizing the final response. Sources: ${sources.map((s) => s.title).join(', ')}`,
                sources,
                tokensUsed: 0,
            };
        }

        const sanitizedAnswer = guardrailsService.sanitizeOutput(llmResult.text, true);

        return {
            answer: sanitizedAnswer,
            sources,
            disclaimer: guardrailsService.CLINICAL_DISCLAIMER,
            tokensUsed: llmResult.usage?.total_tokens || 0,
        };
    }
}

export const ragService = new RagService();
