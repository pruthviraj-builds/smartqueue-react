'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Last updated: June 2026</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          <section>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              By using SmartQueue, you agree to these Terms of Service. SmartQueue is an
              internal tool developed to manage student queues at college departments.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              1. Eligibility
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              SmartQueue is intended for use by currently enrolled students, authorized
              staff, and administrators only. Use by unauthorized individuals is prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              2. Account Responsibility
            </h2>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You must provide accurate information during registration</li>
              <li>You must not share your account with others</li>
              <li>You must not create multiple accounts</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              3. Acceptable Use
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: 8 }}>
              You agree not to:
            </p>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>Join a queue when you are not physically present on campus or intending to visit</li>
              <li>Join multiple queues simultaneously across different departments</li>
              <li>Abuse or attempt to manipulate the token system</li>
              <li>Use automated tools or bots to interact with SmartQueue</li>
              <li>Attempt to access other students&apos; accounts or data</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              4. Queue Rules
            </h2>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              <li>You must be present at the counter when your token is called</li>
              <li>If you cannot attend, please leave the queue using the Cancel Ticket button</li>
              <li>Repeated no-shows may result in account suspension</li>
              <li>Queue availability is subject to staff operating hours</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              5. Service Availability
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              SmartQueue is provided on a best-effort basis. We do not guarantee
              uninterrupted availability. Queue counters operate during college working
              hours only and are subject to change without notice.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              6. Termination
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              We reserve the right to suspend or terminate accounts that violate these
              terms, abuse the system, or misuse the queue in a way that affects other
              students.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              7. Changes to Terms
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              These terms may be updated from time to time. Continued use of SmartQueue
              after any changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              8. Contact
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.8 }}>
              For any queries regarding these terms, contact the SmartQueue development
              team through the college administration.
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
          <Link href="/cookies" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Cookie Policy →
          </Link>
        </div>

      </div>
    </>
  );
}