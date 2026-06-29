'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export type NavbarPortal = 
  | 'home'
  | 'student'
  | 'token'
  | 'staff'
  | 'staff-login'
  | 'admin'
  | 'admin-login'
  | 'login-register';

interface NavbarProps {
  portal: NavbarPortal;
  userName?: string;
  onLogout?: () => void;
  style?: React.CSSProperties;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navbar({ 
  portal, 
  userName, 
  onLogout, 
  style, 
  activeTab, 
  onTabChange 
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run immediately on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine logo config based on portal
  let logoMark = 'Q';
  let logoName = 'SmartQueue';
  let logoSub = 'GH Raisoni, Jalgaon';
  let logoHref = '/';

  if (portal === 'student' || portal === 'token') {
    logoSub = 'Student Portal';
    logoHref = '/dashboard';
  } else if (portal === 'staff' || portal === 'staff-login') {
    logoMark = '⚙';
    logoName = 'Staff Panel';
    logoSub = 'SmartQueue Management';
    logoHref = '/staff/dashboard';
  } else if (portal === 'admin' || portal === 'admin-login') {
    logoMark = '👑';
    logoName = 'Admin Panel';
    logoSub = 'SmartQueue Analytics';
    logoHref = '/admin/dashboard';
  }

  const handleTabClick = (e: React.MouseEvent, tab: string) => {
    if (onTabChange) {
      e.preventDefault();
      onTabChange(tab);
    }
  };

  const isPublic = portal === 'home' || portal === 'login-register';
  const isStudent = portal === 'student' || portal === 'token';
  const isStaff = portal === 'staff';
  const isAdmin = portal === 'admin';

  return (
    <nav className={`sq-nav ${scrolled ? 'scrolled' : ''}`} style={style}>
      <style>{`
        .sq-nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .sq-nav-link {
          color: var(--text-sub);
          font-weight: 500;
          font-size: 13px;
          transition: color 0.2s, border-color 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 0;
          font-family: inherit;
          text-decoration: none;
          border-bottom: 2px solid transparent;
        }
        .sq-nav-link:hover {
          color: var(--text);
        }
        .sq-nav-link.active {
          color: var(--text);
          border-bottom-color: var(--accent);
        }
        @media (max-width: 768px) {
          .sq-nav-links {
            display: none !important;
          }
        }
      `}</style>

      <Link href={logoHref} className="sq-logo">
        <div className="sq-logo-mark" style={{ background: 'var(--text)', color: 'var(--bg)' }}>{logoMark}</div>
        <div>
          <div className="sq-logo-name">{logoName}</div>
          <div className="sq-logo-sub">{logoSub}</div>
        </div>
      </Link>

      {/* Middle Links - Portal-Specific */}
      <div className="sq-nav-links">
        {isStudent && (
          <>
            <Link href="/dashboard" className={`sq-nav-link ${portal === 'student' ? 'active' : ''}`}>Dashboard</Link>
            <Link href="/token" className={`sq-nav-link ${portal === 'token' ? 'active' : ''}`}>Token Status</Link>
          </>
        )}

        {isStaff && (
          <>
            <a 
              href="#assigned" 
              onClick={(e) => handleTabClick(e, 'assigned')} 
              className={`sq-nav-link ${activeTab === 'assigned' ? 'active' : ''}`}
            >
              Assigned Queues
            </a>
            <a 
              href="#controls" 
              onClick={(e) => handleTabClick(e, 'controls')} 
              className={`sq-nav-link ${activeTab === 'controls' ? 'active' : ''}`}
            >
              Queue Controls
            </a>
          </>
        )}

        {isAdmin && (
          <>
            <a 
              href="#queues" 
              onClick={(e) => handleTabClick(e, 'overview')} 
              className={`sq-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Queue Management
            </a>
            <a 
              href="#staff" 
              onClick={(e) => handleTabClick(e, 'manage')} 
              className={`sq-nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            >
              Staff Management
            </a>
            <a 
              href="#analytics" 
              onClick={(e) => handleTabClick(e, 'analytics')} 
              className={`sq-nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              Analytics
            </a>
          </>
        )}
      </div>

      <div className="sq-nav-actions">

        {/* Public portal CTAs */}
        {isPublic && (
          <>
            <Link href="/login" className="sq-btn sq-btn-ghost sq-btn-sm">
              Login
            </Link>
            <Link href="/register" className="sq-btn sq-btn-primary sq-btn-sm">
              Create Account
            </Link>
          </>
        )}
        {/* User Info Capsule */}
        {(isStudent || isStaff || isAdmin) && userName && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            border: '1px solid var(--border-s)', background: 'var(--bg-card)',
          }}>
            <span className="sq-live-dot" />
            <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 500 }}>
              {userName}
            </span>
          </div>
        )}

        {/* Logout Action */}
        {(isStudent || isStaff || isAdmin) && onLogout && (
          <button onClick={onLogout} className="sq-btn sq-btn-ghost sq-btn-sm">
            Logout
          </button>
        )}

        {/* Theme Toggle Button */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="sq-btn sq-btn-ghost sq-btn-sm"
            style={{ width: 36, padding: '7px' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fbbf24' }}>
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.414l-.708-.707a1 1 0 010-1.414zM6.343 7.757a1 1 0 01-1.414-1.414l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM10 5a5 5 0 100 10 5 5 0 000-10zm-1 12a1 1 0 112 0v1a1 1 0 11-2 0v-1zm-6.22-4.22a1 1 0 010-1.415l.708-.707a1 1 0 011.414 1.414l-.708.707a1 1 0 01-1.414 0zM16.343 14.243a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM18 10a1 1 0 110-2h1a1 1 0 110 2h-1zM2 10a1 1 0 110-2H1a1 1 0 110 2h1z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#636366' }}>
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}

