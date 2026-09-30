import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/api/aiService.js';

export function AiCopilotDrawer({ isOpen, onClose, selectedHospital, onOpenProcure }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'CareSync Autonomous Operations Copilot active.\n\nI am connected to the national healthcare telemetry feed and MongoDB Atlas Vector Search. I can inspect hospital burn rates, search verified tier-1 suppliers, and draft emergency procurement orders.',
      toolCalls: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedHospital) {
      setInput(`Evaluate the resource capacity and active alerts for ${selectedHospital.name}.`);
    }
  }, [selectedHospital]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Check oxygen inventory at AIIMS New Delhi',
    'Find suppliers for mechanical ventilators with lead time < 4 days',
    'Evaluate nationwide ICU bed occupancy warnings',
    'What clinical triage protocol applies when oxygen is below 40%?',
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      setCurrentStep('Analyzing query context & parameters...');
      await new Promise((r) => setTimeout(r, 300));
      setCurrentStep('Executing autonomous ReAct tool dispatch...');

      const res = await aiService.chat(
        query,
        messages.map((m) => ({ role: m.role, content: m.content })),
        selectedHospital?.id || selectedHospital?._id
      );

      const assistantMsg = {
        role: 'assistant',
        content: res.data?.response || res.response || 'Telemetry analysis generated.',
        toolCalls: res.data?.toolCalls || res.toolCalls || [],
        disclaimer: res.data?.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Operational Error: ${err.message || 'Failed to communicate with AI service'}`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setCurrentStep(null);
    }
  };

  return (
    <>
      <div className="cs-backdrop" onClick={onClose} style={{ zIndex: 59 }} />

      <aside className="cs-drawer">
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-surface)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
              }}
            >
              <i className="fa-solid fa-sparkles"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                CareSync AI Copilot
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {selectedHospital ? `Focused: ${selectedHospital.name}` : 'Global Network Scope'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cs-btn cs-btn-outline cs-btn-sm"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Message feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Message Header */}
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{m.role === 'user' ? 'You (Operator)' : 'AI Autonomous Copilot'}</span>
                <span>• {m.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '90%',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  backgroundColor:
                    m.role === 'user' ? 'var(--primary-500)' : 'var(--bg-surface-elevated)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'pre-line',
                }}
              >
                {m.content}

                {/* Render Tool Calls if present */}
                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--primary-500)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <div style={{ color: 'var(--primary-500)', fontWeight: 700, marginBottom: '0.35rem' }}>
                      ⚡ Executed Operational Tools:
                    </div>
                    {m.toolCalls.map((tc, tIdx) => (
                      <div key={tIdx} style={{ color: 'var(--text-secondary)' }}>
                        • <strong>{tc.name}</strong> ({JSON.stringify(tc.args)})
                      </div>
                    ))}
                  </div>
                )}

                {/* Non-diagnostic Disclaimer */}
                {m.role === 'assistant' && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    🛡️ Notice: CareSync AI provides operational logistics intelligence only. Clinical decisions require licensed physician confirmation.
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Step Progress Indicator */}
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                fontSize: '0.825rem',
                color: 'var(--primary-500)',
              }}
            >
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>{currentStep || 'Synthesizing operational guidance...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset query chips */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
          }}
        >
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              className="cs-badge cs-badge-neutral"
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => handleSend(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              className="cs-input"
              placeholder="Ask Copilot (e.g. Check ICU burn rate, draft oxygen PO)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="cs-btn cs-btn-primary"
              disabled={loading || !input.trim()}
              style={{ padding: '0 1.25rem' }}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
