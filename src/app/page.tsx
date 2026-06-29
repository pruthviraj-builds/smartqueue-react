'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

/* ─── Types ─── */
interface QueueData {
  id: string;
  isActive?: boolean;
  tokens?: unknown[];
  waitingCount?: number;
}

/* ─── Utility: FadeIn on scroll ─── */
function FadeInSection({ children }: { children: React.ReactNode; delay?: number }) {
  return <>{children}</>;
}

/* ─── Utility: Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 14px',
      borderRadius: 999,
      background: 'rgba(0,113,227,0.08)',
      border: '1px solid rgba(0,113,227,0.15)',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--accent)',
      marginBottom: 16,
    }}>
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════ */
export default function HomePage() {
  const [activeQueues, setActiveQueues] = useState(0);
  const [totalWaiting, setTotalWaiting] = useState(0);

  /* Live Firestore listener */
 useEffect(() => {
  const unsub = onSnapshot(collection(db, 'queues'), (snap) => {
    let active = 0;
    let waiting = 0;
    snap.docs.forEach((d) => {
      if (d.data().isActive !== false) active++;
      const tokens = d.data().waitingCount ?? 0;
      waiting += tokens;
    });
    setActiveQueues(active);
    setTotalWaiting(waiting);
  });
  return () => unsub();
}, []);

  return (
    <>
      {/* ── Fixed Background Blobs ── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="sq-gradient-bg" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', overflowX: 'hidden' }}>
        <Navbar portal="home" />

        {/* ══════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════ */}
        <section className="hero-section">
          <div className="hero-orb" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />

          <div className="sq-fade-in" style={{ position: 'relative', zIndex: 1, animationDelay: '0.05s' }}>
            {/* Eyebrow */}
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-dim)',
              marginBottom: 20,
            }}>
              GH Raisoni College of Engineering &amp; Management
            </p>

            {/* H1 */}
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 68px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 24,
            }}>
              No more waiting.<br />
              <span style={{ color: 'var(--accent)' }}>Queue smarter.</span>
            </h1>

            {/* Subheading */}
            <p style={{
              fontSize: 18,
              color: 'var(--text-sub)',
              lineHeight: 1.6,
              maxWidth: 500,
              margin: '0 auto 40px',
            }}>
              SmartQueue replaces physical lines with a virtual token system. Join from your phone, track your position live, and get notified when it&apos;s your turn.
            </p>

            {/* CTA buttons removed */}

            {/* Live status pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 16,
              padding: '10px 22px',
              borderRadius: 999,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-s)',
              fontSize: 12,
              color: 'var(--text-sub)',
              fontWeight: 500,
            }}>
              <span className="sq-live-dot" />
              <span>Live</span>
              <span style={{ width: 1, height: 12, background: 'var(--border)', display: 'inline-block' }} />
              <span>{activeQueues} queues open</span>
              <span style={{ width: 1, height: 12, background: 'var(--border)', display: 'inline-block' }} />
              <span>{totalWaiting} students waiting</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 2 — STATS BAR
        ══════════════════════════════════════ */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>
          <FadeInSection delay={0.1}>
            <div className="stats-grid">
              {[
                { num: '500+',      label: 'Students Served', sub: 'Since launch' },
                { num: '3+',        label: 'Departments',     sub: 'Fees, Admissions, Scholarship' },
                { num: 'Real-time', label: 'Queue Updates',   sub: 'Zero refresh needed' },
                { num: 'Free',      label: 'Forever',         sub: 'No hidden charges' },
              ].map((s) => (
                <div key={s.label} className="stat-cell">
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sub)' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>

        {/* ══════════════════════════════════════
            SECTION 3 — FEATURES
        ══════════════════════════════════════ */}
        <section id="features" style={{ padding: '0 0 80px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
            <FadeInSection>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Eyebrow>Why SmartQueue</Eyebrow>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                  Everything you need, nothing you don&apos;t.
                </h2>
              </div>
            </FadeInSection>

            <div className="features-grid">
              {[
                {
                  icon: '🔴',
                  title: 'Real-Time Queue Tracking',
                  desc: "Watch your position update live without refreshing. Powered by Firestore's real-time database.",
                  ai: false,
                },
                {
                  icon: '🔔',
                  title: 'Smart Browser Notifications',
                  desc: "Get alerted automatically when you're 3rd in line and again when you're next. Never miss your turn.",
                  ai: false,
                },
                {
                  icon: '🤖',
                  title: 'AI Queue Assistance',
                  desc: 'An intelligent chatbot answers your questions about wait times, departments, and queue status instantly.',
                  ai: true,
                },
                {
                  icon: '🏫',
                  title: 'Built for Campus Services',
                  desc: 'Designed specifically for Fees, Admissions, and Scholarship counters at GH Raisoni College.',
                  ai: false,
                },
              ].map((card, i) => (
                <div
                  key={card.title}
                  className="feature-card sq-card"
                  id={`feature-card-${i}`}
                  style={card.ai ? {
                    borderColor: 'rgba(0,113,227,0.3)',
                    background: 'rgba(0,113,227,0.02)',
                    position: 'relative',
                  } : { position: 'relative' }}
                >
                  {card.ai && (
                    <span className="sq-badge sq-badge-called" style={{
                      position: 'absolute', top: 16, right: 16,
                      fontSize: 10, padding: '3px 10px',
                    }}>
                      New
                    </span>
                  )}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'var(--bg)', border: '1px solid var(--border-s)',
                    fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                    {card.title}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 4 — HOW IT WORKS (Vertical Stepper + Lottie)
        ══════════════════════════════════════ */}
        <section id="how-it-works" className="how-it-works-section">
          <div style={{ flex: 1 }}>
            <FadeInSection>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-dim)',
                marginBottom: 16,
              }}>
                HOW IT WORKS
              </p>
              <h2 style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 48,
                lineHeight: 1.2,
              }}>
                From lobby to done, in minutes.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      01
                    </div>
                    <div style={{
                      width: 2,
                      height: 48,
                      background: 'var(--border)',
                      margin: '8px auto 8px',
                    }} />
                  </div>
                  <div style={{ paddingBottom: 48, paddingTop: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                      Register &amp; Join
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
                      Create your free student account and pick your department queue in seconds.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      02
                    </div>
                    <div style={{
                      width: 2,
                      height: 48,
                      background: 'var(--border)',
                      margin: '8px auto 8px',
                    }} />
                  </div>
                  <div style={{ paddingBottom: 48, paddingTop: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                      Get Your Token
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
                      Receive a virtual token instantly. Your position is saved — no need to stay in line.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      03
                    </div>
                  </div>
                  <div style={{ paddingBottom: 0, paddingTop: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                      Walk in When Called
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>
                      Track your position live and get a browser notification when it&apos;s your turn.
                    </p>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: 340,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            }}>
              {/* Header bar */}
              <div style={{
                padding: '14px 20px',
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    SmartQueue · Live
                  </span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Admissions</span>
              </div>

              {/* Token number */}
              <div style={{ padding: '32px 24px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 12 }}>
                  Your Token Number
                </div>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 0 0 rgba(0,113,227,0.4)',
                  animation: 'tokenPulse 2s infinite',
                }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>7</span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 999,
                  background: 'rgba(48,209,88,0.1)',
                  border: '1px solid rgba(48,209,88,0.2)',
                  color: '#30d158', fontSize: 12, fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30d158', animation: 'livePulse 2s infinite', display: 'inline-block' }} />
                  You're next!
                </span>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1, background: 'var(--border-s)',
                borderTop: '1px solid var(--border-s)',
              }}>
                {[
                  { label: 'Now Serving', value: '6' },
                  { label: 'Your Position', value: '1' },
                  { label: 'Est. Wait', value: '2m' },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: 'var(--bg-card)',
                    padding: '16px 8px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 5 — STUDENT JOURNEY (visual)
        ══════════════════════════════════════ */}
        <section style={{ padding: '80px 0' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
            <FadeInSection>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <Eyebrow>The Engine</Eyebrow>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                  The Complete Student Journey
                </h2>
                <p style={{ fontSize: 15, color: 'var(--text-sub)', marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>
                  From lobby to counter — every step tracked, every moment yours.
                </p>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              {/* Browser frame */}
              <div className="journey-frame">
                <div className="journey-chrome">
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
                    <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      SmartQueue · Student Portal
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-sub)', fontWeight: 500 }}>
                    <span className="sq-live-dot" />
                    Rahul A. (Student)
                  </div>
                </div>

                <div className="journey-board">
                  {/* Stage 01 */}
                  <div className="journey-stage">
                    <div className="journey-stage-label">01 · Join Queue</div>
                    <div className="journey-card">
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 12 }}>SELECT DEPARTMENT</div>
                      <div style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Fees Counter</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                      </div>
                      <button className="sq-btn sq-btn-primary" style={{ width: '100%', fontSize: 12, padding: '10px 0' }}>
                        Join Virtual Queue
                      </button>
                    </div>
                  </div>
                  <div className="journey-connector" aria-hidden="true">→</div>

                  {/* Stage 02 */}
                  <div className="journey-stage">
                    <div className="journey-stage-label">02 · Receive Token</div>
                    <div className="journey-card">
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 4 }}>YOUR TICKET</div>
                        <div style={{ fontSize: 44, fontWeight: 850, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>#18</div>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 6 }}>Fees Counter · Est. 12 mins</div>
                      </div>
                      <div style={{ borderTop: '1px dashed var(--border)', margin: '12px 0' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-s)' }}>
                          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>ISSUED</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>9:41 AM</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '8px 6px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border-s)' }}>
                          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>AHEAD</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>3 People</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="journey-connector" aria-hidden="true">→</div>

                  {/* Stage 03 */}
                  <div className="journey-stage">
                    <div className="journey-stage-label">03 · Track Position</div>
                    <div className="journey-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 10 }}>
                        <span>LIVE QUEUE PROGRESS</span>
                        <span style={{ color: '#34c759', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="sq-live-dot" />LIVE
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ width: '83%', height: '100%', background: 'linear-gradient(90deg, var(--accent), #5ac8ff)', borderRadius: 4 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)', marginBottom: 14 }}>
                        <span>Currently: <strong style={{ color: 'var(--text)' }}>#15</strong></span>
                        <span>Your turn: <strong style={{ color: 'var(--accent)' }}>#18</strong></span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ padding: '10px 8px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-s)', textAlign: 'center' }}>
                          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>AHEAD</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>3</div>
                        </div>
                        <div style={{ padding: '10px 8px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-s)', textAlign: 'center' }}>
                          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600 }}>WAIT</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>~12m</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="journey-connector" aria-hidden="true">→</div>

                  {/* Stage 04 */}
                  <div className="journey-stage">
                    <div className="journey-stage-label">04 · Get Called</div>
                    <div className="journey-card" style={{ position: 'relative' }}>
                      <div className="notif-float">
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>SmartQueue Alert</div>
                            <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>
                              <strong style={{ color: 'var(--accent)' }}>You&apos;re next!</strong> Token #18 — head to Fees Counter now.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 8 }}>ALERT MILESTONES</div>
                        {[
                          { pos: '5 ahead', done: true, active: false },
                          { pos: '3 ahead', done: true, active: false },
                          { pos: "You're next!", done: false, active: true },
                        ].map((m, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < 2 ? '1px solid var(--border-s)' : 'none' }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: m.done ? '#34c759' : m.active ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {m.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                              {m.active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', display: 'block' }} />}
                            </div>
                            <span style={{ fontSize: 12, color: m.active ? 'var(--accent)' : 'var(--text-sub)', fontWeight: m.active ? 600 : 400 }}>{m.pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ══════════════════════════════════════
            SECTION 7 — TESTIMONIALS
        ══════════════════════════════════════ */}
        <section style={{
          background: 'var(--bg-card)',
          paddingTop: '80px',
          paddingBottom: '80px',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          paddingLeft: 'calc(50vw - 50%)',
          paddingRight: 'calc(50vw - 50%)'
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
            <FadeInSection>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Eyebrow>Student Feedback</Eyebrow>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                  What students are saying.
                </h2>
              </div>
            </FadeInSection>

            <div className="testimonials-grid">
              {[
                {
                  stars: 5,
                  quote: 'No more standing in long lines. I joined the queue from my hostel and arrived just in time.',
                  name: 'Sameer Ekhande',
                  dept: 'B.Tech, CSE — 3rd Year',
                },
                {
                  stars: 5,
                  quote: 'The notification system is brilliant. Got a ping on my phone when I was 3rd in line.',
                  name: 'Mohit Bhavsar',
                  dept: 'BCA — Final Year',
                },
                {
                  stars: 4,
                  quote: 'Really clean interface. The AI chatbot answered my question about scholarship documents instantly.',
                  name: 'Ritesh Patil',
                  dept: 'MCA — 2nd Year',
                },
              ].map((t, i) => (
                <FadeInSection key={t.name} delay={i * 0.1}>
                  <div className="sq-card" style={{ height: '100%' }}>
                    <div style={{ fontSize: 14, color: '#ff9f0a', marginBottom: 12, letterSpacing: 2 }}>
                      {'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <hr className="sq-divider" />
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{t.dept}</div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* ─────────────────────────────── */}
      {/* PAGE-SCOPED CSS                 */}
      {/* ─────────────────────────────── */}
      <style>{`
        .how-it-works-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px 100px;
          display: flex;
          align-items: center;
          gap: 80px;
        }

        /* Background blobs */
        .sq-gradient-bg {
          position: absolute; inset: 0;
          background: var(--bg);
        }
        .sq-gradient-bg::before {
          content: ''; position: absolute;
          width: 600px; height: 600px;
          top: -150px; left: -150px;
          border-radius: 50%; filter: blur(90px);
          background: radial-gradient(circle, rgba(0,113,227,0.07) 0%, transparent 70%);
          animation: float1 28s ease-in-out infinite;
        }
        .sq-gradient-bg::after {
          content: ''; position: absolute;
          width: 500px; height: 500px;
          bottom: -100px; right: -100px;
          border-radius: 50%; filter: blur(80px);
          background: radial-gradient(circle, rgba(0,113,227,0.04) 0%, transparent 70%);
          animation: float2 35s ease-in-out infinite;
        }
        .dark .sq-gradient-bg::before {
          background: radial-gradient(circle, rgba(41,151,255,0.05) 0%, transparent 70%);
        }
        .dark .sq-gradient-bg::after {
          background: radial-gradient(circle, rgba(41,151,255,0.03) 0%, transparent 70%);
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(70px,50px) scale(1.06); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-60px,-40px) scale(1.06); }
        }

        /* Hero */
        .hero-section {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
          padding: 100px 20px 80px;
          text-align: center;
          overflow: hidden;
        }
        .hero-orb {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -60%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse at center, rgba(0,113,227,0.09) 0%, transparent 65%);
          pointer-events: none;
          filter: blur(20px);
        }
        .dark .hero-orb {
          background: radial-gradient(ellipse at center, rgba(41,151,255,0.07) 0%, transparent 65%);
        }
        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 0%, black 30%, transparent 100%);
          pointer-events: none;
        }
        .dark .hero-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--border-s);
          border: 1px solid var(--border-s);
          border-radius: 20px;
          overflow: hidden;
        }
        .stat-cell {
          background: var(--bg-card);
          padding: 28px 20px;
          text-align: center;
        }

        /* Features grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        /* Feature card hover */
        .feature-card {
          opacity: 1;
          transition:
            transform 0.3s cubic-bezier(0.16,1,0.3,1),
            border-color 0.3s,
            box-shadow 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 12px 40px rgba(0,113,227,0.1);
        }
        .dark .feature-card:hover {
          box-shadow: 0 12px 40px rgba(41,151,255,0.08);
        }

        /* CSS replaced for vertical stepper */

        /* Journey frame */
        .journey-frame {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
        }
        .dark .journey-frame {
          box-shadow: 0 4px 40px rgba(0,0,0,0.4);
        }
        .journey-chrome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }
        .journey-board {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          align-items: stretch;
          padding: 32px 24px;
          gap: 0;
        }
        .journey-stage { display: flex; flex-direction: column; gap: 12px; }
        .journey-stage-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(0,113,227,0.15);
        }
        .journey-card {
          flex: 1;
          background: var(--bg);
          border: 1px solid var(--border-s);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .journey-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          padding-top: 40px;
          font-size: 18px;
          color: var(--text-dim);
          opacity: 0.4;
          flex-shrink: 0;
        }

        /* Floating notification */
        .notif-float {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          animation: floatNotif 3s ease-in-out infinite;
        }
        @keyframes floatNotif {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Testimonials */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .hero-section { padding: 80px 20px 60px; }

          .stats-grid { grid-template-columns: repeat(2, 1fr); }

          .features-grid { grid-template-columns: 1fr; }

          .how-it-works-section {
            flex-direction: column;
            gap: 48px;
          }

          .journey-board {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 20px 16px;
          }
          .journey-connector { display: none; }

          .testimonials-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .sq-gradient-bg::before { width: 260px; height: 260px; }
          .sq-gradient-bg::after  { width: 220px; height: 220px; }
          .hero-grid { display: none; }
          .stats-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .how-it-works-section {
            flex-direction: column !important;
            gap: 40px !important;
          }

          .how-it-works-section > * {
            width: 100% !important;
            max-width: 100% !important;
          }
        }

        @keyframes tokenPulse {
          0%   { box-shadow: 0 0 0 0   rgba(0,113,227,0.4); }
          70%  { box-shadow: 0 0 0 16px rgba(0,113,227,0);   }
          100% { box-shadow: 0 0 0 0   rgba(0,113,227,0);   }
        }
      `}</style>
    </>
  );
}
