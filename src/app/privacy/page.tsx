'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Last updated: June 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          <section>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              SmartQueue is a virtual queue management system built for college departments.
              This Privacy Policy explains how we collect, use, and protect your personal
              information when you use SmartQueue.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              1. Information We Collect
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 8 }}>
              When you register and use SmartQueue, we collect the following information:
            </p>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li><strong>Full Name</strong> — used to identify you in the queue and display to staff</li>
              <li><strong>Email Address</strong> — used for account creation, login, and password reset</li>
              <li><strong>Queue Activity</strong> — which department queue you joined, your token number, and timestamps</li>
              <li><strong>Location Data</strong> — if geofencing is enabled, we verify that you are within the college campus before allowing you to join a queue. Location is not stored permanently.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              2. How We Use Your Information
            </h2>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>To create and manage your student account</li>
              <li>To assign and track your position in the virtual queue</li>
              <li>To send browser notifications about your queue status</li>
              <li>To allow staff to identify and serve you at the counter</li>
              <li>To generate anonymized analytics for system improvement</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              3. Data Storage
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              Your data is stored securely on Google Firebase (Firestore), a cloud database
              service provided by Google LLC. Firebase complies with industry-standard
              security practices including encryption at rest and in transit.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              4. Data Sharing
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              We do not sell, rent, or share your personal information with any third
              parties. Your name and queue status are visible to authorized college staff
              only for the purpose of serving you at the counter.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              5. Data Retention
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              Queue tokens are reset daily by staff. Your account information (name and
              email) is retained as long as your account exists. You may request deletion
              of your account by contacting us.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              6. Your Rights
            </h2>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              7. Browser Notifications
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              SmartQueue may request permission to send browser notifications to alert you
              when your turn is approaching. You can revoke this permission at any time
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              8. Contact
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              If you have any questions about this Privacy Policy or your data, please
              contact the SmartQueue development team through the college administration.
            </p>
          </section>

        </div>

        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border-s)',
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Terms of Service →
          </Link>
          <Link href="/cookies" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Cookie Policy →
          </Link>
        </div>

      </div>
    </>
  );
}