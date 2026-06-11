'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { getUserDoc } from '@/lib/firebase-helpers';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = await getUserDoc(cred.user.uid);
      if (user && user.role === 'student') {
        window.location.href = '/dashboard';
      } else {
        await signOut(auth);
        setError('Access denied — not a student account.');
        setLoading(false);
      }
    } catch {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setError('');
    } catch (e: any) {
      setError('Could not send reset email. Check the address and try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <>
      <Navbar portal="login-register" />

      <div className="sq-auth-wrap">
        <div className="sq-auth-card">
          <div className="sq-card sq-fade-in" style={{ padding: 40 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Login to your student account
              </p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label className="sq-label">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="sq-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
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

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <button
                onClick={handleForgotPassword}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: 'var(--text-dim)',
                  padding: 0, transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-sub)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
              >
                Forgot password?
              </button>
            </div>

            {/* Error alert */}
            {error && (
              <div className="sq-alert sq-alert-error show" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Reset email success */}
            {resetSent && (
              <div className="sq-alert sq-alert-success show" style={{ marginBottom: 16 }}>
                ✓ Reset email sent — check your inbox and spam folder.
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="sq-btn sq-btn-primary sq-btn-full sq-btn-lg"
              style={{ marginBottom: 20, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>

            {/* Divider */}
            <hr className="sq-divider" />

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-sub)' }}>
              No account?{' '}
              <Link
                href="/register"
                style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              >
                Register here
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}