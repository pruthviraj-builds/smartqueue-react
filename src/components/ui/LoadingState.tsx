import React from 'react';

interface LoadingStateProps {
  type: 'card' | 'table' | 'list' | 'kpi';
  count?: number;
}

export function LoadingState({ type, count = 3 }: LoadingStateProps) {
  const items = Array.from({ length: count });

  if (type === 'kpi') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, width: '100%' }}>
        {items.map((_, i) => (
          <div key={i} className="sq-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 18 }}>
            <div className="sq-skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <div className="sq-skeleton" style={{ width: '60%', height: 12, borderRadius: 6 }} />
            <div className="sq-skeleton" style={{ width: '40%', height: 24, borderRadius: 8, margin: '4px 0' }} />
            <div className="sq-skeleton" style={{ width: '50%', height: 10, borderRadius: 5 }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="sq-card" style={{ width: '100%', padding: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Header Skeleton */}
          <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--border-s)', paddingBottom: 10 }}>
            <div className="sq-skeleton" style={{ flex: 1, height: 14, borderRadius: 6 }} />
            <div className="sq-skeleton" style={{ flex: 1, height: 14, borderRadius: 6 }} />
            <div className="sq-skeleton" style={{ flex: 1, height: 14, borderRadius: 6 }} />
          </div>
          {/* Rows Skeletons */}
          {items.map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-s)' }}>
              <div className="sq-skeleton" style={{ flex: 1, height: 12, borderRadius: 6 }} />
              <div className="sq-skeleton" style={{ flex: 1, height: 12, borderRadius: 6 }} />
              <div className="sq-skeleton" style={{ flex: 1, height: 12, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {items.map((_, i) => (
          <div key={i} className="sq-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
            <div className="sq-skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="sq-skeleton" style={{ width: '35%', height: 13, borderRadius: 6, marginBottom: 6 }} />
              <div className="sq-skeleton" style={{ width: '20%', height: 11, borderRadius: 5 }} />
            </div>
            <div className="sq-skeleton" style={{ width: 70, height: 32, borderRadius: 999, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    );
  }

  // Default 'card' skeletons
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, width: '100%' }}>
      {items.map((_, i) => (
        <div key={i} className="sq-card" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
          <div className="sq-skeleton" style={{ width: '30%', height: 11, borderRadius: 5 }} />
          <div className="sq-skeleton" style={{ width: '70%', height: 20, borderRadius: 10, margin: '4px 0' }} />
          <div className="sq-skeleton" style={{ width: '90%', height: 12, borderRadius: 6 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <div className="sq-skeleton" style={{ width: 60, height: 28, borderRadius: 999 }} />
            <div className="sq-skeleton" style={{ width: 80, height: 28, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
