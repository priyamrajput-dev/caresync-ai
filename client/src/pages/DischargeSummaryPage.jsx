import React, { useState, useEffect } from 'react';
import { dischargeService } from '../services/api/dischargeService.js';

export function DischargeSummaryPage({ hospitals = [] }) {
  const [discharges, setDischarges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDischarge, setSelectedDischarge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New discharge form state
  const [patientName, setPatientName] = useState('');
  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || hospitals[0]?._id || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDischarges();
  }, []);

  const loadDischarges = async () => {
    setLoading(true);
    try {
      const data = await dischargeService.getDischarges();
      setDischarges(data);
    } catch (err) {
      console.error('Failed to load discharges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (d) => {
    const text = `================================================
CARESYNC AI CLINICAL DISCHARGE RECORD
================================================
Facility: ${d.facility}
Patient: ${d.patient}
Discharge Date: ${d.date}
Diagnosis: ${d.diagnosis || 'Clinical Stabilization'}
------------------------------------------------
SUMMARY:
${d.summary}
------------------------------------------------
FOLLOW-UP PLAN:
${d.followUpPlan || 'Routine clinical assessment.'}
================================================`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discharge_${d.patient.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!patientName || !hospitalId) return;

    setSubmitting(true);
    try {
      await dischargeService.createDischarge({
        patientName,
        hospitalId,
        diagnosis,
        clinicalNotes,
        autoGenerateSummary: true,
      });

      setPatientName('');
      setDiagnosis('');
      setClinicalNotes('');
      setIsModalOpen(false);
      await loadDischarges();
    } catch (err) {
      alert(`Failed to create discharge: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Strip */}
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
            Patient Discharge Summaries & Clinical Records
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Automated LLM clinical summarization, bed capacity turnover records, and follow-up protocols
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="cs-btn cs-btn-secondary cs-btn-sm" onClick={loadDischarges}>
            <i className="fa-solid fa-rotate"></i>
            Refresh
          </button>
          <button className="cs-btn cs-btn-primary cs-btn-sm" onClick={() => setIsModalOpen(true)}>
            <i className="fa-solid fa-file-circle-plus"></i>
            New Clinical Discharge
          </button>
        </div>
      </div>

      {/* Discharges Table Card */}
      <div className="cs-card">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-500)', marginBottom: '0.75rem' }}></i>
            <div>Loading clinical discharge records...</div>
          </div>
        ) : discharges.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <i className="fa-solid fa-file-waveform" style={{ fontSize: '2.5rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}></i>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No Discharge Records Found
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Add a new clinical discharge record to free bed capacity and generate an AI summary.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Facility</th>
                  <th>Discharge Date</th>
                  <th>Primary Diagnosis</th>
                  <th>Clinical Summary</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discharges.map((d) => (
                  <tr key={d.id || d._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {d.patient}
                    </td>
                    <td>{d.facility}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {d.date}
                    </td>
                    <td>
                      <span className="cs-badge cs-badge-primary">
                        {d.diagnosis || 'Stabilized'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {d.summary ? `${d.summary.slice(0, 95)}...` : 'AI summary generated.'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="cs-btn cs-btn-outline cs-btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          onClick={() => setSelectedDischarge(d)}
                        >
                          View Details
                        </button>
                        <button
                          className="cs-btn cs-btn-secondary cs-btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                          onClick={() => handleExport(d)}
                          title="Download Text Record"
                        >
                          <i className="fa-solid fa-download"></i>
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {selectedDischarge && (
        <>
          <div className="cs-backdrop" onClick={() => setSelectedDischarge(null)} style={{ zIndex: 60 }} />
          <div className="cs-modal" style={{ maxWidth: '640px', zIndex: 61 }}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fa-solid fa-file-medical text-primary" style={{ fontSize: '1.1rem' }}></i>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Discharge Summary — {selectedDischarge.patient}
                </h3>
              </div>
              <button
                className="cs-btn cs-btn-outline cs-btn-sm"
                onClick={() => setSelectedDischarge(null)}
                style={{ width: '30px', height: '30px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facility</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedDischarge.facility}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{selectedDischarge.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnosis</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary-500)' }}>{selectedDischarge.diagnosis || 'Clinical Stabilization'}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  AI-Generated Clinical Summary
                </div>
                <div
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedDischarge.summary || 'Summary generated upon discharge submission.'}
                </div>
              </div>

              {selectedDischarge.followUpPlan && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    Follow-Up Care Plan
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {selectedDischarge.followUpPlan}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  className="cs-btn cs-btn-secondary"
                  onClick={() => handleExport(selectedDischarge)}
                >
                  <i className="fa-solid fa-download"></i>
                  Download TXT
                </button>
                <button
                  className="cs-btn cs-btn-primary"
                  onClick={() => setSelectedDischarge(null)}
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* New Discharge Form Modal */}
      {isModalOpen && (
        <>
          <div className="cs-backdrop" onClick={() => setIsModalOpen(false)} style={{ zIndex: 60 }} />
          <div className="cs-modal" style={{ maxWidth: '600px', zIndex: 61 }}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-elevated)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fa-solid fa-user-check text-primary" style={{ fontSize: '1.1rem' }}></i>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Record Patient Discharge
                </h3>
              </div>
              <button
                className="cs-btn cs-btn-outline cs-btn-sm"
                onClick={() => setIsModalOpen(false)}
                style={{ width: '30px', height: '30px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="cs-label">Patient Name</label>
                <input
                  type="text"
                  required
                  className="cs-input"
                  placeholder="e.g. Ramesh Chandra"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div>
                <label className="cs-label">Discharging Facility</label>
                <select
                  className="cs-select"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id || h._id} value={h.id || h._id}>
                      {h.name} ({h.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="cs-label">Diagnosis / Treatment Category</label>
                <input
                  type="text"
                  required
                  className="cs-input"
                  placeholder="e.g. Acute Respiratory Distress Syndrome — Resolved"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div>
                <label className="cs-label">Clinical Notes for AI Synthesis</label>
                <textarea
                  className="cs-textarea"
                  rows={4}
                  placeholder="Key recovery metrics, stabilized vitals, medications prescribed, follow-up timelines..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-surface)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  fontSize: '0.8rem',
                  color: 'var(--primary-500)',
                }}
              >
                <i className="fa-solid fa-sparkles"></i>
                <span>CareSync AI will automatically generate structured clinical discharge recommendations upon submission.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="cs-btn cs-btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cs-btn cs-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Synthesizing Summary...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i>
                      <span>Generate & Save Discharge</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
