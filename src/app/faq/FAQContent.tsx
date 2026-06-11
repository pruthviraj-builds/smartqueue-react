'use client';

import React, { useState, useDeferredValue } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

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
    category: 'General Questions',
    q: 'What is SmartQueue?',
    a: 'SmartQueue is a virtual queue management platform designed for educational institutions. It allows students to join service lines digitally via their mobile devices or computer, eliminating physical queues and lobby congestion.'
  },
  {
    id: 'gen-2',
    category: 'General Questions',
    q: 'Who can use this platform?',
    a: 'The service is available to all registered students, faculty, staff, and office administrators of GH Raisoni College of Engineering & Management, Jalgaon.'
  },
  {
    id: 'gen-3',
    category: 'General Questions',
    q: 'Is a mobile app installation required?',
    a: 'No. SmartQueue is a responsive web application. You can access it on any smartphone, tablet, or desktop web browser without needing to download anything from an app store.'
  },
  // Student Questions
  {
    id: 'stu-1',
    category: 'Student Questions',
    q: 'How do I get a queue token?',
    a: 'Log in using your student credentials, navigate to your Student Dashboard, select the department counter you wish to visit (such as Accounts or Registrar), and click "Join Queue" to instantly issue your virtual token.'
  },
  {
    id: 'stu-2',
    category: 'Student Questions',
    q: 'Can I cancel my token if I change my mind?',
    a: 'Yes. If you no longer require counter service, you can cancel your token at any time by clicking "Leave Queue" on your active token status page. This instantly removes you from the queue and speeds up waiting times for others.'
  },
  {
    id: 'stu-3',
    category: 'Student Questions',
    q: 'What happens if I miss my turn?',
    a: 'If your token is called by a staff member and you are not present at the counter, they may put your ticket on hold or mark it completed. We recommend monitoring your live dashboard and keeping an eye on your estimated call time.'
  },
  // Queue Tracking
  {
    id: 'track-1',
    category: 'Queue Tracking',
    q: 'Do I need to wait in the department lobby?',
    a: 'No. Once you issue a virtual token, you are free to wait anywhere on campus—like the canteen, library, or campus lawns. The dashboard updates live in real-time, allowing you to walk over only when your turn is close.'
  },
  {
    id: 'track-2',
    category: 'Queue Tracking',
    q: 'How is the estimated wait time calculated?',
    a: 'Estimated wait times are computed dynamically based on the number of people ahead of you in line, the number of active counters, and the average service duration of recently completed tokens.'
  },
  {
    id: 'track-3',
    category: 'Queue Tracking',
    q: 'Why does my estimated wait time fluctuate?',
    a: 'Since wait times are updated live, they may decrease if a counter works faster or if students ahead of you cancel their tokens. They can also increase slightly if a student ahead of you has a complex issue that takes longer to resolve.'
  },
  // Notifications
  {
    id: 'notif-1',
    category: 'Notifications',
    q: 'Can I get browser notifications on my phone?',
    a: 'Yes. Upon joining a queue, the application will prompt you for browser notification permissions. If you allow them, you will receive push alert notifications when your token is near the front of the queue.'
  },
  {
    id: 'notif-2',
    category: 'Notifications',
    q: 'What happens if I close my tracking browser tab?',
    a: 'Your token position is saved securely on our servers, so you will not lose your place. However, closing the browser tab prevents the live audio cues and desktop notifications from alerting you when you are called. We recommend keeping the tab open in the background.'
  },
  // Technical Help
  {
    id: 'tech-1',
    category: 'Technical Help',
    q: 'What if I lose internet connection while waiting?',
    a: 'If you go offline, a connectivity warning will be displayed on the page. Your place in the queue remains perfectly safe on the server. The live status feed will automatically resume once your internet reconnects.'
  },
  {
    id: 'tech-2',
    category: 'Technical Help',
    q: 'How do I report system bugs or technical issues?',
    a: 'If you run into any system error, please contact our administrative IT desk or write to us at info.jalgaon@raisoni.net with a description of the problem and your student details.'
  }
];

const CATEGORIES = [
  'All',
  'General Questions',
  'Student Questions',
  'Queue Tracking',
  'Notifications',
  'Technical Help'
];

