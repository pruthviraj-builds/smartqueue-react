'use client';

import Link from 'next/link';
import { LayoutGrid, Users, BarChart3, Settings, Crown, LogOut } from 'lucide-react';

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardSidebarProps {
  role: 'admin' | 'staff';
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  onLogout: () => void;
}

const ADMIN_ITEMS: SidebarItem[] = [
  { key: 'overview', label: 'Queue Management', icon: <LayoutGrid size={18} /> },
  { key: 'manage', label: 'Staff Management', icon: <Users size={18} /> },
  { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

const STAFF_ITEMS: SidebarItem[] = [
  { key: 'assigned', label: 'Assigned Queues', icon: <LayoutGrid size={18} /> },
  { key: 'controls', label: 'Queue Controls', icon: <Settings size={18} /> },
];

export function DashboardSidebar({ role, activeTab, onTabChange, userName, onLogout }: DashboardSidebarProps) {
  const items = role === 'admin' ? ADMIN_ITEMS : STAFF_ITEMS;
  const logoMark = role === 'admin' ? <Crown size={18} /> : <Settings size={18} />;
  const panelName = role === 'admin' ? 'Admin Panel' : 'Staff Panel';
  const panelSub = role === 'admin' ? 'SmartQueue Analytics' : 'SmartQueue Management';

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
      background: 'var(--bg-card)', borderRight: '1px solid var(--border-s)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '20px 20px', textDecoration: 'none',
        borderBottom: '1px solid var(--border-s)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--text)', color: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {logoMark}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{panelName}</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {panelSub}
          </div>
        </div>
      </Link>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'var(--text-dim)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '0 12px', marginBottom: 8,
        }}>
          Main Navigation
        </div>
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                fontSize: 13, fontWeight: 500,
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-sub)',
                border: 'none', cursor: 'pointer',
                textAlign: 'left', transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: 16, borderTop: '1px solid var(--border-s)' }}>
        {userName && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 10,
            background: 'var(--bg)', marginBottom: 8,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34c759', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </span>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '10px 12px', borderRadius: 10,
            fontSize: 13, fontWeight: 500, color: 'var(--text-sub)',
            background: 'transparent', border: '1px solid var(--border-s)',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}