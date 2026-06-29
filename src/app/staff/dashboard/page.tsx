'use client';

import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar } from '@/components/layout/Navbar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  getUserDoc,
  callNextToken,
  markTokenComplete,
  resetQueue,
  updateQueueStatus,
} from '@/lib/firebase-helpers';

interface QueueMeta {
  id: string;
  deptName: string;
  isActive: boolean;
  currentCounter: number;
  lastToken: number;
  waitingCount: number;
}

interface WaitingToken {
  id: string;
  tokenNumber: number;
  studentName: string;
  status: string;
}

interface QueueState {
  deptName: string;
  isActive: boolean;
  currentCounter: number;
  lastToken: number;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'assigned' | 'controls'>('assigned');
  const [staffName, setStaffName] = useState('');
  const [queueOptions, setQueueOptions] = useState<QueueMeta[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [waitingList, setWaitingList] = useState<WaitingToken[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const unsubQueueRef = useRef<(() => void) | null>(null);
  const unsubTokensRef = useRef<(() => void) | null>(null);

  // Auth guard and live listener for assigned queues
  useEffect(() => {
    let unsubQueues: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/staff/login');
        return;
      }
      try {
        const data = await getUserDoc(user.uid);
        if (!data || data.role !== 'staff') {
          await signOut(auth);
          router.push('/staff/login');
          return;
        }
        setStaffName(data.name as string);

        unsubQueues = onSnapshot(
          query(collection(db, 'queues'), where('assignedStaff', '==', user.uid)),
          (snap) => {
            const opts: QueueMeta[] = snap.docs.map((d) => {
              const qData = d.data();
              return {
                id: d.id,
                deptName: (qData.deptName as string) ?? d.id,
                isActive: qData.isActive !== false,
                currentCounter: (qData.currentCounter as number) ?? 0,
                lastToken: (qData.lastToken as number) ?? 0,
                waitingCount: (qData.waitingCount as number) ?? 0,
              };
            });
            setQueueOptions(opts);
            setLoading(false);
          },
          (err) => {
            console.error('Failed to load assigned queues:', err);
            setError('Failed to load assigned queues. Please verify your connection.');
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to authenticate or load user profile:', err);
        setError('Unable to load staff profile. Please try again.');
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubQueues?.();
    };
  }, [router]);

  // When queue selection changes, start listeners
  const handleQueueSelect = (queueId: string) => {
    setSelectedQueueId(queueId);
    setQueueState(null);
    setWaitingList([]);
    setWaitingCount(0);

    // Cleanup old listeners
    unsubQueueRef.current?.();
    unsubTokensRef.current?.();

    if (!queueId) return;

    // Queue doc listener
    unsubQueueRef.current = onSnapshot(doc(db, 'queues', queueId), (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      setQueueState({
        deptName: d.deptName as string,
        isActive: d.isActive !== false,
        currentCounter: (d.currentCounter as number) ?? 0,
        lastToken: (d.lastToken as number) ?? 0,
      });
    });

    // Waiting tokens listener
    unsubTokensRef.current = onSnapshot(
      query(
        collection(db, 'queues', queueId, 'tokens'),
        where('status', '==', 'waiting'),
        orderBy('tokenNumber')
      ),
      (snap) => {
        setWaitingCount(snap.size);
        setWaitingList(
          snap.docs.map((d) => ({
            id: d.id,
            tokenNumber: d.data().tokenNumber as number,
            studentName: d.data().studentName as string,
            status: d.data().status as string,
          }))
        );
      }
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubQueueRef.current?.();
      unsubTokensRef.current?.();
    };
  }, []);

  const handleToggleQueue = async () => {
    if (!selectedQueueId || !queueState) return;
    const newStatus = !queueState.isActive;
    const label = newStatus ? 'open' : 'close';
    if (!confirm(`Are you sure you want to ${label} this queue?`)) return;
    await updateQueueStatus(selectedQueueId, newStatus);
  };

  const handleCallNext = async () => {
    if (!selectedQueueId) return;
    setLoadingAction('call');
    try {
      const res = await callNextToken(selectedQueueId);
      if (!res) {
        alert('No more students waiting.');
      }
    } catch {
      alert('Failed to call next. Try again.');
    }
    setLoadingAction(null);
  };

  const handleMarkComplete = async () => {
    if (!selectedQueueId || !queueState) return;
    setLoadingAction('complete');
    try {
      const current = queueState.currentCounter;
      if (current === 0) {
        alert('No student is currently being served.');
        setLoadingAction(null);
        return;
      }
      const tSnap = await getDocs(
        query(
          collection(db, 'queues', selectedQueueId, 'tokens'),
          where('tokenNumber', '==', current)
        )
      );
      if (tSnap.empty) {
        alert('Could not find the current token. Try again.');
        setLoadingAction(null);
        return;
      }
      const tDoc = tSnap.docs[0];
      const calledAt = tDoc.data().calledAt?.toDate() as Date | undefined;
      const completedAt = new Date();
      const serviceDuration = calledAt
        ? Math.round((completedAt.getTime() - calledAt.getTime()) / 1000)
        : null;
      await markTokenComplete(selectedQueueId, tDoc.id, serviceDuration);
    } catch {
      alert('Failed to mark complete. Try again.');
    }
    setLoadingAction(null);
  };

  const handleResetQueue = async () => {
    if (!selectedQueueId) return;
    if (
      !confirm(
        '⚠️ Reset queue for today?\n\nThis will set counters to 0 and delete all tokens. Cannot be undone.'
      )
    )
      return;
    setLoadingAction('reset');
    try {
      await resetQueue(selectedQueueId);
      alert('✓ Queue reset successfully.');
    } catch {
      alert('Reset failed. Try again.');
    }
    setLoadingAction(null);
  };

  const handleLogout = async () => {
    unsubQueueRef.current?.();
    unsubTokensRef.current?.();
    await signOut(auth);
    router.push('/staff/login');
  };

  const isActive = queueState?.isActive ?? true;

  return (
    <>
      <Navbar 
        portal="staff" 
        userName={staffName} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as 'assigned' | 'controls')} 
      />

      <div style={{
        maxWidth: 640, margin: '0 auto',
        padding: '40px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>

        {error && (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        )}

        {!error && loading && (
          <LoadingState type="list" count={2} />
        )}

        {!error && !loading && (
          <>
            {/* 1. Assigned Queues Tab */}
            {activeTab === 'assigned' && (
              <div className="sq-card sq-fade-in">
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 18 }}>
                  Your Assigned Queues
                </h3>
                {queueOptions.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No Assigned Queues"
                    description="You are not assigned to any department queues currently."
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {queueOptions.map((q) => (
                      <div 
                        key={q.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: 16, 
                          border: '1px solid var(--border-s)', 
                          borderRadius: 16, 
                          background: 'var(--bg)',
                          flexWrap: 'wrap',
                          gap: 12
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                            {q.deptName} <code style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-dim)' }}>({q.id})</code>
                          </h4>
                          <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`sq-badge ${q.isActive ? 'sq-badge-called' : 'sq-badge-done'}`}>
                              {q.isActive ? 'Open' : 'Closed'}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                              Now Serving: <strong>#{q.currentCounter}</strong>
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                              Waiting: <strong>{q.waitingCount}</strong>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleQueueSelect(q.id);
                            setActiveTab('controls');
                          }}
                          className="sq-btn sq-btn-primary sq-btn-sm"
                        >
                          Manage Queue
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Queue Controls Tab */}
            {activeTab === 'controls' && (
              <>
                {/* Queue selector */}
                <div className="sq-card sq-fade-in">
                  <label className="sq-label">Select Department Queue</label>
                  <select
                    value={selectedQueueId}
                    onChange={(e) => handleQueueSelect(e.target.value)}
                    className="sq-input sq-select"
                  >
                    <option value="">-- Select a Department --</option>
                    {queueOptions.map((q) => (
                      <option key={q.id} value={q.id}>{q.deptName}</option>
                    ))}
                  </select>
                </div>

                {/* Control panel — shown only when queue selected */}
                {selectedQueueId && queueState && (
                  <>
                    {/* Queue open/close toggle */}
                    <div className="sq-card sq-fade-in">
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px', borderRadius: 16,
                        border: '1px solid var(--border-s)', background: 'var(--bg)',
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                            Queue Status
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                            {isActive
                              ? 'Queue is open — students can join'
                              : 'Queue is closed — students cannot join'}
                          </div>
                        </div>
                        <button
                          onClick={handleToggleQueue}
                          style={{
                            width: 52, height: 28, borderRadius: 999,
                            border: 'none', cursor: 'pointer', position: 'relative',
                            background: isActive ? '#34c759' : '#aeaeb2',
                            transition: 'background 0.3s', flexShrink: 0,
                          }}
                          aria-label={isActive ? 'Close queue' : 'Open queue'}
                        >
                          <span style={{
                            position: 'absolute', top: 3,
                            left: isActive ? 'calc(100% - 25px)' : 3,
                            width: 22, height: 22, borderRadius: '50%',
                            background: 'white',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            transition: 'left 0.3s cubic-bezier(0.16,1,0.3,1)',
                            display: 'block',
                          }} />
                        </button>
                      </div>
                    </div>

                    {/* Live stats */}
                    <div className="sq-card sq-fade-in" style={{ animationDelay: '0.05s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <span className="sq-live-dot" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)' }}>
                          Live Queue Data ({queueState.deptName})
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div className="sq-stat">
                          <div className="sq-stat-label">Now Serving</div>
                          <div className="sq-stat-value" style={{ color: 'var(--accent)' }}>
                            {queueState.currentCounter}
                          </div>
                        </div>
                        <div className="sq-stat">
                          <div className="sq-stat-label">Waiting</div>
                          <div className="sq-stat-value">{waitingCount}</div>
                        </div>
                        <div className="sq-stat">
                          <div className="sq-stat-label">Total Issued</div>
                          <div className="sq-stat-value">{queueState.lastToken}</div>
                        </div>
                      </div>
                    </div>

                    {/* Closed notice */}
                    {!isActive && (
                      <div className="sq-fade-in" style={{
                        textAlign: 'center', padding: 20,
                        background: 'rgba(255,59,48,0.05)',
                        border: '1px solid rgba(255,59,48,0.15)',
                        borderRadius: 16,
                        color: '#ff3b30', fontSize: 13, fontWeight: 600,
                      }}>
                        🚫 Queue is closed — open it to enable actions.
                      </div>
                    )}

                    {/* Action buttons — only when queue is open */}
                    {isActive && (
                      <div className="sq-fade-in" style={{
                        display: 'flex', flexDirection: 'column', gap: 12,
                        animationDelay: '0.08s',
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <button
                            onClick={handleCallNext}
                            disabled={loadingAction !== null}
                            className="sq-btn sq-btn-primary sq-btn-lg"
                            style={{ opacity: loadingAction === 'call' ? 0.7 : 1 }}
                          >
                            {loadingAction === 'call' ? '…' : '➡️ Call Next'}
                          </button>
                          <button
                            onClick={handleMarkComplete}
                            disabled={loadingAction !== null}
                            className="sq-btn sq-btn-ghost sq-btn-lg"
                            style={{ opacity: loadingAction === 'complete' ? 0.7 : 1 }}
                          >
                            {loadingAction === 'complete' ? '…' : '✅ Mark Complete'}
                          </button>
                        </div>
                        <button
                          onClick={handleResetQueue}
                          disabled={loadingAction !== null}
                          className="sq-btn sq-btn-danger sq-btn-full"
                          style={{ padding: 12, opacity: loadingAction === 'reset' ? 0.7 : 1 }}
                        >
                          {loadingAction === 'reset' ? 'Resetting…' : '🔄 Reset Queue for Today'}
                        </button>
                      </div>
                    )}

                    {/* Waiting list */}
                    <div className="sq-card sq-fade-in" style={{ animationDelay: '0.12s' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 20,
                      }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                          Waiting List
                        </h3>
                        <span className="sq-badge" style={{
                          background: 'var(--bg)', border: '1px solid var(--border-s)',
                          color: 'var(--text-sub)',
                        }}>
                          {waitingCount} {waitingCount === 1 ? 'student' : 'students'}
                        </span>
                      </div>

                      {waitingList.length === 0 ? (
                        <EmptyState
                          icon="👥"
                          title="No students waiting"
                          description="There are no students currently waiting in the queue."
                          style={{ margin: 0, padding: '24px 16px' }}
                        />
                      ) : (
                        waitingList.map((t) => (
                          <div key={t.id} className="sq-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: 'var(--bg)', border: '1px solid var(--border-s)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 13, color: 'var(--text)',
                                flexShrink: 0,
                              }}>
                                {t.tokenNumber}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                  {t.studentName}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                                  Token #{t.tokenNumber}
                                </div>
                              </div>
                            </div>
                            <span className="sq-badge sq-badge-waiting">Waiting</span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {/* Placeholder when no queue selected */}
                {!selectedQueueId && (
                  <EmptyState
                    icon="⚙️"
                    title="Select a queue to get started"
                    description="Choose an assigned queue from the dropdown or the Assigned Queues tab to manage."
                  />
                )}
              </>
            )}
          </>
        )}

      </div>
    </>
  );
}