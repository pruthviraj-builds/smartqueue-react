'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import {
  Activity,
  Bell,
  Bot,
  ShieldCheck,
  BarChart3,
  MapPin,
  ExternalLink,
  Code2,
  Database,
  Server,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'Real-Time Queue Tracking',
    desc: 'Position and progress update live using Firestore listeners, with no page refresh.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Browser alerts when you are 5th, 3rd and next in line, so you can wait anywhere.',
  },
  {
    icon: Bot,
    title: 'AI Queue Assistant',
    desc: 'A chatbot answers questions about joining, leaving and using the system.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    desc: 'Separate student, staff and admin portals, enforced by Firestore security rules.',
  },
  {
    icon: BarChart3,
    title: 'Admin Analytics',
    desc: 'Tokens issued, students served, average service time and a full activity log.',
  },
  {
    icon: MapPin,
    title: 'Campus Geofencing',
    desc: 'Optional location check, controlled by the admin, so only on-campus students join.',
  },
];

const STEPS = [
  { n: '01', title: 'Register and log in', desc: 'Create a student account and sign in securely.' },
  { n: '02', title: 'Join a department queue', desc: 'Pick Fees, Admissions or Scholarship and get a token instantly.' },
  { n: '03', title: 'Track your position', desc: 'Watch your place in line update live from your phone.' },
  { n: '04', title: 'Walk in when called', desc: 'Get notified and head to the counter only when it is your turn.' },
];

const STACK = [
  { icon: Code2, label: 'Frontend', value: 'React, Next.js (App Router), TypeScript, Tailwind CSS' },
  { icon: Database, label: 'Database and Auth', value: 'Firebase Firestore and Firebase Authentication' },
  { icon: Server, label: 'Server Logic', value: 'Next.js API route for the AI chatbot (Groq API)' },
  { icon: ShieldCheck, label: 'Security', value: 'Firestore rules, Google reCAPTCHA v2 and v3' },
];

const TEAM = [
  {
    name: 'Pruthviraj Nikam',
    role: 'Developer — Frontend and Backend',
    desc: 'Designed and built the application, database structure, security rules and deployment.',
  },
  {
    name: 'Mohd Husham',
    role: 'Backend and Data Engineer',
    desc: 'Contributed to backend planning and data design.',
  },
];

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--accent)',
  marginBottom: 10,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: 28,
  lineHeight: 1.2,
};

const iconBox: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: 'var(--bg)',
  border: '1px solid var(--border-s)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--accent)',
  flexShrink: 0,
};

export default function AboutPage() {
  return (
    <>
      <Navbar portal="home" />

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '80px 24px 80px' }}>

        {/* Intro */}
        <section className="sq-fade-in" style={{ marginBottom: 72 }}>
          <p style={sectionLabel}>About</p>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700,
            color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20,
          }}>
            Queues without the crowd.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.8, maxWidth: 640 }}>
            SmartQueue is a virtual queue management system for college service counters.
            Students used to stand in long physical lines with no idea how long they would
            wait. SmartQueue replaces that with digital tokens, live position tracking and
            notifications, so students only go to the counter when it is their turn.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 16 }}>
            Built as a final-year BCA project.
          </p>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: 72 }}>
          <p style={sectionLabel}>How it works</p>
          <h2 style={sectionTitle}>From lobby to counter in four steps</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {STEPS.map((s) => (
              <div key={s.n} className="sq-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{s.title}</div>
                <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: 72 }}>
          <p style={sectionLabel}>Features</p>
          <h2 style={sectionTitle}>What the system does</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="sq-card" style={{ padding: 22 }}>
                  <div style={{ ...iconBox, marginBottom: 14 }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{f.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tech stack */}
        <section style={{ marginBottom: 72 }}>
          <p style={sectionLabel}>Technology</p>
          <h2 style={sectionTitle}>Built with</h2>
          <div className="sq-card" style={{ padding: 8 }}>
            {STACK.map((t, i) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px',
                    borderBottom: i < STACK.length - 1 ? '1px solid var(--border-s)' : 'none',
                  }}
                >
                  <div style={iconBox}><Icon size={20} /></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2 }}>{t.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: 72 }}>
          <p style={sectionLabel}>Team</p>
          <h2 style={sectionTitle}>The people behind it</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {TEAM.map((m) => (
              <div key={m.name} className="sq-card" style={{ padding: 22 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, marginBottom: 14,
                }}>
                  {m.name.charAt(0)}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{m.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginTop: 2, marginBottom: 10 }}>{m.role}</div>
                <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Source */}
        <section className="sq-card" style={{
          padding: 28, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>View the source code</div>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: 0 }}>
              The full project, with commit history, is on GitHub.
            </p>
          </div>
          <a
            href="https://github.com/pruthviraj-builds/smartqueue-react"
            target="_blank"
            rel="noreferrer"
            className="sq-btn sq-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ExternalLink size={16} />
            GitHub Repository
          </a>
        </section>

        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border-s)',
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          <Link href="/privacy" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Terms of Service
          </Link>
          <Link href="/cookies" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Cookie Policy
          </Link>
        </div>

      </div>
    </>
  );
}