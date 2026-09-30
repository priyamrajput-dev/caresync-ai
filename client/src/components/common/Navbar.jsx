import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export function Navbar({ activeNav, onNavChange, onOpenLogin, onOpenChat }) {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
        { id: 'facilities', label: 'Facilities', icon: 'fa-hospital' },
        { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
        { id: 'alerts', label: 'Alerts', icon: 'fa-bell' },
        { id: 'discharge', label: 'Discharge Summary', icon: 'fa-file-medical' },
        { id: 'rag', label: 'Knowledge Base', icon: 'fa-book-medical' },
    ];

    return (
        <nav className="top-navbar">
            <div className="nav-left">
                <div
                    className="logo"
                    onClick={() => onNavChange('dashboard')}
                    style={{ cursor: 'pointer' }}
                >
                    <i className="fa-solid fa-heart-pulse fa-lg text-primary"></i>
                    <span>CareSync AI</span>
                </div>
            </div>

            <div className="nav-center">
                <div className="nav-menu">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                            onClick={() => onNavChange(item.id)}
                        >
                            <i className={`fa-solid ${item.icon}`}></i>
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="nav-right">
                <div className="status-indicator">
                    <div className="status-dot"></div>
                    LIVE TELEMETRY
                </div>

                <button
                    className="theme-toggle-nav"
                    onClick={toggleTheme}
                    aria-label="Toggle visual theme"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>

                <button
                    className="btn-ghost"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    onClick={onOpenChat}
                    title="Open AI Copilot"
                >
                    <i className="fa-solid fa-wand-magic-sparkles text-primary mr-1"></i> AI Copilot
                </button>

                {user ? (
                    <div
                        className="user-profile-badge"
                        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                        <img
                            src={user.avatarUrl || 'https://picsum.photos/seed/doctor/40/40'}
                            alt={user.name}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: '2px solid var(--primary)',
                            }}
                        />
                        <div
                            className="user-info-text"
                            style={{ fontSize: '0.85rem', lineHeight: 1.2 }}
                        >
                            <div className="font-bold">{user.name}</div>
                            <div className="text-dim text-xs capitalize">{user.role}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn-ghost"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            title="Sign Out"
                        >
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                ) : (
                    <button
                        className="btn"
                        style={{ padding: '8px 18px', fontSize: '0.9rem' }}
                        onClick={onOpenLogin}
                    >
                        <i className="fa-solid fa-user-lock mr-2"></i> Sign In
                    </button>
                )}
            </div>
        </nav>
    );
}
