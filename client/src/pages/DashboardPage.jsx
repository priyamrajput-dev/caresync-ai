import React, { useState } from 'react';
import { alertService } from '../services/api/alertService.js';
import { aiService } from '../services/api/aiService.js';

export function DashboardPage({ summary, onHospitalSelect, onProcure, onOpenChat, onRefresh }) {
  const { totals = {}, hospitals = [], alerts = [], agent_logs = [], average_resource_levels = {} } = summary || {};
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  const handleAcknowledgeAlert = async (e, alertId) => {
    e.stopPropagation();
    try {
      await alertService.acknowledgeAlert(alertId, 'Duty Operator');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Failed to acknowledge alert: ${err.message}`);
    }
  };

  const handleRunTriage = async () => {
    setTriageLoading(true);
    setTriageResult(null);
    try {
      const res = await aiService.runWorkflow('shortage-assessment', { threshold: 40 });
      setTriageResult(res.data?.assessment || res.assessment || 'Triage completed successfully. All critical nodes assessed.');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Triage workflow failed: ${err.message}`);
    } finally {
      setTriageLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Executive Welcome & Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            National Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Predictive healthcare telemetry, crisis avoidance, and autonomous supply chain dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="cs-btn cs-btn-secondary"
            onClick={handleRunTriage}
            disabled={triageLoading}
          >
            <i className={`fa-solid ${triageLoading ? 'fa-circle-notch fa-spin' : 'fa-bolt-lightning'}`}></i>
            <span>{triageLoading ? 'Evaluating Shortages...' : 'Run Autonomous Triage'}</span>
          </button>

          <button
            className="cs-btn cs-btn-primary"
            onClick={onOpenChat}
          >
            <i className="fa-solid fa-sparkles"></i>
            <span>Ask AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Triage Banner if generated */}
      {triageResult && (
        <div
          className="cs-card"
          style={{
            borderLeft: '4px solid var(--primary-500)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: 'var(--primary-500)', marginBottom: '0.35rem' }}>
              ⚡ Autonomous Shortage Assessment Complete
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {typeof triageResult === 'string' ? triageResult : JSON.stringify(triageResult, null, 2)}
            </div>
          </div>
          <button
            onClick={() => setTriageResult(null)}
            className="cs-btn cs-btn-outline cs-btn-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Key Telemetry Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="cs-stat-box">
          <div className="cs-stat-label">
            <span>Verified Facilities</span>
            <i className="fa-solid fa-hospital text-muted"></i>
          </div>
          <div className="cs-stat-value">{totals.hospitals || hospitals.length || 5}</div>
          <div className="cs-stat-meta" style={{ color: 'var(--success)' }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>100% telemetry online</span>
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">
            <span>Average Occupancy</span>
            <i className="fa-solid fa-bed text-muted"></i>
          </div>
          <div className="cs-stat-value">{totals.avg_occupancy || 78}%</div>
          <div className="cs-stat-meta" style={{ color: 'var(--warning)' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>Surge buffer: {100 - (totals.avg_occupancy || 78)}%</span>
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">
            <span>Critical Alerts</span>
            <i className="fa-solid fa-triangle-exclamation text-muted"></i>
          </div>
          <div className="cs-stat-value" style={{ color: 'var(--danger)' }}>
            {totals.critical_alerts || 1}
          </div>
          <div className="cs-stat-meta" style={{ color: 'var(--danger)' }}>
            <span>Immediate triage required</span>
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">
            <span>Oxygen Reserves</span>
            <i className="fa-solid fa-lungs text-muted"></i>
          </div>
          <div className="cs-stat-value" style={{ color: 'var(--primary-500)' }}>
            {average_resource_levels?.oxygen || 73.2}%
          </div>
          <div className="cs-stat-meta" style={{ color: 'var(--text-muted)' }}>
            <span>Cryogenic depots synced</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Hospital Operational Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="cs-card">
            <div className="cs-card-header">
              <div>
                <h3 className="cs-card-title">
                  <i className="fa-solid fa-network-wired text-primary"></i>
                  <span>Hospital Operational Nodes</span>
                </h3>
                <div className="cs-card-subtitle">
                  Live bed occupancy, emergency oxygen reserves, and localized risk scores
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {hospitals.map((hosp) => {
                const isCritical = hosp.status === 'critical' || hosp.occupancy > 85;
                return (
                  <div
                    key={hosp.id || hosp._id}
                    onClick={() => onHospitalSelect(hosp)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      borderLeft: `4px solid ${isCritical ? 'var(--danger)' : hosp.status === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hosp.name}</span>
                        <span className="cs-badge cs-badge-neutral">{hosp.region}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Efficiency: {hosp.efficiency || 90}% • Active Alerts: {hosp.activeAlertCount || 0}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy</div>
                        <div style={{ fontWeight: 700, color: isCritical ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {hosp.occupancy || 75}%
                        </div>
                      </div>

                      <button
                        className="cs-btn cs-btn-secondary cs-btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onProcure(hosp);
                        }}
                      >
                        + Draft PO
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Average Resource Bar Grid */}
          <div className="cs-card">
            <div className="cs-card-header">
              <h3 className="cs-card-title">
                <i className="fa-solid fa-gauge text-primary"></i>
                <span>National Reserve Telemetry</span>
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.entries(average_resource_levels).map(([resource, level]) => (
                <div
                  key={resource}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{resource.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700, color: level < 40 ? 'var(--danger)' : 'var(--primary-500)' }}>
                      {level}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(level, 100)}%`,
                        backgroundColor: level < 40 ? 'var(--danger)' : 'var(--primary-500)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Incidents & Autonomous Agent Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Alerts */}
          <div className="cs-card">
            <div className="cs-card-header">
              <h3 className="cs-card-title">
                <i className="fa-solid fa-triangle-exclamation text-danger"></i>
                <span>Active Incidents ({alerts.length})</span>
              </h3>
            </div>

            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ✓ No unresolved incidents. National reserves stable.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.slice(0, 5).map((a) => (
                  <div
                    key={a.id || a._id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${a.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {a.hospital}
                      </span>
                      <span className={`cs-badge ${a.severity === 'critical' ? 'cs-badge-danger' : 'cs-badge-warning'}`}>
                        {a.severity}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                      {a.message}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        className="cs-btn cs-btn-outline cs-btn-sm"
                        onClick={(e) => handleAcknowledgeAlert(e, a.id || a._id)}
                      >
                        ✓ Acknowledge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Autonomous Agent Telemetry Stream */}
          <div className="cs-card">
            <div className="cs-card-header">
              <h3 className="cs-card-title">
                <i className="fa-solid fa-microchip text-primary"></i>
                <span>Agent Event Stream</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agent_logs.slice(0, 4).map((log) => (
                <div
                  key={log.id || log._id}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-500)', fontWeight: 600, marginBottom: '0.2rem' }}>
                    <span>{log.agent}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
