'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { registerUserDoc } from '@/lib/firebase-helpers';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await registerUserDoc(cred.user.uid, name.trim(), email.trim(), 'student');
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 1800);
    } catch (e: any) {
      const msgs: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
      };
      setError(msgs[e.code] ?? 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRegister();
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
                Create account
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Join SmartQueue as a student
              </p>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: 18 }}>
              <label className="sq-label">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                className="sq-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="name"
                disabled={success}
              />
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
                disabled={success}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label className="sq-label">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                className="sq-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                disabled={success}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="sq-alert sq-alert-error show" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="sq-alert sq-alert-success show" style={{ marginBottom: 16 }}>
                ✓ Account created! Redirecting to login…
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleRegister}
              disabled={loading || success}
              className="sq-btn sq-btn-primary sq-btn-full sq-btn-lg"
              style={{ marginBottom: 20, opacity: loading || success ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : success ? 'Done!' : 'Create Account'}
            </button>

            <hr className="sq-divider" />

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-sub)' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
              >
                Login here
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
