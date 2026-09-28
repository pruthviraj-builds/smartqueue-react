'use client';

import React, { useState, useDeferredValue } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  X,
  ChevronDown,
  Sparkles,
  Ticket,
  Clock,
  Bell,
  ShieldCheck,
  Bot,
  Mail,
  HelpCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: string;
  q: string;
  a: string;
}

const FAQ_DATA: FAQItem[] = [
  // General Questions
  {
    id: 'gen-1',
    category: 'General',
    q: 'What is SmartQueue?',
    a: 'SmartQueue is a high-performance virtual queue management platform designed for colleges and institutions. It allows students to join service lines digitally via their mobile devices or computer, eliminating physical lines and lobby congestion.'
  },
  {
    id: 'gen-2',
    category: 'General',
    q: 'Who can use this platform?',
    a: 'The service is available to all registered students, faculty, staff, and office administrators.'
  },
  {
    id: 'gen-3',
    category: 'General',
    q: 'Is a mobile app installation required?',
    a: 'No. SmartQueue is a responsive web application. You can access it on any smartphone, tablet, or desktop web browser without needing to download anything from an app store.'
  },
  // Student Questions
  {
    id: 'stu-1',
    category: 'Student Flow',
    q: 'How do I get a queue token?',
    a: 'Log in using your student credentials, navigate to your Student Dashboard, select the department counter you wish to visit (such as Fees, Admissions, or Scholarship), and click "Join Queue" to instantly issue your virtual token.'
  },
  {
    id: 'stu-2',
    category: 'Student Flow',
    q: 'Can I cancel my token if I change my mind?',
    a: 'Yes. If you no longer require counter service, you can cancel your token while waiting by clicking "Cancel Ticket" on your token status page. This instantly removes you from the queue and speeds up waiting times for others.'
  },
  {
    id: 'stu-3',
    category: 'Student Flow',
    q: 'Can I cancel my ticket once my number is called?',
    a: 'No. Once staff calls your ticket to the counter, the cancel button is hidden to ensure uninterrupted counter operations. Please proceed directly to the counter.'
  },
  // Queue Tracking
  {
    id: 'track-1',
    category: 'Live Tracking',
    q: 'Do I need to wait in the department lobby?',
    a: 'No. Once you issue a virtual token, you are free to wait anywhere on campus—like the canteen, library, or campus lawns. The dashboard updates in real-time, allowing you to walk over only when your turn is close.'
  },
  {
    id: 'track-2',
    category: 'Live Tracking',
    q: 'How is the estimated wait time calculated?',
    a: 'Estimated wait times are computed dynamically based on the number of people ahead of you in line and the average service duration of recently completed tokens.'
  },
  {
    id: 'track-3',
    category: 'Live Tracking',
    q: 'Why does my estimated wait time fluctuate?',
    a: 'Since wait times update live, they may decrease if counters work faster or if students ahead cancel their tokens. They can also adjust slightly if a session ahead requires extra resolution time.'
  },
  // Notifications
  {
    id: 'notif-1',
    category: 'Notifications',
    q: 'Can I get browser notifications on my phone?',
    a: 'Yes. Upon joining a queue, the application will prompt you for browser notification permissions. If you allow them, you will receive push alert notifications when you are 5th, 3rd, and next in line.'
  },
  {
    id: 'notif-2',
    category: 'Notifications',
    q: 'What happens if I close my tracking browser tab?',
    a: 'Your token position is saved securely on our cloud servers, so you will not lose your place. However, keeping the tab open ensures audio cues and desktop notifications alert you the moment you are called.'
  },
  // Security & Tech
  {
    id: 'tech-1',
    category: 'Security & Tech',
    q: 'What if I lose internet connection while waiting?',
    a: 'If you go offline, a connectivity warning will be displayed on the page. Your place in the queue remains safe on the server. The live status feed will automatically resume once your internet reconnects.'
  },
  {
    id: 'tech-2',
    category: 'Security & Tech',
    q: 'What is Campus Geofencing?',
    a: 'Campus Geofencing is an optional security safeguard that verifies physical proximity to campus before allowing queue access, preventing remote hoarding of tokens.'
  },
  {
    id: 'tech-3',
    category: 'Security & Tech',
    q: 'How does the AI Assistant work?',
    a: 'The built-in AI Assistant is powered by the Groq LPU inference engine, answering questions in sub-second speed regarding queue procedures and departmental guidelines.'
  }
];

const TOPIC_CARDS = [
  {
    category: 'Student Flow',
    icon: Ticket,
    color: '#0071e3',
    title: 'Student Queue Flow',
    desc: 'Joining departments, issuing tokens, and cancellation rules.',
  },
  {
    category: 'Live Tracking',
    icon: Activity,
    color: '#34c759',
    title: 'Live Tracking & Wait Time',
    desc: 'Realtime snapshot sync, dynamic estimation, and queue countdown.',
  },
  {
    category: 'Notifications',
    icon: Bell,
    color: '#ff9500',
    title: 'Push Alerts & Milestones',
    desc: 'Browser notification triggers when 5th, 3rd, and next in line.',
  },
  {
    category: 'Security & Tech',
    icon: ShieldCheck,
    color: '#af52de',
    title: 'Security & Geofencing',
    desc: 'Google reCAPTCHA, campus geofencing, and role enforcement.',
  },
];

const CATEGORIES = [
  'All',
  'General',
  'Student Flow',
  'Live Tracking',
  'Notifications',
  'Security & Tech',
];

