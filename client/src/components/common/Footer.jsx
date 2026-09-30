import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 className="text-primary font-bold text-xl mb-2">CareSync AI</h3>
          <p className="text-muted text-sm" style={{ maxWidth: '400px' }}>
            Autonomous Healthcare Operations Intelligence Platform. Predicting and preventing healthcare resource
            crises using AI agents, live telemetry, and MongoDB Atlas Vector Search.
          </p>
        </div>

        <div className="footer-col">
          <h4>Infrastructure</h4>
          <div className="footer-links">
            <span className="text-sm text-dim">MERN Stack (Express + MongoDB)</span>
            <span className="text-sm text-dim">Atlas Vector Search</span>
            <span className="text-sm text-dim">Anthropic Claude AI</span>
            <span className="text-sm text-dim">Multi-Agent ReAct Engine</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Governance & Safety</h4>
          <div className="footer-links">
            <span className="text-sm text-dim">Clinical Safety Guardrails</span>
            <span className="text-sm text-dim">Role-Based Access Control</span>
            <span className="text-sm text-dim">Human-in-the-Loop Procurement</span>
            <span className="text-sm text-dim">Non-diagnostic Operational Support</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2026 CareSync AI Operations Center. All rights reserved.</div>
        <div className="footer-credits">
          Status: <span style={{ color: 'var(--success)', fontWeight: 600 }}>OPERATIONAL (MERN)</span>
        </div>
      </div>
    </footer>
  );
}

