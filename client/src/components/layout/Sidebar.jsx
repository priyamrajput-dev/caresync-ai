import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ activeNav, onNavChange, alertCount = 0, isOpen, onClose }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: 'fa-gauge-high' },
    { id: 'facilities', label: 'Medical Facilities', icon: 'fa-hospital' },
    { id: 'inventory', label: 'Critical Resources', icon: 'fa-boxes-stacked' },
    { id: 'alerts', label: 'Emergency Alerts', icon: 'fa-triangle-exclamation', badge: alertCount },
    { id: 'procurement', label: 'Procurement Orders', icon: 'fa-file-invoice-dollar' },
    { id: 'discharge', label: 'Clinical Discharges', icon: 'fa-file-waveform' },
    { id: 'rag', label: 'Protocol RAG', icon: 'fa-brain' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="cs-backdrop"
          style={{ zIndex: 25 }}
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <i className="fa-solid fa-staff-snake"></i>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="sidebar-brand-text">CareSync</span>
            <span className="sidebar-brand-badge">AI</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="sidebar-nav">
          <div className="sidebar-nav-heading">Operational Matrix</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => {
                onNavChange(item.id);
                if (onClose) onClose();
              }}
            >
              <div className="sidebar-nav-item-left">
                <i className={`fa-solid ${item.icon}`}></i>
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="cs-badge cs-badge-danger" style={{ fontSize: '0.7rem', padding: '1px 6px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="sidebar-footer">
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="cs-status-dot active"></span>
              <strong style={{ color: 'var(--text-primary)' }}>Atlas Vector DB</strong>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>Live • Groq OSS-120B Connected</div>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--primary-surface)',
                  color: 'var(--primary-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role || 'Operator'}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
