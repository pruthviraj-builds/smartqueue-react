import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export function EmptyState({
  icon = '📂',
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  style
}: EmptyStateProps) {
  return (
    <div 
      className="sq-card sq-fade-in" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        padding: '40px 28px', 
        justifyContent: 'center',
        margin: '20px auto',
        maxWidth: 500,
        gap: 12,
        ...style 
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5, margin: 0, maxWidth: 360 }}>
        {description}
      </p>
      
      {actionHref && actionLabel && (
        <Link href={actionHref} className="sq-btn sq-btn-primary" style={{ padding: '8px 20px', fontSize: 12, marginTop: 8 }}>
          {actionLabel}
        </Link>
      )}
      
      {!actionHref && onAction && actionLabel && (
        <button onClick={onAction} className="sq-btn sq-btn-primary" style={{ padding: '8px 20px', fontSize: 12, marginTop: 8 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
