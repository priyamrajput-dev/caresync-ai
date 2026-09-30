import React, { useState } from 'react';
import { aiService } from '../services/api/aiService.js';

export function RagKnowledgePage() {
  const [query, setQuery] = useState('What are the protocols when oxygen falls below 40%?');
  const [category, setCategory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const presetQueries = [
    'What are the protocols when oxygen falls below 40%?',
    'What are tier-1 supplier SLAs for liquid medical oxygen in North India?',
    'Triage protocol for ICU bed surges during acute respiratory outbreaks',
    'Emergency procurement protocol for mechanical ventilators and invasive monitors',
  ];

  const handleSearch = async (e, customQuery) => {
    if (e) e.preventDefault();
    const q = customQuery || query;
    if (!q.trim() || loading) return;

    if (customQuery) setQuery(customQuery);
    setLoading(true);
    setError(null);

    try {
      const data = await aiService.ragSearch(q, {
        category: category || undefined,
        limit: 4,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Vector search query failed');
    } finally {
      setLoading(false);
    }
  };

  const chunks = result?.chunks || result?.data?.chunks || [];
  const synthesizedResponse = result?.response || result?.data?.response;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            MongoDB Atlas Vector Search & Clinical Knowledge Base
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            High-dimensional semantic retrieval over Indian clinical emergency guidelines, tier-1 supplier agreements, and crisis response SOPs
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-surface)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--primary-500)',
          }}
        >
          <i className="fa-solid fa-brain"></i>
          <span>ATLAS VECTOR SEARCH ACTIVE</span>
        </div>
      </div>

      {/* Query Search Panel */}
      <div className="cs-card">
        <form onSubmit={(e) => handleSearch(e)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="cs-input"
              style={{ flex: 1, minWidth: '320px' }}
              placeholder="Search clinical guidelines, SLAs, or shortage triage standards..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              className="cs-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="guideline">Clinical Guidelines</option>
              <option value="protocol">Triage Protocols</option>
              <option value="supplier_intel">Supplier Intelligence</option>
            </select>

            <button type="submit" className="cs-btn cs-btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span>Execute Vector Search</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompts Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Queries:</span>
            {presetQueries.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="cs-btn cs-btn-outline cs-btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                onClick={() => handleSearch(null, p)}
              >
                {p}
              </button>
            ))}
          </div>
        </form>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--danger-surface)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Synthesized Response (if available) */}
      {synthesizedResponse && (
        <div
          className="cs-card"
          style={{
            borderLeft: '4px solid var(--primary-500)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-surface)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
              }}
            >
              <i className="fa-solid fa-sparkles"></i>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Synthesized Clinical Intelligence
            </h3>
          </div>

          <div
            style={{
              fontSize: '0.9rem',
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {synthesizedResponse}
          </div>
        </div>
      )}

      {/* Retrieved Chunks Grid */}
      {chunks.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Retrieved Semantic Document Chunks ({chunks.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ranked by MongoDB Atlas Vector Cosine Similarity
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {chunks.map((c, idx) => {
              const score = c.score || c.similarity;
              return (
                <div key={idx} className="cs-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="cs-badge cs-badge-primary">
                      {c.category?.toUpperCase() || 'PROTOCOL'}
                    </span>

                    {score !== undefined && (
                      <span
                        className="cs-badge cs-badge-success"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
                      >
                        Similarity: {(Number(score) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {c.title || c.documentTitle || `Document Chunk #${idx + 1}`}
                  </div>

                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                      backgroundColor: 'var(--bg-app)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontFamily: 'var(--font-sans)',
                      flex: 1,
                    }}
                  >
                    {c.text || c.content || c.chunkText}
                  </p>

                  {c.metadata && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Source: {c.metadata.source || 'National Clinical Archive'} • Section: {c.metadata.section || 'General'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
