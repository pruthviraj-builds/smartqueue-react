import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
  style?: React.CSSProperties;
}

export function ErrorState({ message, onRetry, actionLabel = 'Try Again', style }: ErrorStateProps) {
  return (
    <div 
      className="sq-card sq-fade-in" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center', 
        padding: '36px 24px', 
        borderColor: 'rgba(255, 59, 48, 0.15)',
        background: 'rgba(255, 59, 48, 0.02)',
        maxWidth: 500,
        margin: '20px auto',
        gap: 16,
        ...style 
      }}
    >
      <div style={{ fontSize: 36, color: '#ff3b30' }}>⚠️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
        An Error Occurred
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.5, margin: 0 }}>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="sq-btn sq-btn-danger" style={{ padding: '8px 20px', fontSize: 12 }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