export function FAQContent() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    'gen-1': true,
    'stu-1': true,
  });

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(deferredSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'All') return FAQ_DATA.length;
    return FAQ_DATA.filter((faq) => faq.category === category).length;
  };

  return (
    <>
      <Navbar portal="home" />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '60px 20px 100px 20px' }}>

        {/* Hero Header with Glow */}
        <section className="sq-fade-in" style={{ textAlign: 'center', marginBottom: 52, position: 'relative' }}>
          
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 340,
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
              marginBottom: 18,
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}>
              <span className="sq-live-dot" />
              <span>Help Center & Knowledge Base</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(34px, 5.5vw, 52px)',
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 18,
            }}>
              Answers to everything <span style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #5ac8ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>SmartQueue.</span>
            </h1>

            <p style={{
              fontSize: 16,
              color: 'var(--text-sub)',
              maxWidth: 580,
              margin: '0 auto 32px',
              lineHeight: 1.55,
            }}>
              Find quick solutions, explore step-by-step guides, or ask our intelligent AI Assistant for real-time help.
            </p>

            {/* Interactive Search Bar */}
            <div style={{
              maxWidth: 580,
              margin: '0 auto',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                left: 18,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <Search size={18} />
              </div>

              <input
                type="text"
                placeholder="Search topics (e.g. 'cancel token', 'wait time', 'alerts')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 44px 16px 48px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 18,
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  fontFamily: 'inherit',
                  transition: 'all 0.25s ease',
                }}
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--bg)',
                    border: '1px solid var(--border-s)',
                    borderRadius: 999,
                    width: 26,
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-sub)',
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 4 Topic Bento Cards (Quick Category Jump) */}
        {!searchQuery && (
          <section style={{ marginBottom: 48 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
            }}>
              {TOPIC_CARDS.map((card) => {
                const Icon = card.icon;
                const isCurrent = selectedCategory === card.category;
                return (
                  <div
                    key={card.category}
                    onClick={() => setSelectedCategory(card.category)}
                    className="sq-card sq-card-lift"
                    style={{
                      padding: 20,
                      borderRadius: 18,
                      cursor: 'pointer',
                      border: isCurrent ? '1.5px solid var(--accent)' : '1px solid var(--border-s)',
                      background: isCurrent ? 'var(--bg-hover)' : 'var(--bg-card)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: 'var(--bg)',
                        border: '1px solid var(--border-s)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                        marginBottom: 14,
                      }}>
                        <Icon size={18} />
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                        {card.title}
                      </h3>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.5, margin: 0 }}>
                        {card.desc}
                      </p>
                    </div>

                    <div style={{
                      marginTop: 14,
                      fontSize: 11,
                      fontWeight: 600,
                      color: isCurrent ? 'var(--accent)' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <span>{getCategoryCount(card.category)} articles</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Category Pills Bar */}
        <section style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollbarWidth: 'none',
          }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: active ? 'var(--accent)' : 'var(--bg-card)',
                    color: active ? '#ffffff' : 'var(--text-sub)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg)',
                    color: active ? '#ffffff' : 'var(--text-dim)',
                  }}>
                    {getCategoryCount(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Accordion FAQ List */}
        <section style={{ marginBottom: 60 }}>
          {filteredFaqs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredFaqs.map((faq) => {
                const isOpen = !!openFaqs[faq.id];
                return (
                  <div
                    key={faq.id}
                    onClick={() => toggleFaq(faq.id)}
                    className="sq-card"
                    style={{
                      padding: '20px 24px',
                      borderRadius: 18,
                      cursor: 'pointer',
                      border: isOpen ? '1px solid var(--border)' : '1px solid var(--border-s)',
                      background: isOpen ? 'var(--bg-hover)' : 'var(--bg-card)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--accent)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(0,113,227,0.08)',
                          whiteSpace: 'nowrap',
                        }}>
                          {faq.category}
                        </span>
                        <h3 style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: 'var(--text)',
                          margin: 0,
                          lineHeight: 1.35,
                        }}>
                          {faq.q}
                        </h3>
                      </div>

                      <div style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        color: isOpen ? 'var(--accent)' : 'var(--text-dim)',
                        flexShrink: 0,
                      }}>
                        <ChevronDown size={18} />
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: '1px solid var(--border-s)',
                        fontSize: 13,
                        color: 'var(--text-sub)',
                        lineHeight: 1.65,
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="🔍"
              title="No matching FAQs found"
              description={`No questions matched "${deferredSearchQuery}" in ${selectedCategory}. Try another keyword or reset filters.`}
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            />
          )}
        </section>

        {/* AI Assistant Banner */}
        <section
          className="sq-card"
          style={{
            padding: 30,
            borderRadius: 22,
            marginBottom: 40,
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
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #af52de 0%, #da8fff 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                  Need Immediate Assistance?
                </h3>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#af52de', background: 'rgba(175,82,222,0.1)', padding: '2px 8px', borderRadius: 999 }}>
                  Groq AI Powered
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-sub)', margin: 0 }}>
                Our virtual assistant is available 24/7 on the Student Dashboard to answer queue-related queries.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="sq-btn sq-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Sparkles size={15} />
            <span>Open Student Dashboard</span>
          </Link>
        </section>

        {/* Support Card */}
        <section className="sq-card" style={{ padding: 32, borderRadius: 22, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Still have questions?
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
            If you need assistance with specific student account issues or counter queries, reach out to our administration desk.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <a href="mailto:support@smartqueue.local" className="sq-btn sq-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Mail size={15} />
              <span>Email Support</span>
            </a>
            <Link href="/about" className="sq-btn sq-btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={15} />
              <span>About SmartQueue</span>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
