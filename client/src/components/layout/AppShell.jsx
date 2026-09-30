import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { TopHeader } from './TopHeader.jsx';

export function AppShell({
  activeNav,
  onNavChange,
  alertCount,
  onOpenChat,
  onOpenLogin,
  children,
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K opens AI Copilot
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChat]);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={onNavChange}
        alertCount={alertCount}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main">
        <TopHeader
          activeNav={activeNav}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenChat={onOpenChat}
          onOpenLogin={onOpenLogin}
        />

        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
}
