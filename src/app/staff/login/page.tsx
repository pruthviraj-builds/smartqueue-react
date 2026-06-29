'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getUserDoc } from '@/lib/firebase-helpers';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = await getUserDoc(cred.user.uid);
      if (user && user.role === 'staff') {
        window.location.href = '/staff/dashboard';
      } else {
        setError('Access denied — not a staff account.');
        await signOut(auth);
        setLoading(false);
      }
    } catch {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <>
      <Navbar portal="staff-login" />

      <div className="sq-auth-wrap">
        <div className="sq-auth-card">
          <div className="sq-card sq-fade-in" style={{ padding: 40 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--bg)', border: '1px solid var(--border-s)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 20,
              }}>
                ⚙️
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Staff Login
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Access the queue management dashboard
              </p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label className="sq-label">Staff Email</label>
              <input
                type="email"
                placeholder="staff@raisoni.com"
                className="sq-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label className="sq-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="sq-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="sq-alert sq-alert-error show" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="sq-btn sq-btn-primary sq-btn-full sq-btn-lg"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Logging in…' : 'Login as Staff'}
            </button>

            {/* Info note */}
            <div style={{
              marginTop: 24, padding: '14px 16px',
              background: 'var(--bg)', border: '1px solid var(--border-s)',
              borderRadius: 12, fontSize: 12, color: 'var(--text-dim)',
              lineHeight: 1.5,
            }}>
              🔒 Staff accounts are created by the admin. Contact your system administrator if you don&apos;t have access.
            </div>

          </div>
        </div>
      </div>
    </>
  );
}