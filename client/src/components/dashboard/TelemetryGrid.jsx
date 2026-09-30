import React from 'react';

export function TelemetryGrid({ totals = {} }) {
  const criticalCount = totals.critical_inventory_items || 0;
  const avgOccupancy = totals.avg_occupancy || 75;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">
          <i className="fa-solid fa-hospital mr-2 text-primary"></i> Monitored Facilities
        </div>
        <div className="stat-value">{totals.hospitals || 0}</div>
        <div className="stat-change">
          <i className="fa-solid fa-circle-check text-success"></i> All facilities reporting telemetry
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <i className="fa-solid fa-bed-pulse mr-2 text-primary"></i> Average Occupancy
        </div>
        <div className="stat-value">{avgOccupancy}%</div>
        <div className={avgOccupancy > 85 ? 'stat-change down' : 'stat-change'}>
          <i className={`fa-solid fa-arrow-trend-${avgOccupancy > 85 ? 'up' : 'down'}`}></i>{' '}
          {avgOccupancy > 85 ? 'High Network Surge' : 'Stable Bed Availability'}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <i className="fa-solid fa-triangle-exclamation mr-2 text-warning"></i> Critical Shortage Alerts
        </div>
        <div className="stat-value" style={{ color: criticalCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
          {criticalCount}
        </div>
        <div className={criticalCount > 0 ? 'stat-change down' : 'stat-change'}>
          <i className={`fa-solid fa-${criticalCount > 0 ? 'circle-exclamation' : 'check-circle'}`}></i>{' '}
          {criticalCount > 0 ? 'Immediate Procurement Advised' : 'Optimal Inventory Buffers'}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          <i className="fa-solid fa-bell mr-2 text-primary"></i> Open Active Alerts
        </div>
        <div className="stat-value">{totals.open_alerts || totals.active_alerts || 0}</div>
        <div className="stat-change">
          <i className="fa-solid fa-clock-rotate-left"></i> Real-time Incident Feed
        </div>
      </div>
    </div>
  );
}