export function FAQContent() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter FAQs based on selected category and deferred search query
  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(deferredSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate item counts for sidebar categories
  const getCategoryCount = (category: string) => {
    if (category === 'All') return FAQ_DATA.length;
    return FAQ_DATA.filter((faq) => faq.category === category).length;
  };

  return (
    <>
      {/* Background Orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="sq-gradient-bg" />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar portal="home" />

        {/* CSS styles */}
        <style>{`
          .faq-hero {
            max-width: 840px;
            margin: 0 auto;
            padding: 80px 20px 40px;
            text-align: center;
          }
          .faq-title {
            font-size: clamp(32px, 5vw, 48px);
            font-weight: 800;
            color: var(--text);
            letter-spacing: -0.02em;
            margin-bottom: 12px;
          }
          .faq-subtitle {
            font-size: clamp(14px, 2vw, 16px);
            color: var(--text-sub);
            max-width: 500px;
            margin: 0 auto;
            line-height: 1.5;
          }
          
          .search-wrapper {
            position: relative;
            max-width: 560px;
            margin: 0 auto 30px;
            padding: 0 20px;
          }
          .search-input-container {
            position: relative;
            width: 100%;
          }
          .search-input {
            width: 100%;
            padding: 14px 18px 14px 44px;
            font-size: 14px;
            font-weight: 500;
            color: var(--text);
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            outline: none;
            transition: all 0.25s var(--ease-out-expo);
            box-shadow: var(--shadow-card);
            font-family: inherit;
          }
          .search-input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
          }
          .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-dim);
            pointer-events: none;
          }
          .clear-button {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-dim);
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            border-radius: 50%;
            transition: background 0.2s, color 0.2s;
          }
          .clear-button:hover {
            background: var(--border);
            color: var(--text);
          }

          .faq-container {
            display: grid;
            grid-template-columns: 220px 1fr;
            gap: 40px;
            max-width: 880px;
            width: 100%;
            margin: 0 auto auto;
            padding: 0 20px 80px;
            box-sizing: border-box;
          }
          
          .faq-sidebar {
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: sticky;
            top: 90px;
            height: fit-content;
            z-index: 5;
          }
          .faq-category-btn {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 550;
            color: var(--text-sub);
            background: transparent;
            border: 1px solid transparent;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
            font-family: inherit;
          }
          .faq-category-btn:hover {
            background: var(--bg-card);
            color: var(--text);
          }
          .faq-category-btn.active {
            background: var(--bg-card);
            color: var(--accent);
            border-color: var(--border);
            box-shadow: var(--shadow-card);
          }
          .faq-category-count {
            font-size: 10px;
            background: var(--border);
            color: var(--text-sub);
            padding: 2px 6px;
            border-radius: 999px;
            font-weight: 600;
          }
          .faq-category-btn.active .faq-category-count {
            background: var(--accent);
            color: #ffffff;
          }

          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .faq-item-card {
            background: var(--bg-card);
            border: 1px solid var(--border-s);
            border-radius: 18px;
            padding: 20px 24px;
            cursor: pointer;
            transition: all 0.4s var(--ease-out-expo);
          }
          .faq-item-card:hover {
            border-color: var(--border);
            transform: translateY(-1px);
            box-shadow: var(--shadow-card);
          }
          .faq-item-question-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
          }
          .faq-item-question {
            font-size: 14px;
            font-weight: 600;
            color: var(--text);
            margin: 0;
            line-height: 1.4;
          }
          .faq-item-answer-wrapper {
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-height 0.4s var(--ease-out-expo), opacity 0.4s var(--ease-out-expo), padding-top 0.4s var(--ease-out-expo);
          }
          .faq-item-answer-wrapper.open {
            max-height: 240px;
            opacity: 1;
            padding-top: 12px;
          }
          .faq-item-answer {
            font-size: 13px;
            color: var(--text-sub);
            line-height: 1.5;
            margin: 0;
          }

          .faq-support-card {
            max-width: 840px;
            width: 100%;
            margin: 0 auto 80px;
            padding: 0 20px;
            box-sizing: border-box;
          }
          .faq-support-inner {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-card);
            padding: 40px;
            text-align: center;
            box-shadow: var(--shadow-card);
          }
          .faq-support-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text);
            margin-bottom: 8px;
          }
          .faq-support-desc {
            font-size: 13px;
            color: var(--text-sub);
            max-width: 440px;
            margin: 0 auto 20px;
            line-height: 1.5;
          }
          .faq-support-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          @media (max-width: 768px) {
            .faq-hero {
              padding: 60px 20px 30px;
            }
            .faq-container {
              grid-template-columns: 1fr;
              gap: 20px;
              padding-bottom: 60px;
            }
            .faq-sidebar {
              position: static;
              flex-direction: row;
              overflow-x: auto;
              padding: 4px 4px 10px;
              margin: 0 -20px 10px;
              padding-left: 20px;
              padding-right: 20px;
              border-bottom: 1px solid var(--border-s);
              gap: 8px;
              scrollbar-width: none;
              -webkit-overflow-scrolling: touch;
            }
            .faq-sidebar::-webkit-scrollbar {
              display: none;
            }
            .faq-category-btn {
              flex-shrink: 0;
              padding: 8px 14px;
              font-size: 12px;
              border-radius: 20px;
              border: 1px solid var(--border);
              background: var(--bg-card);
            }
            .faq-category-btn.active {
              background: var(--accent);
              color: #ffffff;
              border-color: var(--accent);
            }
            .faq-category-count {
              display: none;
            }
            .faq-support-inner {
              padding: 30px 20px;
            }
          }
        `}</style>

        {/* 1. HERO HEADER */}
        <header className="faq-hero sq-fade-in">
          <h1 className="faq-title" id="faq-page-heading">Help & FAQs</h1>
          <p className="faq-subtitle">
            Find answers to frequently asked questions about the virtual queue system at GH Raisoni College.
          </p>
        </header>

        {/* 2. SEARCH BAR */}
        <div className="search-wrapper sq-fade-in">
          <div className="search-input-container">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="faq-search-input"
              type="text"
              placeholder="Search FAQs (e.g. 'token', 'wait time', 'notification')..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search FAQs"
            />
            {searchQuery && (
              <button
                className="clear-button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 3. FAQ GRID */}
        <main className="faq-container">
          {/* Left: Category Sidebar */}
          <aside className="faq-sidebar sq-fade-in" aria-label="FAQ Categories">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  className={`faq-category-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={isActive}
                >
                  <span>{category}</span>
                  <span className="faq-category-count">{getCategoryCount(category)}</span>
                </button>
              );
            })}
          </aside>

          {/* Right: Questions Accordion List */}
          <section className="faq-list" aria-label="FAQ List">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = !!openFaqs[faq.id];
                return (
                  <article
                    key={faq.id}
                    className="faq-item-card sq-fade-in"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-item-question-row">
                      <h3 className="faq-item-question">{faq.q}</h3>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.4s var(--ease-out-expo)',
                          color: isOpen ? 'var(--accent)' : 'var(--text-dim)',
                          flexShrink: 0
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>

                    <div className={`faq-item-answer-wrapper ${isOpen ? 'open' : ''}`}>
                      <p className="faq-item-answer">{faq.a}</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState
                icon="🔍"
                title="No FAQs found"
                description={`No results matched your search for "${deferredSearchQuery}"${
                  selectedCategory !== 'All' ? ` in the category "${selectedCategory}"` : ''
                }. Try searching other terms or clearing filters.`}
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              />
            )}
          </section>
        </main>

        {/* 4. SUPPORT CALL TO ACTION */}
        <section className="faq-support-card sq-fade-in">
          <div className="faq-support-inner">
            <h2 className="faq-support-title">Still have questions?</h2>
            <p className="faq-support-desc">
              If you couldn't find the answers you were looking for, please connect with the G H Raisoni administrative office or IT help desk.
            </p>
            <div className="faq-support-buttons">
              <a href="mailto:info.jalgaon@raisoni.net" className="sq-btn sq-btn-primary">
                Email Support
              </a>
              <a href="tel:+912572264881" className="sq-btn sq-btn-ghost">
                Call Help Desk
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
