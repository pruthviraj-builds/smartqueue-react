'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { getUserDoc } from '@/lib/firebase-helpers';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function StudentLoginPage() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    // reCAPTCHA check
    if (!executeRecaptcha) {
      setError('reCAPTCHA not ready. Please try again.');
      return;
    }
    const captchaToken = await executeRecaptcha('login');
    if (!captchaToken) {
      setError('CAPTCHA verification failed. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = await getUserDoc(cred.user.uid);
      if (user && user.role === 'student') {
        router.push('/dashboard');
      } else {
        await signOut(auth);
        setError('Access denied — not a student account.');
        setLoading(false);
      }
    } catch {
      setError('Invalid email or password.');
      setLoading(false);
    }
  }, [email, password, executeRecaptcha, router]);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then click Forgot password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setError('');
    } catch {
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

            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Login to your student account
              </p>
            </div>

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

            {error && (
              <div className="sq-alert sq-alert-error show" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            {resetSent && (
              <div className="sq-alert sq-alert-success show" style={{ marginBottom: 16 }}>
                ✓ Reset email sent — check your inbox and spam folder.
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="sq-btn sq-btn-primary sq-btn-full sq-btn-lg"
              style={{ marginBottom: 16, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>

            {/* reCAPTCHA notice */}
            <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginBottom: 16 }}>
              Protected by reCAPTCHA —{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)' }}>Privacy</a>
              {' & '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--text-dim)' }}>Terms</a>
            </p>

            <hr className="sq-divider" />

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