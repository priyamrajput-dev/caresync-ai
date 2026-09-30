import React, { useState, useEffect } from 'react';
import { alertService } from '../services/api/alertService.js';

export function AlertsPage({ onProcure, hospitals = [] }) {
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, [filterSeverity]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertService.getAlerts({
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
      });
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    setResolvingId(alertId);
    try {
      await alertService.resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
      );
    } catch (err) {
      alert(`Failed to resolve alert: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' && a.status !== 'resolved'
  ).length;
  const warningCount = alerts.filter(
    (a) => (a.severity === 'high' || a.severity === 'moderate') && a.status !== 'resolved'
  ).length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'cs-badge-danger';
      case 'high':
      case 'moderate':
        return 'cs-badge-warning';
      default:
        return 'cs-badge-info';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title Strip */}
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
            Emergency Incident & Shortage Response Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Live clinical operational alerts, shortage triggers, and automated safety threshold monitoring
          </p>
        </div>

        <button className="cs-btn cs-btn-secondary cs-btn-sm" onClick={loadAlerts}>
          <i className="fa-solid fa-rotate"></i>
          Sync Alert Feed
        </button>
      </div>

      {/* KPI Stat Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="cs-stat-box">
          <div className="cs-stat-label">Critical Incidents</div>
          <div className="cs-stat-value" style={{ color: 'var(--danger)' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Immediate medical supply jeopardy
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">Capacity Warnings</div>
          <div className="cs-stat-value" style={{ color: 'var(--warning)' }}>
            {warningCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Surge and bed occupancy risks
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">Resolved Today</div>
          <div className="cs-stat-value" style={{ color: 'var(--success)' }}>
            {resolvedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Averted clinical shortages
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">Total Telemetry Events</div>
          <div className="cs-stat-value" style={{ color: 'var(--primary-500)' }}>
            {alerts.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Monitored regional nodes
          </div>
        </div>
      </div>

      {/* Main Alert List Panel */}
      <div className="cs-card">
        {/* Severity Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'critical', 'high', 'moderate', 'low'].map((sev) => {
              const active = filterSeverity === sev;
              return (
                <button
                  key={sev}
                  className={`cs-btn cs-btn-sm ${active ? 'cs-btn-primary' : 'cs-btn-outline'}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}
                  onClick={() => setFilterSeverity(sev)}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{alerts.length}</strong> active alerts
          </span>
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-500)', marginBottom: '0.75rem' }}></i>
            <div>Syncing emergency incident streams...</div>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: 'var(--success)', marginBottom: '0.75rem' }}></i>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No Active Alerts in this Category
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              All regional facilities are currently operating within safe clinical reserves.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map((a) => {
              const isResolved = a.status === 'resolved';
              const isCritical = a.severity === 'critical';
              const hospital = hospitals.find(
                (h) => (h.id || h._id) === a.hospitalId || h.name === a.hospital
              );

              return (
                <div
                  key={a.id || a._id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isResolved ? 'rgba(148, 163, 184, 0.03)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isResolved ? 'var(--border-subtle)' : isCritical ? 'var(--danger-border)' : 'var(--border-default)'}`,
                    borderLeft: `4px solid ${isResolved ? 'var(--text-dim)' : isCritical ? 'var(--danger)' : 'var(--warning)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    opacity: isResolved ? 0.65 : 1,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <span className={`cs-badge ${getSeverityBadgeClass(a.severity)}`}>
                        {a.severity?.toUpperCase()}
                      </span>

                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {a.hospital || 'Regional Node'}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(a.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {a.message}
                    </div>

                    {isResolved && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                        <i className="fa-solid fa-check"></i>
                        <span>Resolved by Operator</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {hospital && !isResolved && (
                      <button
                        className="cs-btn cs-btn-primary cs-btn-sm"
                        onClick={() => onProcure(hospital)}
                      >
                        <i className="fa-solid fa-cart-plus"></i>
                        Order Supplies
                      </button>
                    )}

                    {!isResolved ? (
                      <button
                        className="cs-btn cs-btn-outline cs-btn-sm"
                        disabled={resolvingId === (a.id || a._id)}
                        onClick={() => handleResolve(a.id || a._id)}
                      >
                        {resolvingId === (a.id || a._id) ? (
                          <i className="fa-solid fa-circle-notch fa-spin"></i>
                        ) : (
                          <>
                            <i className="fa-solid fa-check"></i>
                            Resolve
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="cs-badge cs-badge-success" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                        RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
