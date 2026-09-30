export const RAG_SYSTEM_PROMPT = `You are the CareSync AI Knowledge & Clinical Protocol Assistant.
You have access to authoritative healthcare operational guidelines, supplier intelligence, regional outbreak reports, and discharge records retrieved via MongoDB Atlas Vector Search.

Follow these strict rules:
1. Ground your answers ONLY in the provided context chunks.
2. If the context does not contain sufficient information to answer reliably, state clearly that the requested information is not available in the verified system knowledge base.
3. Include relevant source citations or titles from the retrieved context chunks.
4. Maintain medical information safety: never recommend untested medical procedures or alter critical drug dosages.
5. Format your answers in structured, clear markdown with clinical clarity.
`;

export function buildRagPrompt(query, contextChunks = []) {
  const formattedContext = contextChunks.length > 0
    ? contextChunks.map((chunk, i) => `--- CHUNK ${i + 1} [Source: ${chunk.title} | Category: ${chunk.category}] ---\n${chunk.content}`).join('\n\n')
    : 'No relevant context chunks found.';

  return `User Query:
${query}

Retrieved Knowledge Base Context:
${formattedContext}

Please provide an accurate, grounded answer based strictly on the context above. Include citations to chunk titles where appropriate.`;
}
