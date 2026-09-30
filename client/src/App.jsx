import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import { AppShell } from './components/layout/AppShell.jsx';
import { AiCopilotDrawer } from './components/chat/AiCopilotDrawer.jsx';
import { ProcurementModal } from './components/procurement/ProcurementModal.jsx';
import { LoginModal } from './components/common/LoginModal.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { FacilitiesPage } from './pages/FacilitiesPage.jsx';
import { InventoryPage } from './pages/InventoryPage.jsx';
import { AlertsPage } from './pages/AlertsPage.jsx';
import { ProcurementOrdersPage } from './pages/ProcurementOrdersPage.jsx';
import { DischargeSummaryPage } from './pages/DischargeSummaryPage.jsx';
import { RagKnowledgePage } from './pages/RagKnowledgePage.jsx';

import { hospitalService } from './services/api/hospitalService.js';

function MainApp() {
  const [view, setView] = useState('landing');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals & Drawers
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [procureHospital, setProcureHospital] = useState(null);
  const [focusedHospital, setFocusedHospital] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hospitalService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError(err.message || 'Failed to connect to CareSync backend');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterDashboard = () => {
    setView('dashboard');
    if (!summary) {
      loadDashboardData();
    }
  };

  const hospitals = summary?.hospitals || [];
  const alertCount =
    summary?.alerts?.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length ||
    summary?.totals?.critical_alerts ||
    0;

  if (view === 'landing') {
    return (
      <LandingPage
        onEnter={handleEnterDashboard}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    );
  }

  return (
    <>
      <AppShell
        activeNav={activeNav}
        onNavChange={setActiveNav}
        alertCount={alertCount}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      >
        {error && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-surface)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>
                <strong>Backend Communication Alert:</strong> {error}
              </span>
            </div>
            <button
              className="cs-btn cs-btn-outline cs-btn-sm"
              onClick={loadDashboardData}
            >
              Retry
            </button>
          </div>
        )}

        {loading && !summary ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i
              className="fa-solid fa-circle-notch fa-spin"
              style={{ fontSize: '2.5rem', color: 'var(--primary-500)', marginBottom: '1rem' }}
            ></i>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Syncing National Healthcare Telemetry...
            </div>
          </div>
        ) : (
          <>
            {activeNav === 'dashboard' && (
              <DashboardPage
                summary={summary}
                onHospitalSelect={(h) => {
                  setFocusedHospital(h);
                  setIsChatOpen(true);
                }}
                onProcure={setProcureHospital}
                onOpenChat={() => setIsChatOpen(true)}
                onRefresh={loadDashboardData}
              />
            )}

            {activeNav === 'facilities' && (
              <FacilitiesPage
                hospitals={hospitals}
                onSelectHospital={(h) => {
                  setFocusedHospital(h);
                  setIsChatOpen(true);
                }}
                onProcure={setProcureHospital}
              />
            )}

            {activeNav === 'inventory' && (
              <InventoryPage
                hospitals={hospitals}
                onProcure={setProcureHospital}
              />
            )}

            {activeNav === 'alerts' && (
              <AlertsPage
                hospitals={hospitals}
                onProcure={setProcureHospital}
              />
            )}

            {activeNav === 'procurement' && (
              <ProcurementOrdersPage
                hospitals={hospitals}
                onOpenProcureModal={setProcureHospital}
              />
            )}

            {activeNav === 'discharge' && (
              <DischargeSummaryPage hospitals={hospitals} />
            )}

            {activeNav === 'rag' && <RagKnowledgePage />}
          </>
        )}
      </AppShell>

      {/* AI ReAct Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedHospital={focusedHospital}
        onOpenProcure={setProcureHospital}
      />

      {/* Emergency Procurement Order Modal */}
      {procureHospital && (
        <ProcurementModal
          isOpen={Boolean(procureHospital)}
          hospital={procureHospital}
          onClose={() => setProcureHospital(null)}
          onOrderCreated={() => {
            loadDashboardData();
          }}
        />
      )}

      {/* Staff Login / Auth Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
