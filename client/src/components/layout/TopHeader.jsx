import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export function TopHeader({ activeNav, onOpenSidebar, onOpenChat, onOpenLogin }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const getNavTitle = (nav) => {
    switch (nav) {
      case 'dashboard':
        return 'National Command Center';
      case 'facilities':
        return 'Hospital Network & Capacity';
      case 'inventory':
        return 'Critical Resource Inventory';
      case 'alerts':
        return 'Emergency Incident Response';
      case 'procurement':
        return 'Autonomous Procurement Orders';
      case 'discharge':
        return 'AI Discharge Summary Documentation';
      case 'rag':
        return 'Clinical Protocol Knowledge Base';
      default:
        return 'Command Center';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="cs-btn cs-btn-secondary cs-btn-sm"
          onClick={onOpenSidebar}
          style={{ display: 'none' }}
          id="mobile-sidebar-toggle"
          aria-label="Toggle Navigation"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            {getNavTitle(activeNav)}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Real-Time Medical Logistics & Telemetry Orchestration
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Network status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <span className="cs-status-dot active"></span>
          <span>Live Operations</span>
        </div>

        {/* AI Copilot Button */}
        <button
          className="cs-btn cs-btn-primary cs-btn-sm"
          onClick={onOpenChat}
          style={{ gap: '0.5rem' }}
        >
          <i className="fa-solid fa-sparkles"></i>
          <span>AI Copilot</span>
          <span
            style={{
              fontSize: '0.65rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-xs)',
              marginLeft: '2px',
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          className="cs-btn cs-btn-secondary cs-btn-sm"
          onClick={toggleTheme}
          title="Toggle Light / Dark Theme"
          style={{ width: '34px', height: '34px', padding: 0 }}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Auth / Login */}
        {user ? (
          <button
            className="cs-btn cs-btn-outline cs-btn-sm"
            onClick={logout}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        ) : (
          <button
            className="cs-btn cs-btn-secondary cs-btn-sm"
            onClick={onOpenLogin}
          >
            <i className="fa-solid fa-user-lock"></i>
            <span>Operator Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
