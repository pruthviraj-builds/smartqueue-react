'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer-band sq-footer">
      <style>{`
        .sq-footer {
          border-top: 1px solid var(--border-s);
          padding: 60px 20px 40px;
          position: relative;
          z-index: 10;
        }
        .footer-band {
          background: #fdf6f0;
        }
        .dark .footer-band {
          background: #1a1412;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
          max-width: 960px;
          margin-left: auto;
          margin-right: auto;
        }
        .sq-footer-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .sq-footer-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
          margin-top: 0;
        }
        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0px;
          font-size: 13px;
          color: var(--text-dim);
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s ease, gap 0.2s ease, padding-left 0.2s ease;
          cursor: pointer;
          position: relative;
          padding-left: 0;
        }
        .footer-link::before {
          content: '→';
          font-size: 11px;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          position: absolute;
          left: -16px;
          color: var(--accent);
        }
        .footer-link:hover {
          color: var(--text);
          padding-left: 6px;
        }
        .footer-link:hover::before {
          opacity: 1;
          transform: translateX(0);
        }
        .sq-footer-bottom {
          max-width: 960px;
          margin: 0 auto;
          border-top: 1px solid var(--border-s);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 12px;
          color: var(--text-dim);
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .sq-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="footer-grid">
        {/* Column 1 — Brand */}
        <div className="sq-footer-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div className="sq-logo-mark" style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--text)',
              color: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18
            }}>
              Q
            </div>
            <span className="sq-logo-name" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              SmartQueue
            </span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8 }}>
            GH Raisoni, Jalgaon
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
            Modern Queue Management for Educational Institutions. Reduce waiting. Improve student experience. Digitize campus services.
          </p>
        </div>

        {/* Column 2 — Navigation */}
        <div className="sq-footer-col">
          <h4 className="sq-footer-title">Navigation</h4>
          <Link href="/faq" className="footer-link">FAQ</Link>
          <Link href="/register" className="footer-link">Create Account</Link>
        </div>

        {/* Column 3 — Institution */}
        <div className="sq-footer-col">
          <h4 className="sq-footer-title">Institution</h4>
          <Link href="/login" className="footer-link">Student Portal</Link>
          <Link href="/staff/login" className="footer-link">Staff Portal</Link>
          <a href="#" className="footer-link">Support</a>
          <a href="#" className="footer-link">Contact</a>
          <a href="#" className="footer-link">Institutional Mail</a>
        </div>

        {/* Column 4 — Legal */}
        <div className="sq-footer-col">
          <h4 className="sq-footer-title">Legal</h4>
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
        </div>
      </div>

      <div className="sq-footer-bottom">
        <span>
          © 2026 SmartQueue. Designed for Educational Institutions.
        </span>
        <span style={{ textAlign: 'right' }}>
          Built by 🌍.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
