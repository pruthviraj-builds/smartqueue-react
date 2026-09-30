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
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Cpu,
} from 'lucide-react';

const BENTO_FEATURES = [
  {
    id: 'realtime',
    icon: Activity,
    accentColor: '#0071e3',
    tag: 'Core Engine',
    title: 'Real-Time Firestore Synchronization',
    desc: 'Live bidirectional data binding via snapshot listeners. When counters change or staff calls a ticket, your position updates instantaneously without ever reloading the browser.',
    visual: (
      <div style={{
        marginTop: 18,
        padding: '14px 16px',
        borderRadius: 14,
        background: 'var(--bg)',
        border: '1px solid var(--border-s)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="sq-live-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Live Token Stream</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#34c759', background: 'rgba(52,199,89,0.1)', padding: '2px 8px', borderRadius: 999 }}>
            0ms Delay
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, var(--accent), #5ac8ff)', borderRadius: 999 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-sub)' }}>
          <span>Now: <strong style={{ color: 'var(--text)' }}>#14</strong></span>
          <span>Your Turn: <strong style={{ color: 'var(--accent)' }}>#16</strong> <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>(2 ahead)</span></span>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-assistant',
    icon: Bot,
    accentColor: '#af52de',
    tag: 'Groq Cloud LPU',
    title: 'AI Queue Assistant',
    desc: 'Powered by Groq inference, answering questions instantly regarding queue timings, required paperwork, and counter policies.',
    visual: (
      <div style={{
        marginTop: 18,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'var(--bg)',
        border: '1px solid var(--border-s)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
          "How do I join the Fees counter?"
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--text)',
          background: 'var(--bg-card)',
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid var(--border-s)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <Sparkles size={12} color="#af52de" />
          <span>Log in and tap <strong>Join Queue</strong>.</span>
        </div>
      </div>
    ),
  },
  {
    id: 'notifications',
    icon: Bell,
    accentColor: '#ff9500',
    tag: 'Alerts',
    title: 'Smart Milestone Alerts',
    desc: 'Browser notifications trigger automatically when you are 5th, 3rd, and next in line so you never miss your turn.',
    visual: (
      <div style={{
        marginTop: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'var(--bg)',
        border: '1px solid var(--border-s)',
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#ff9500', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <Bell size={15} />
        </div>
        <div style={{ fontSize: 11 }}>
          <div style={{ fontWeight: 700, color: 'var(--text)' }}>You're Next!</div>
          <div style={{ color: 'var(--text-sub)' }}>Head to Counter #2 now</div>
        </div>
      </div>
    ),
  },
  {
    id: 'roles',
    icon: ShieldCheck,
    accentColor: '#34c759',
    tag: 'Security & Access',
    title: 'Triple-Role Ecosystem',
    desc: 'Strict role separation between Student, Staff counter operators, and System Administrators enforced via Firestore rules.',
    visual: (
      <div style={{
        marginTop: 18,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'var(--bg)',
        border: '1px solid var(--border-s)',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: 'rgba(0,113,227,0.1)', color: 'var(--accent)' }}>🎓 Student</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: 'rgba(52,199,89,0.1)', color: '#34c759' }}>👨‍💼 Staff</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 999, background: 'rgba(175,82,222,0.1)', color: '#af52de' }}>⚙️ Admin</span>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart3,
    accentColor: '#5856d6',
    tag: 'Telemetry',
    title: 'Operational Analytics',
    desc: 'Computes wait times, average service speeds per department, daily throughput metrics, and logs system events with CSV export support.',
    visual: (
      <div style={{
        marginTop: 18,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
      }}>
        <div style={{ padding: '8px 4px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-s)', textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Served</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>500+</div>
        </div>
        <div style={{ padding: '8px 4px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-s)', textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Avg Wait</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>~4.2m</div>
        </div>
        <div style={{ padding: '8px 4px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border-s)', textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>Uptime</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#34c759', marginTop: 2 }}>99.9%</div>
        </div>
      </div>
    ),
  },
  {
    id: 'geofencing',
    icon: MapPin,
    accentColor: '#00c7be',
    tag: 'Anti-Abuse',
    title: 'Campus Geofencing',
    desc: 'Optional GPS perimeter check ensuring that only students physically on campus can join active service lines, preventing remote hoarding.',
    visual: (
      <div style={{
        marginTop: 18,
        padding: '12px 14px',
        borderRadius: 14,
        background: 'var(--bg)',
        border: '1px solid var(--border-s)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={15} color="#00c7be" />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>Campus Radius</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#34c759', background: 'rgba(52,199,89,0.1)', padding: '2px 8px', borderRadius: 999 }}>
          ✓ Verified
        </span>
      </div>
    ),
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Register & Authenticate',
    desc: 'Create an account protected by Google reCAPTCHA and Firebase Auth.',
  },
  {
    n: '02',
    title: 'Select Counter Queue',
    desc: 'Pick Fees, Admissions, or Scholarship and receive a digital token instantly.',
  },
  {
    n: '03',
    title: 'Track Live from Anywhere',
    desc: 'Watch estimated wait and position countdown without staying in physical line.',
  },
  {
    n: '04',
    title: 'Direct Counter Walk-in',
    desc: 'Receive your alert notification and head straight to the counter when called.',
  },
];

const TECH_STACK = [
  {
    category: 'Frontend & UI',
    icon: Code2,
    badgeColor: '#0071e3',
    items: ['React 19', 'Next.js 16 (App Router)', 'TypeScript', 'Tailwind CSS', 'Lucide Icons'],
  },
  {
    category: 'Cloud Backend & Auth',
    icon: Database,
    badgeColor: '#ff9500',
    items: ['Firebase Firestore', 'Realtime Snapshots', 'Firebase Authentication', 'Security Rules'],
  },
  {
    category: 'Artificial Intelligence',
    icon: Cpu,
    badgeColor: '#af52de',
    items: ['Groq Cloud API', 'openai/gpt-oss-120b', 'Next.js Edge Route Handlers'],
  },
  {
    category: 'Security & Verification',
    icon: ShieldCheck,
    badgeColor: '#34c759',
    items: ['Google reCAPTCHA v2/v3', 'Role Enforcement', 'Geofencing Boundary Checks'],
  },
];

const TEAM = [
  {
    name: 'Pruthviraj Nikam',
    role: 'Lead Full-Stack Developer',
    highlight: 'Architecture, UI/UX & Realtime Logic',
    desc: 'Engineered the complete frontend experience, Firebase real-time synchronization, Groq AI assistant integration, and deployment infrastructure.',
    badge: 'Frontend & Backend',
    github: 'https://github.com/pruthviraj-builds',
  },
  {
    name: 'Mohd Husham',
    role: 'Database & Security Engineer',
    highlight: 'Data Modeling & Access Rules',
    desc: 'Designed Firestore database architecture, optimized document structure for queue counters, and authored comprehensive security rules.',
    badge: 'Database & Data Flow',
    github: 'https://github.com/hushamorg',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar portal="home" />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '60px 20px 100px 20px' }}>

        {/* Hero Banner with Glow */}
        <section className="sq-fade-in" style={{ textAlign: 'center', marginBottom: 64, position: 'relative' }}>
          
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 320,
            height: 180,
            background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 999,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-sub)',
              marginBottom: 20,
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}>
              <span className="sq-live-dot" />
              <span>SmartQueue Architecture & Overview</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}>
              Queues without the <span style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #5ac8ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>crowd.</span>
            </h1>

            <p style={{
              fontSize: 17,
              color: 'var(--text-sub)',
              lineHeight: 1.6,
              maxWidth: 620,
              margin: '0 auto 24px',
            }}>
              A high-performance virtual queue management platform replacing physical lines with synchronized real-time tokens, predictive wait times, and intelligent alerts.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--border-s)' }}>
                🎓 BCA Final Year Project
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--border-s)' }}>
                ⚡ Sub-second Latency
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--border-s)' }}>
                🔒 Zero-Trust Rules
              </span>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 6 }}>
              Core Architecture
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Engineered for Speed & Transparency
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {BENTO_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="sq-card sq-card-lift"
                  style={{
                    padding: 26,
                    borderRadius: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'var(--bg)',
                        border: '1px solid var(--border-s)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: feat.accentColor,
                      }}>
                        <Icon size={20} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                        {feat.tag}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.25 }}>
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.55 }}>
                      {feat.desc}
                    </p>
                  </div>

                  {feat.visual}
                </div>
              );
            })}
          </div>
        </section>

        {/* 4-Step Interactive User Journey */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 6 }}>
              Student Flow
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              How It Works
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="sq-card sq-card-lift"
                style={{
                  padding: 22,
                  borderRadius: 18,
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'var(--accent)',
                  opacity: 0.85,
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}>
                  {step.n}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Bento Grid */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 6 }}>
              Technology Stack
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Built with Modern Standards
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
          }}>
            {TECH_STACK.map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.category}
                  className="sq-card"
                  style={{
                    padding: 22,
                    borderRadius: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--bg)',
                      border: '1px solid var(--border-s)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tech.badgeColor,
                      marginBottom: 14,
                    }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                      {tech.category}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {tech.items.map((item) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-sub)' }}>
                        <CheckCircle2 size={13} color={tech.badgeColor} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Engineering Team */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 6 }}>
              Engineering Team
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              The Creators
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="sq-card sq-card-lift"
                style={{
                  padding: 26,
                  borderRadius: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, var(--accent) 0%, #5ac8ff 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 800,
                    }}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                        {member.name}
                      </h3>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <a
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text)',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                </div>

                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-dim)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                  Focus: {member.highlight}
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Repository CTA Card */}
        <section
          className="sq-card"
          style={{
            padding: 32,
            borderRadius: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-hover) 100%)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Code2 size={20} color="var(--accent)" />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                Open Source & Code Repository
              </h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', maxWidth: 500, margin: 0 }}>
              Explore the source code, security rules, and full commit history on GitHub.
            </p>
          </div>

          <a
            href="https://github.com/pruthviraj-builds/smartqueue-react"
            target="_blank"
            rel="noreferrer"
            className="sq-btn sq-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <span>View on GitHub</span>
            <ExternalLink size={15} />
          </a>
        </section>

        {/* Legal & Policy Navigation */}
        <footer style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: '1px solid var(--border-s)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} SmartQueue. All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/privacy" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              Terms of Service
            </Link>
            <Link href="/cookies" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              Cookie Policy
            </Link>
          </div>
        </footer>

      </main>
    </>
  );
}