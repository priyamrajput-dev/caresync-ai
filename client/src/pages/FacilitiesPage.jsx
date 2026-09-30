import React, { useState } from 'react';

export function FacilitiesPage({ hospitals = [], onSelectHospital, onProcure }) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  const regions = ['all', ...new Set(hospitals.map((h) => h.region).filter(Boolean))];

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      h.name?.toLowerCase().includes(search.toLowerCase()) ||
      h.region?.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === 'all' || h.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Filter Bar */}
      <div
        className="cs-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="cs-input"
            placeholder="Search facility by name or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="cs-select"
            style={{ width: 'auto', minWidth: '160px' }}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="all">All Regions</option>
            {regions.filter((r) => r !== 'all').map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredHospitals.length}</strong> verified medical facilities
        </div>
      </div>

      {/* Facilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {filteredHospitals.map((hosp) => {
          const isCritical = hosp.status === 'critical' || hosp.occupancy > 85;
          return (
            <div
              key={hosp.id || hosp._id}
              className="cs-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${isCritical ? 'var(--danger)' : hosp.status === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {hosp.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {hosp.region} • {hosp.country || 'National Network'}
                    </div>
                  </div>
                  <span
                    className={`cs-badge ${
                      isCritical ? 'cs-badge-danger' : hosp.status === 'warning' ? 'cs-badge-warning' : 'cs-badge-success'
                    }`}
                  >
                    {isCritical ? 'Critical Load' : hosp.status === 'warning' ? 'Elevated' : 'Optimal'}
                  </span>
                </div>

                {/* Metrics */}
                <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bed Occupancy</span>
                      <span style={{ fontWeight: 700, color: isCritical ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {hosp.occupancy || 75}%
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${hosp.occupancy || 75}%`,
                          backgroundColor: isCritical ? 'var(--danger)' : 'var(--primary-500)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Efficiency</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{hosp.efficiency || 92}%</div>
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Alerts</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: hosp.activeAlertCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {hosp.activeAlertCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="cs-btn cs-btn-secondary cs-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onSelectHospital(hosp)}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Inspect Telemetry</span>
                </button>
                <button
                  className="cs-btn cs-btn-primary cs-btn-sm"
                  onClick={() => onProcure(hosp)}
                >
                  <i className="fa-solid fa-cart-plus"></i>
                  <span>Draft PO</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
