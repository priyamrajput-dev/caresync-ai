import React, { useState, useEffect } from 'react';
import { procurementService } from '../services/api/procurementService.js';

export function ProcurementOrdersPage({ hospitals = [], onOpenProcureModal }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await procurementService.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load procurement orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await procurementService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => ((o.id || o._id) === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(`Failed to update order status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const hosp = (o.hospital?.name || o.hospital || '').toLowerCase();
    const sup = (o.supplier?.name || o.supplier || '').toLowerCase();
    const item = (o.resourceName || o.item || '').toLowerCase();
    const query = search.toLowerCase();
    return hosp.includes(query) || sup.includes(query) || item.includes(query);
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'cs-badge-success';
      case 'dispatched':
      case 'approved':
        return 'cs-badge-primary';
      case 'draft':
        return 'cs-badge-warning';
      case 'cancelled':
        return 'cs-badge-danger';
      default:
        return 'cs-badge-neutral';
    }
  };

  const totalSpend = orders.reduce(
    (sum, o) => sum + (o.estimatedCost || o.totalAmount || (o.quantity || 0) * (o.unitPrice || 0) || 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
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
            Autonomous Procurement & Supply Logistics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            AI-negotiated supplier purchase orders, delivery tracking, and human-in-the-loop authorization
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="cs-btn cs-btn-secondary cs-btn-sm" onClick={loadOrders}>
            <i className="fa-solid fa-rotate"></i>
            Refresh
          </button>

          <button
            className="cs-btn cs-btn-primary cs-btn-sm"
            onClick={() => onOpenProcureModal(hospitals[0] || null)}
          >
            <i className="fa-solid fa-plus"></i>
            New Purchase Order
          </button>
        </div>
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
          <div className="cs-stat-label">Total Purchase Orders</div>
          <div className="cs-stat-value" style={{ color: 'var(--primary-500)' }}>
            {orders.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all regional nodes
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">Pending Approval</div>
          <div className="cs-stat-value" style={{ color: 'var(--warning)' }}>
            {orders.filter((o) => o.status === 'draft').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Awaiting duty officer sign-off
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">In Transit / Dispatched</div>
          <div className="cs-stat-value" style={{ color: '#3b82f6' }}>
            {orders.filter((o) => o.status === 'dispatched' || o.status === 'approved').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Active regional deliveries
          </div>
        </div>

        <div className="cs-stat-box">
          <div className="cs-stat-label">Committed Spend</div>
          <div className="cs-stat-value" style={{ color: 'var(--success)' }}>
            ₹{(totalSpend / 100000).toFixed(2)}L
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Estimated logistics value
          </div>
        </div>
      </div>

      {/* Filters and Orders Table */}
      <div className="cs-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'draft', 'approved', 'dispatched', 'delivered'].map((st) => (
              <button
                key={st}
                className={`cs-btn cs-btn-sm ${statusFilter === st ? 'cs-btn-primary' : 'cs-btn-outline'}`}
                style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '360px' }}>
            <input
              type="text"
              className="cs-input"
              placeholder="Search by facility, supplier, or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-500)', marginBottom: '0.75rem' }}></i>
            <div>Loading procurement ledger...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <i className="fa-solid fa-file-invoice" style={{ fontSize: '2.5rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}></i>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No Purchase Orders Found
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {statusFilter !== 'all' ? `No orders in '${statusFilter}' status.` : 'No emergency procurement orders have been created yet.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Destination Facility</th>
                  <th>Resource / Item</th>
                  <th>Quantity</th>
                  <th>Assigned Supplier</th>
                  <th>Est. Cost</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Workflow Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const id = ord.id || ord._id;
                  const isUpdating = updatingId === id;
                  const cost = ord.estimatedCost || ord.totalAmount || (ord.quantity || 0) * (ord.unitPrice || 0);

                  return (
                    <tr key={id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 600 }}>
                        {ord.orderNumber || `#PO-${id.slice(-6).toUpperCase()}`}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {ord.hospital?.name || ord.hospital || 'AIIMS New Delhi'}
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>
                          {ord.resourceName || ord.item || 'Liquid Medical Oxygen'}
                        </span>
                        {ord.urgency && (
                          <span
                            className="cs-badge cs-badge-danger"
                            style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}
                          >
                            URGENT
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {ord.quantity?.toLocaleString() || 100} {ord.unit || 'Units'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {ord.supplier?.name || ord.supplier || 'Tier-1 National Vendor'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{Number(cost).toLocaleString()}
                      </td>
                      <td>
                        <span className={`cs-badge ${getStatusBadgeClass(ord.status)}`}>
                          {ord.status?.toUpperCase() || 'DRAFT'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isUpdating ? (
                          <i className="fa-solid fa-circle-notch fa-spin text-primary"></i>
                        ) : (
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {ord.status === 'draft' && (
                              <button
                                className="cs-btn cs-btn-primary cs-btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => handleStatusChange(id, 'approved')}
                              >
                                Approve
                              </button>
                            )}
                            {ord.status === 'approved' && (
                              <button
                                className="cs-btn cs-btn-secondary cs-btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={() => handleStatusChange(id, 'dispatched')}
                              >
                                Dispatch
                              </button>
                            )}
                            {ord.status === 'dispatched' && (
                              <button
                                className="cs-btn cs-btn-outline cs-btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--success)' }}
                                onClick={() => handleStatusChange(id, 'delivered')}
                              >
                                Confirm Delivery
                              </button>
                            )}
                            {ord.status === 'delivered' && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                                <i className="fa-solid fa-circle-check"></i> Fulfilled
                              </span>
                            )}
                          </div>
                        )}
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
