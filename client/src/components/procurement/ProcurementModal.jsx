import React, { useState } from 'react';
import { procurementService } from '../../services/api/procurementService.js';

export function ProcurementModal({ isOpen, hospital, onClose, onOrderCreated }) {
  const [resourceName, setResourceName] = useState('Medical Oxygen Cylinders');
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState('Critical stock replenishment triggered via CareSync AI.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await procurementService.createOrder({
        hospital_id: hospital?.id || hospital?._id,
        resource_type: resourceName,
        resource_name: resourceName,
        quantity: Number(quantity),
        priority: 'high',
        notes,
      });

      if (onOrderCreated) onOrderCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit procurement order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-backdrop" onClick={onClose}>
      <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Draft Emergency Procurement Order
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Target Facility: <strong>{hospital?.name || 'Selected Facility'}</strong>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cs-btn cs-btn-outline cs-btn-sm"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-surface)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="cs-input-group">
            <label className="cs-label">Critical Medical Resource</label>
            <select
              className="cs-select"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
            >
              <option value="Medical Oxygen Cylinders">Medical Oxygen Cylinders (7000L Cryogenic)</option>
              <option value="Mechanical Ventilators">Mechanical Intensive Care Ventilators</option>
              <option value="ICU Beds">Electric ICU Surge Beds</option>
              <option value="Emergency Antibiotics">Emergency Broad-Spectrum Antibiotics</option>
              <option value="N95 Respirators">N95 Particulate Respirator Boxes</option>
            </select>
          </div>

          <div className="cs-input-group">
            <label className="cs-label">Order Quantity (Units)</label>
            <input
              type="number"
              className="cs-input"
              min="1"
              max="5000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="cs-input-group">
            <label className="cs-label">Clinical Justification & Notes</label>
            <textarea
              className="cs-textarea"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain justification for emergency dispatch..."
            />
          </div>

          {/* Supplier Protocol Info Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              🛡️ Human-in-the-Loop Protocol:
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Orders will be saved as <strong>DRAFT</strong>. Facility operators or regional directors must review and approve before supplier dispatch.
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="cs-btn cs-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cs-btn cs-btn-primary" disabled={loading}>
              {loading ? 'Transmitting Draft...' : 'Submit Draft Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
