'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { collection, onSnapshot } from 'firebase/firestore';

interface QueueData {
  id: string;
  deptName: string;
  isActive: boolean;
  currentCounter: number;
  lastToken: number;
  waitingCount: number;
}

// Fade in viewport component
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
        filter: isVisible ? 'blur(0)' : 'blur(4px)',
        transition: `opacity 0.6s var(--ease-out-expo) ${delay}s, transform 0.6s var(--ease-out-expo) ${delay}s, filter 0.6s var(--ease-out-expo) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Viewport-triggered numerical count-up
function CountUp({ end, duration = 1.0, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const domRef = useRef<HTMLSpanElement>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          let start = 0;
          const endVal = end;
          if (start === endVal) return;

          const totalMs = duration * 1000;
          const steps = 30;
          const increment = Math.max(1, Math.ceil(endVal / steps));
          const stepTime = totalMs / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= endVal) {
              clearInterval(timer);
              setCount(endVal);
            } else {
              setCount(start);
            }
          }, stepTime);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={domRef} style={{ fontVariantNumeric: 'tabular-nums' }}>{count}{suffix}</span>;
}

export default function HomePage() {
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>('student');

  // Live queues statistics for basic tracking
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'publicQueueStats'), (snap) => {
      const results = snap.docs.map((doc) => {
        const q = doc.data();
        return {
          id: doc.id,
          deptName: (q.deptName as string) ?? doc.id,
          isActive: q.isActive !== false,
          currentCounter: (q.currentCounter as number) ?? 0,
          lastToken: (q.lastToken as number) ?? 0,
          waitingCount: (q.waitingCount as number) ?? 0,
        };
      });
      setQueues(results);
    });
    return () => unsub();
  }, []);

  const totalWaiting = queues.reduce((acc, q) => acc + q.waitingCount, 0);

  return (
    <>
      {/* Background Orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="sq-gradient-bg" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navbar portal="home" />

        {/* 1. HERO SECTION */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 20px 90px', textAlign: 'center' }}>
          <div className="sq-fade-in">
            <span style={{
              display: 'inline-flex',
              padding: '8px 20px',
              borderRadius: 999,
              background: 'var(--border)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-sub)',
              marginBottom: 28,
            }}>
              GH Raisoni College, Jalgaon
            </span>

            <h1 style={{
              fontSize: 'clamp(52px, 8vw, 84px)',
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 28,
            }}>
              Skip the lobby.
              <br />
              <span style={{ color: 'var(--accent)' }}>Own your time.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(18px, 2.8vw, 22px)',
              color: 'var(--text-sub)',
              lineHeight: 1.7,
              maxWidth: 760,
              margin: '0 auto 40px',
              fontWeight: 450,
            }}>
              SmartQueue is a virtual queue manager for student services. Register, track your position in real-time, and head over to the counter only when called.
            </p>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              <Link href="/register" className="sq-btn sq-btn-primary sq-btn-lg">
                Register
              </Link>
              <Link href="/login" className="sq-btn sq-btn-ghost sq-btn-lg" style={{ display: 'inline-flex', gap: 8 }}>
                Student Dashboard <span>→</span>
              </Link>
            </div>

            {/* Quick Live Stats Indicator */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: '10px 22px',
              borderRadius: 999,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-s)',
              fontSize: 13,
              color: 'var(--text-sub)',
              fontWeight: 500,
              boxShadow: 'var(--shadow-card)',
            }}>
              <span className="sq-live-dot" />
              <span>{queues.length} departments active</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span><strong>{totalWaiting}</strong> students in virtual queue</span>
            </div>
          </div>
        </section>

        {/* 2. PROBLEM SECTION */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 90px' }}>
          <FadeInSection>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
              <div className="sq-card" style={{ borderLeft: '4px solid #ff3b30', padding: 40 }}>
                <span style={{ fontSize: 32 }}>🚶‍♂️</span>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 10px', color: 'var(--text)' }}>
                  The Traditional Queue Problem
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                  College counters are crowded. Students waste hours standing in corridors without any estimation of when they will be called. Leaving the queue means losing your spot.
                </p>
              </div>

              <div className="sq-card" style={{ borderLeft: '4px solid #34c759', padding: 40 }}>
                <span style={{ fontSize: 32 }}>✨</span>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 10px', color: 'var(--text)' }}>
                  The SmartQueue Solution
                </h3>
                <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                  Virtually sign up from anywhere on campus. Watch your number advance live, receive notifications at key positions, and head to the counter only when it's your turn.
                </p>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* 3. HOW IT WORKS */}
        <section id="how-it-works" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 90px' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>How it Works</h2>
              <p style={{ fontSize: 15, color: 'var(--text-sub)', marginTop: 8 }}>Four steps to campus virtual queuing freedom</p>
            </div>
            
            <div className="step-grid">
              {[
                { num: '01', icon: '🔑', title: 'Authenticate', desc: 'Secure student login with your credentials.' },
                { num: '02', icon: '🎫', title: 'Request Token', desc: 'Select your department queue and join instantly.' },
                { num: '03', icon: '📈', title: 'Live Tracker', desc: 'Watch your position advance in real-time.' },
                { num: '04', icon: '🔔', title: 'Get Called', desc: 'Browser notification triggers when you are next.' },
              ].map((step) => (
                <div key={step.num} className="sq-card step-card">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 14 }}>{step.num}</div>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{step.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </FadeInSection>
        </section>

        {/* 4. PRODUCT SHOWCASE (Visual Centerpiece) */}
        <section id="features" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px 90px' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>Product Showcase</h2>
              <p style={{ fontSize: 15, color: 'var(--text-sub)', marginTop: 8 }}>Experience the three portals of the virtual queue system</p>
            </div>

            {/* Tabs selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', background: 'var(--bg-card)', padding: 4, borderRadius: 14, border: '1px solid var(--border-s)', boxShadow: 'var(--shadow-card)' }}>
                {(['student', 'staff', 'admin'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`sq-btn sq-btn-sm ${activeTab === tab ? 'sq-btn-primary' : 'sq-btn-ghost'}`}
                    style={{ borderRadius: 10, borderWidth: 0 }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} View
                  </button>
                ))}
              </div>
            </div>

            {/* Showcase Showcase Card */}
            <div className="sq-card" style={{ minHeight: 400, padding: 0, display: 'flex', flexDirection: 'column', transition: 'all 0.4s var(--ease-out-expo)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              
              {/* Simulated Browser Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {activeTab === 'student' && 'SmartQueue Student Portal'}
                    {activeTab === 'staff' && 'SmartQueue Staff Control Center'}
                    {activeTab === 'admin' && 'SmartQueue Central Admin Dashboard'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="sq-live-dot" />
                  {activeTab === 'student' && 'Rahul A. (Student)'}
                  {activeTab === 'staff' && 'Prof. Patil (Counter 1)'}
                  {activeTab === 'admin' && 'System Admin (BCA)'}
                </div>
              </div>

              {/* Simulated Browser Content Body */}
              <div style={{ padding: '32px 40px', background: 'var(--bg-card)', flex: 1 }}>
                
                {/* Tab: Student Experience */}
                {activeTab === 'student' && (
                  <div className="sq-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                    {/* Left: Active Token Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="sq-badge sq-badge-waiting">In Queue</span>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>Fees Counter Queue</h3>
                          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>GH Raisoni Admin Block</p>
                        </div>
                        <div style={{ textTransform: 'uppercase', textAlign: 'right' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600 }}>Ticket</span>
                          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>#18</div>
                        </div>
                      </div>

                      {/* Timeline flow */}
                      <div style={{ borderTop: '1px solid var(--border-s)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 8 }}>
                          <span>QUEUE PROGRESS</span>
                          <span>CURRENTLY SERVING: #15</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                          <div style={{ width: '83%', background: 'var(--accent)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-sub)', marginTop: 6 }}>
                          <span>Joined Counter</span>
                          <span><strong>Your Turn Next (3 left)</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Info Panels */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ padding: 20, border: '1px solid var(--border-s)', borderRadius: 16, background: 'var(--bg)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.02em' }}>PEOPLE AHEAD</div>
                          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>3 Students</div>
                        </div>
                        <div style={{ padding: 20, border: '1px solid var(--border-s)', borderRadius: 16, background: 'var(--bg)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.02em' }}>EST. WAIT TIME</div>
                          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--accent)' }}>~12 Mins</div>
                        </div>
                      </div>

                      <div style={{ padding: 16, background: 'rgba(0,113,227,0.03)', border: '1px solid rgba(0,113,227,0.1)', borderRadius: 12, fontSize: 12, color: 'var(--text-sub)', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 18 }}>🔔</span>
                        <span>Browser status notifications will alert you when you reach positions <strong>5</strong>, <strong>3</strong>, and <strong>1</strong>.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Staff Experience */}
                {activeTab === 'staff' && (
                  <div className="sq-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
                    {/* Left: Controls Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg)' }}>
                      <div>
                        <span className="sq-badge sq-badge-called" style={{ background: 'rgba(255,159,10,0.08)', color: '#ff9f0a', borderColor: 'rgba(255,159,10,0.2)' }}>Counter 1 Console</span>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>Admissions Office Desk</h3>
                      </div>
                      
                      <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border-s)', borderBottom: '1px solid var(--border-s)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>CURRENT ACTIVE TOKEN</div>
                        <div style={{ fontSize: 48, fontWeight: 850, color: '#ff9f0a', margin: '4px 0' }}>#24</div>
                        <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>Student: <strong>Rohan Seth</strong></div>
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button className="sq-btn sq-btn-primary" style={{ flex: 1.5, fontSize: 12, padding: '10px 14px' }}>➡️ Call Next</button>
                        <button className="sq-btn sq-btn-ghost" style={{ flex: 1, fontSize: 12, padding: '10px 14px' }}>✅ Done</button>
                      </div>
                    </div>

                    {/* Right: Live List Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)' }}>WAITING LIST PREVIEW</h4>
                        <span className="sq-badge" style={{ background: 'var(--border)', color: 'var(--text-sub)', fontSize: 10 }}>5 Waiting</span>
                      </div>

                      <div style={{ border: '1px solid var(--border-s)', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border-s)', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)' }}>
                          <span>Student Details</span>
                          <span>Status</span>
                        </div>
                        <div style={{ background: 'var(--bg-card)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-s)', fontSize: 13 }}>
                            <span><strong>#25</strong> · Rohan Seth</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Next</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', fontSize: 13 }}>
                            <span><strong>#26</strong> · Neha Shah</span>
                            <span style={{ color: 'var(--text-dim)' }}>Waiting</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Admin Experience */}
                {activeTab === 'admin' && (
                  <div className="sq-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Top: 3 KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                      <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border-s)', borderRadius: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.03em' }}>ACTIVE COUNTERS</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>3 / 3</div>
                      </div>
                      <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border-s)', borderRadius: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.03em' }}>SERVED TODAY</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>142 Students</div>
                      </div>
                      <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--border-s)', borderRadius: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.03em' }}>AVG SERVICE TIME</div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--accent)' }}>4.8 Mins</div>
                      </div>
                    </div>

                    {/* Bottom: Allocations Table */}
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12 }}>DEPARTMENT QUEUE ALLOCATIONS</h4>
                      <div style={{ border: '1px solid var(--border-s)', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 18px', background: 'var(--bg)', borderBottom: '1px solid var(--border-s)', fontSize: 12, fontWeight: 600, color: 'var(--text-sub)' }}>
                          <span>Queue Counter</span>
                          <span>Assigned Staff</span>
                          <span>Status</span>
                        </div>
                        <div style={{ background: 'var(--bg-card)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 18px', borderBottom: '1px solid var(--border-s)', fontSize: 13 }}>
                            <span><strong>Scholarship Counter</strong></span>
                            <span style={{ color: 'var(--text-sub)' }}>Prof. Patil</span>
                            <span><span className="sq-live-dot" style={{ marginRight: 6 }} />Active</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 18px', fontSize: 13 }}>
                            <span><strong>Admissions Office</strong></span>
                            <span style={{ color: 'var(--text-sub)' }}>Admin Desk 1</span>
                            <span><span className="sq-live-dot" style={{ marginRight: 6 }} />Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* 5. BENEFITS SECTION */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 90px' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>Why SmartQueue is Better</h2>
              <p style={{ fontSize: 15, color: 'var(--text-sub)', marginTop: 8 }}>Say goodbye to traditional queues</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              <div className="sq-card" style={{ padding: 36 }}>
                <span style={{ fontSize: 32 }}>⏳</span>
                <h4 style={{ fontSize: 18, fontWeight: 600, margin: '16px 0 8px', color: 'var(--text)' }}>Time Savings</h4>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  No more physical corridors. Access the virtual queue system on your mobile and complete other tasks on campus while you wait.
                </p>
              </div>

              <div className="sq-card" style={{ padding: 36 }}>
                <span style={{ fontSize: 32 }}>🔔</span>
                <h4 style={{ fontSize: 18, fontWeight: 600, margin: '16px 0 8px', color: 'var(--text)' }}>Smart Alerts</h4>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Automated background service worker warnings. Keeps you updated on when to head over, removing wait anxiety.
                </p>
              </div>

              <div className="sq-card" style={{ padding: 36 }}>
                <span style={{ fontSize: 32 }}>📊</span>
                <h4 style={{ fontSize: 18, fontWeight: 600, margin: '16px 0 8px', color: 'var(--text)' }}>Data Management</h4>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Enables administrators to view queue congestion in real-time, adjust staff allocations, and analyze service durations.
                </p>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* 6. PROOF & METRICS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 90px' }}>
          <FadeInSection>
            <div className="sq-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, textAlign: 'center', background: 'var(--bg)', border: '1px solid var(--border)', padding: '48px 32px' }}>
              <div>
                <div style={{ fontSize: 64, fontWeight: 850, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <CountUp end={500} suffix="+" />
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 600, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Students Served Today
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: 64, fontWeight: 850, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <CountUp end={10} suffix="+" />
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 600, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Departments Enabled
                </div>
              </div>

              <div>
                <div style={{ fontSize: 64, fontWeight: 850, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <CountUp end={95} suffix="%" />
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-sub)', fontWeight: 600, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Wait Congestion Reduction
                </div>
              </div>
            </div>
          </FadeInSection>
        </section>


        {/* 8. CALL TO ACTION */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px 90px' }}>
          <FadeInSection>
            <div className="sq-card sq-card-lift" style={{ 
              textAlign: 'center', 
              padding: '80px 40px', 
              position: 'relative', 
              overflow: 'hidden', 
              border: '1px solid var(--accent)',
              boxShadow: '0 12px 40px rgba(0, 113, 227, 0.08)' 
            }}>
              {/* Background ambient glow inside CTA */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 550,
                height: 550,
                background: 'radial-gradient(circle, rgba(0,113,227,0.14) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: 42, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                  Ready to skip the wait?
                </h2>
                <p style={{ fontSize: 16, color: 'var(--text-sub)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
                  Access the SmartQueue platform immediately to register and join your department queue.
                </p>
                <Link href="/register" className="sq-btn sq-btn-primary sq-btn-lg">
                  Join Virtual Queue Now
                </Link>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Footer */}
        <Footer />
      </div>

      <style>{`
        .sq-gradient-bg {
          position: absolute;
          inset: 0;
          background: var(--bg);
        }
        .sq-gradient-bg::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          top: -100px; left: -100px;
          border-radius: 50%;
          filter: blur(80px);
          background: radial-gradient(circle, rgba(0,113,227,0.08) 0%, transparent 75%);
          animation: float1 25s ease-in-out infinite;
        }
        .sq-gradient-bg::after {
          content: '';
          position: absolute;
          width: 450px; height: 450px;
          bottom: -100px; right: -100px;
          border-radius: 50%;
          filter: blur(80px);
          background: radial-gradient(circle, rgba(0,113,227,0.05) 0%, transparent 75%);
          animation: float2 30s ease-in-out infinite;
        }
        .dark .sq-gradient-bg::before {
          background: radial-gradient(circle, rgba(41,151,255,0.06) 0%, transparent 75%);
        }
        .dark .sq-gradient-bg::after {
          background: radial-gradient(circle, rgba(41,151,255,0.04) 0%, transparent 75%);
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, -40px) scale(1.05); }
        }
        .step-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .step-card {
          position: relative;
        }
        @media (min-width: 992px) {
          .step-card:not(:last-child)::after {
            content: '→';
            position: absolute;
            right: -18px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 24px;
            color: var(--accent);
            opacity: 0.35;
          }
        }
        @media (max-width: 480px) {
          .sq-gradient-bg::before { width: 250px; height: 250px; }
          .sq-gradient-bg::after  { width: 220px; height: 220px; }
        }
      `}</style>
    </>
  );
}
