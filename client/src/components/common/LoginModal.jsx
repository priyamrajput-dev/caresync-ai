import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export function LoginModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('sarah.chen@caresync.gov.in');
  const [password, setPassword] = useState('CareSync@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('sarah.chen@caresync.gov.in');
    setPassword('CareSync@2026');
    setIsRegister(false);
  };

  return (
    <div className="cs-backdrop" onClick={onClose}>
      <div className="cs-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {isRegister ? 'Register Healthcare Operator' : 'Operator Secure Access'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              CareSync AI National Infrastructure Portal
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

        {/* Demo credentials shortcut badge */}
        {!isRegister && (
          <div
            onClick={fillDefaultCredentials}
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-surface)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              marginBottom: '1.25rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong>Quick Fill:</strong> sarah.chen@caresync.gov.in
            </div>
            <span style={{ fontWeight: 700 }}>Auto-fill ↵</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-surface)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.825rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div className="cs-input-group">
              <label className="cs-label">Full Name & Title</label>
              <input
                type="text"
                className="cs-input"
                placeholder="Dr. Sarah Chen, MD"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="cs-input-group">
            <label className="cs-label">Operational Email</label>
            <input
              type="email"
              className="cs-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="cs-input-group">
            <label className="cs-label">Password</label>
            <input
              type="password"
              className="cs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="cs-btn cs-btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Operator Profile' : 'Authenticate Session'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already have credentials?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                style={{ color: 'var(--primary-500)', fontWeight: 600 }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need authorized operator access?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                style={{ color: 'var(--primary-500)', fontWeight: 600 }}
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
