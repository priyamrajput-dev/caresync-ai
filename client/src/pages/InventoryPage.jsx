import React, { useState, useEffect } from 'react';
import { hospitalService } from '../services/api/hospitalService.js';

export function InventoryPage({ hospitals = [], onProcure }) {
  const [selectedHospitalId, setSelectedHospitalId] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [selectedHospitalId]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      if (selectedHospitalId === 'all') {
        const promises = hospitals.map((h) => hospitalService.getInventory(h.id || h._id));
        const results = await Promise.all(promises);
        const combined = [];
        results.forEach((res, idx) => {
          const hosp = hospitals[idx];
          const list = res.inventory || res || [];
          list.forEach((item) => {
            combined.push({
              ...item,
              hospitalName: hosp.name,
              hospitalId: hosp.id || hosp._id,
            });
          });
        });
        setInventoryItems(combined);
      } else {
        const hosp = hospitals.find((h) => (h.id || h._id) === selectedHospitalId);
        const res = await hospitalService.getInventory(selectedHospitalId);
        const list = res.inventory || res || [];
        setInventoryItems(
          list.map((item) => ({
            ...item,
            hospitalName: hosp?.name || 'Selected Facility',
            hospitalId: selectedHospitalId,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const name = item.resourceName || item.resource_name || item.name || '';
    const cat = item.category || 'general';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || cat.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
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
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="cs-input"
            placeholder="Search resource (e.g. Oxygen, Remdesivir, Ventilator)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
          />

          <select
            className="cs-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
          >
            <option value="all">All Medical Facilities</option>
            {hospitals.map((h) => (
              <option key={h.id || h._id} value={h.id || h._id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            className="cs-select"
            style={{ width: 'auto', minWidth: '150px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="gas">Medical Gases</option>
            <option value="icu">ICU Life Support</option>
            <option value="pharma">Critical Pharma</option>
            <option value="ppe">Protective Gear (PPE)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tracking <strong>{filteredItems.length}</strong> critical resource streams
        </div>
      </div>

      {/* Clean Tabular Display */}
      <div className="cs-card" style={{ padding: '0.5rem 0' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--primary-500)' }}>
            <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i>
            <div>Syncing granular stock telemetry...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No inventory items matching current filters.
          </div>
        ) : (
          <div className="cs-table-container" style={{ border: 'none' }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Facility</th>
                  <th>Current Level vs Capacity</th>
                  <th>Daily Burn Rate</th>
                  <th>Buffer (Days)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const stock = item.currentLevel ?? item.current_stock ?? item.quantity ?? 50;
                  const cap = item.capacity ?? item.maximum_capacity ?? 100;
                  const pct = Math.min(Math.round((stock / cap) * 100), 100);
                  const isCrit = stock < 30 || item.status === 'critical';
                  const isWarn = (stock >= 30 && stock < 60) || item.status === 'warning';

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.resourceName || item.resource_name || item.name || 'Critical Resource'}
                      </td>
                      <td>{item.hospitalName || 'National Center'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '160px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                backgroundColor: isCrit ? 'var(--danger)' : isWarn ? 'var(--warning)' : 'var(--success)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '32px' }}>{pct}%</span>
                        </div>
                      </td>
                      <td>{item.burnRate ?? item.burn_rate_daily ?? '4.2'}/day</td>
                      <td style={{ fontWeight: 700, color: isCrit ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {item.daysRemaining ?? item.days_remaining ?? Math.round(stock / 4.2)} days
                      </td>
                      <td>
                        <span
                          className={`cs-badge ${
                            isCrit ? 'cs-badge-danger' : isWarn ? 'cs-badge-warning' : 'cs-badge-success'
                          }`}
                        >
                          {isCrit ? 'Critical Depletion' : isWarn ? 'Low Stock' : 'Stable'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="cs-btn cs-btn-secondary cs-btn-sm"
                          onClick={() =>
                            onProcure({
                              id: item.hospitalId,
                              _id: item.hospitalId,
                              name: item.hospitalName,
                            })
                          }
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
