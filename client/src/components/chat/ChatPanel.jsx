import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/api/aiService.js';

export function ChatPanel({ isOpen, onClose, selectedHospital }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content:
                '👋 Hello! I am CareSync AI Procurement & Operations Agent. I monitor hospital inventory, ICU occupancy, and supplier catalogs in real-time. Ask me to check inventory, rank suppliers, review active alerts, or draft a purchase order.',
        },
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (messageText) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || loading) return;

        const userMessage = { role: 'user', content: textToSend.trim() };
        const updatedHistory = [...messages, userMessage];
        setMessages(updatedHistory);
        setInput('');
        setLoading(true);

        try {
            const result = await aiService.sendMessage({
                message: textToSend.trim(),
                history: updatedHistory.slice(-8),
                hospital_id: selectedHospital?.id || null,
            });

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: result.response,
                    toolCalls: result.tool_calls || [],
                    tokensUsed: result.tokens_used,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `⚠️ Failed to receive agent response: ${err.message}. Please verify backend connectivity.`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt) => {
        handleSend(prompt);
    };

    return (
        <>
            <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
                <div
                    className="modal-header"
                    style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="font-bold text-primary flex items-center gap-2">
                            <i className="fa-solid fa-wand-magic-sparkles"></i> CareSync ReAct Agent
                        </span>
                        {selectedHospital && (
                            <span className="badge warning text-xs" style={{ padding: '2px 8px' }}>
                                Focus: {selectedHospital.name}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="btn-ghost" title="Close Panel">
                        <i className="fa-solid fa-chevron-down"></i>
                    </button>
                </div>

                <div className="modal-body flex flex-col" style={{ padding: 0 }}>
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '1.2rem',
                        }}
                    >
                        {messages.map((m, i) => (
                            <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>
                                {m.content}

                                {m.toolCalls && m.toolCalls.length > 0 && (
                                    <div className="tool-calls-container mt-2 pt-2 border-t border-white/10 text-xs">
                                        <div className="text-dim font-bold mb-1 flex items-center gap-1">
                                            <i className="fa-solid fa-gears text-primary"></i> Tool
                                            Execution Trace:
                                        </div>
                                        {m.toolCalls.map((tc, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-black/30 p-2 rounded border border-white/5 mb-1 font-mono text-xs"
                                            >
                                                <span className="text-primary font-bold">
                                                    {tc.tool}
                                                </span>
                                                ({JSON.stringify(tc.input || {})})
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {m.tokensUsed && (
                                    <div className="text-right text-dim text-xs mt-1 font-mono">
                                        tokens: {m.tokensUsed}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="msg ai flex items-center gap-2">
                                <i className="fa-solid fa-circle-notch fa-spin text-primary"></i>
                                <span>Agent reasoning and tool execution in progress...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-2 border-t border-white/10 bg-black/20 flex gap-2 flex-wrap">
                        <button
                            className="btn-ghost text-xs"
                            style={{ padding: '4px 8px' }}
                            onClick={() =>
                                handleQuickPrompt('Check oxygen and ICU levels at AIIMS')
                            }
                        >
                            Oxygen Status AIIMS
                        </button>
                        <button
                            className="btn-ghost text-xs"
                            style={{ padding: '4px 8px' }}
                            onClick={() =>
                                handleQuickPrompt(
                                    'Search available oxygen suppliers with lowest lead time',
                                )
                            }
                        >
                            Top Oxygen Suppliers
                        </button>
                        <button
                            className="btn-ghost text-xs"
                            style={{ padding: '4px 8px' }}
                            onClick={() =>
                                handleQuickPrompt('Show open alerts for AIIMS New Delhi')
                            }
                        >
                            Active Alerts
                        </button>
                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid var(--border)' }}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2 w-full"
                    >
                        <input
                            className="w-full bg-black/30 border border-white/10 text-white px-3 py-2 rounded text-sm focus:border-primary"
                            placeholder="Ask agent about inventory, alerts, or suppliers..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            className="btn px-4"
                            disabled={loading || !input.trim()}
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>

            <div className="ai-fab" onClick={onClose} title="Toggle AI Copilot">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
        </>
    );
}
