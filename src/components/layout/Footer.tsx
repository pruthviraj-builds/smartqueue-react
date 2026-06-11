'use client';

import React from 'react';
import Link from 'next/link';

export interface InstitutionConfig {
  institutionName: string;
  supportEmail: string;
  portalUrl: string;
  supportPhone?: string;
}

const DEFAULT_CONFIG: InstitutionConfig = {
  institutionName: "GH Raisoni College of Engineering & Management, Jalgaon",
  supportEmail: "info.jalgaon@raisoni.net",
  portalUrl: "https://ghrcem.raisoni.net",
  supportPhone: "+91 257 2264881-83",
};

interface FooterProps {
  config?: InstitutionConfig;
}

export function Footer({ config }: FooterProps) {
  const c = { ...DEFAULT_CONFIG, ...config };

  return (
    <footer className="sq-footer">
      <style>{`
        .sq-footer {
          border-top: 1px solid var(--border-s);
          padding: 60px 20px 40px;
          background: var(--bg);
          color: var(--text-sub);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          position: relative;
          z-index: 10;
        }
        .sq-footer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .sq-footer-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sq-footer-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text);
          margin-bottom: 8px;
        }
        .sq-footer-link {
          color: var(--text-dim);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s ease;
          display: inline-block;
          cursor: pointer;
        }
        .sq-footer-link:hover {
          color: var(--accent);
        }
        .sq-footer-text {
          color: var(--text-dim);
          font-size: 13px;
          margin: 0;
        }
        .sq-footer-divider {
          border: 0;
          border-top: 1px solid var(--border-s);
          margin: 40px auto 24px;
          max-width: 1280px;
        }
        .sq-footer-bottom {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 24px;
          font-size: 12px;
          color: var(--text-dim);
        }
        .sq-footer-branding-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 440px;
        }
        .sq-footer-brand-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }
        .sq-footer-developed {
          text-align: right;
          font-size: 11px;
        }
        .sq-footer-developed-text {
          margin: 0;
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .sq-footer {
            padding: 40px 20px 30px;
          }
          .sq-footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .sq-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .sq-footer-developed {
            text-align: left;
          }
        }
      `}</style>

      <div className="sq-footer-grid">
        {/* Column 1: Quick Links */}
        <div className="sq-footer-col">
          <h4 className="sq-footer-title">Quick Links</h4>
          <Link href="/#features" className="sq-footer-link">Features</Link>
          <Link href="/#how-it-works" className="sq-footer-link">How It Works</Link>
          <Link href="/login" className="sq-footer-link">Student Login</Link>
          <Link href="/register" className="sq-footer-link">Register</Link>
          <Link href="/faq" className="sq-footer-link">FAQ</Link>
        </div>

        {/* Column 2: Institution */}
        <div className="sq-footer-col">
          <h4 className="sq-footer-title">Institution</h4>
          <a href={c.portalUrl} target="_blank" rel="noopener noreferrer" className="sq-footer-link">
            Official Portal
          </a>
          <a href={`mailto:${c.supportEmail}`} className="sq-footer-link">
            {c.supportEmail}
          </a>
          {c.supportPhone && (
            <a href={`tel:${c.supportPhone.replace(/\s+/g, '')}`} className="sq-footer-link">
              {c.supportPhone}
            </a>
          )}
        </div>

        {/* Column 3: Legal */}
        <div className="sq-footer-col">
          <h4 className="sq-footer-title">Legal</h4>
          <Link href="/#" className="sq-footer-link">Privacy Policy</Link>
          <Link href="/#" className="sq-footer-link">Terms of Service</Link>
          <Link href="/#" className="sq-footer-link">Cookie Policy</Link>
        </div>
      </div>

      <hr className="sq-footer-divider" />

      <div className="sq-footer-bottom">
        <div className="sq-footer-branding-info">
          <span className="sq-footer-brand-title">SmartQueue</span>
          <p className="sq-footer-text">
            Virtual Queue Management System for Educational Institutions
          </p>
          <p className="sq-footer-text" style={{ marginTop: 4, fontSize: 11 }}>
            © {new Date().getFullYear()} SmartQueue. All rights reserved.
          </p>
        </div>

        <div className="sq-footer-developed">
          <p className="sq-footer-developed-text">
            Developed by the Department of Computer Applications (BCA)
          </p>
        </div>
      </div>
    </footer>
  );
}
