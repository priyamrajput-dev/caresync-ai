import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';

export function LandingPage({ onEnter, onOpenLogin }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Background glow decoration */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '860px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            marginBottom: '1.75rem',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
              display: 'inline-block',
            }}
          />
          <span>LIVE TELEMETRY</span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span style={{ color: 'var(--primary-500)' }}>MONGODB ATLAS ACTIVE</span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span>GROQ 120B ENGINE</span>
        </div>

        {/* Brand Icon & Heading */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), #2563eb)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 0 20px var(--primary-glow)',
            }}
          >
            <i className="fa-solid fa-staff-snake"></i>
          </div>
          <h1
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              margin: 0,
              color: 'var(--text-primary)',
            }}
          >
            CareSync <span style={{ color: 'var(--primary-500)' }}>AI</span>
          </h1>
        </div>

        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
          }}
        >
          Autonomous Healthcare Intelligence & Regional Supply Chain Operations
        </h2>

        <p
          style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto 2.25rem',
          }}
        >
          Continuous bed occupancy monitoring, medical oxygen burn rate predictive analytics,
          automated tier-1 supplier negotiations, and grounded RAG vector search over national clinical protocols.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="cs-btn cs-btn-primary"
            onClick={onEnter}
            style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 600 }}
          >
            <i className="fa-solid fa-shield-halved"></i>
            Launch Command Center
          </button>

          <button
            className="cs-btn cs-btn-secondary"
            onClick={onOpenLogin}
            style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
          >
            <i className="fa-solid fa-id-badge"></i>
            Duty Staff Sign In
          </button>

          <button
            className="cs-btn cs-btn-outline"
            onClick={toggleTheme}
            style={{ padding: '0.85rem 1rem' }}
            title="Toggle Visual Theme"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>

        {/* Feature Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            textAlign: 'left',
          }}
        >
          <div className="cs-card">
            <div style={{ color: 'var(--primary-500)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-lungs"></i>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Oxygen Crisis Avoidance
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Continuous burn rate telemetry alerting before regional reserves drop below safe thresholds.
            </div>
          </div>

          <div className="cs-card">
            <div style={{ color: 'var(--success)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-truck-fast"></i>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Autonomous Procurement
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              AI vendor evaluation, automated price quote audits, and human-in-the-loop purchase drafting.
            </div>
          </div>

          <div className="cs-card">
            <div style={{ color: '#8b5cf6', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-brain"></i>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Atlas Vector Retrieval
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              High-dimensional semantic retrieval over Indian clinical emergency protocols and supplier SLAs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
