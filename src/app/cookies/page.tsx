'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function CookiesPage() {
  const tableRowStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--border-s)',
  };
  const tdStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: 13, color: 'var(--text-sub)', textAlign: 'left',
  };
  const thStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text)', textAlign: 'left',
  };

  return (
    <>
      <Navbar portal="home" />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px' }}>

        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 8,
          }}>
            Legal
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Cookie Policy
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Last updated: June 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          <section>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              This Cookie Policy explains what cookies and similar technologies SmartQueue
              uses and why. SmartQueue uses minimal cookies — only what is necessary to
              keep the system functional and secure.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              1. What Are Cookies?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              Cookies are small text files stored on your device by your browser. They
              help websites remember information about your visit, such as your login
              session, so you don&apos;t have to log in every time you visit.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              2. Cookies We Use
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr style={tableRowStyle}>
                    <th style={thStyle}>Cookie</th>
                    <th style={thStyle}>Purpose</th>
                    <th style={thStyle}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={tableRowStyle}>
                    <td style={tdStyle}>Firebase Auth Token</td>
                    <td style={tdStyle}>Keeps you logged in to your SmartQueue account</td>
                    <td style={tdStyle}>Session / 30 days</td>
                  </tr>
                  <tr style={tableRowStyle}>
                    <td style={tdStyle}>color-theme</td>
                    <td style={tdStyle}>Remembers your light or dark mode preference</td>
                    <td style={tdStyle}>Persistent</td>
                  </tr>
                  <tr style={tableRowStyle}>
                    <td style={tdStyle}>reCAPTCHA</td>
                    <td style={tdStyle}>Google reCAPTCHA uses cookies to verify you are not a bot during login and registration</td>
                    <td style={tdStyle}>Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              3. Third-Party Cookies
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 8 }}>
              SmartQueue uses the following third-party services that may set their own
              cookies:
            </p>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li><strong>Google Firebase</strong> — for authentication and database</li>
              <li><strong>Google reCAPTCHA</strong> — for bot protection on login and registration forms</li>
            </ul>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8, marginTop: 8 }}>
              These services have their own privacy policies and cookie practices. We
              recommend reviewing Google&apos;s Privacy Policy for more information.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              4. We Do Not Use
            </h2>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>Advertising or tracking cookies</li>
              <li>Analytics cookies that track your behavior across other websites</li>
              <li>Any cookies that share your data with advertisers</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              5. Managing Cookies
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 8 }}>
              You can control or delete cookies through your browser settings. Note that
              disabling essential cookies (such as Firebase Auth) will prevent you from
              logging in to SmartQueue.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 8 }}>
              Most browsers allow you to:
            </p>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>View cookies stored on your device</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block cookies from specific websites</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              6. Contact
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              If you have questions about our use of cookies, contact the SmartQueue
              development team through the college administration.
            </p>
          </section>

        </div>

        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border-s)',
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          <Link href="/privacy" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Privacy Policy →
          </Link>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Terms of Service →
          </Link>
        </div>

      </div>
    </>
  );
}