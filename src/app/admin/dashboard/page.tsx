'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar } from '@/components/layout/Navbar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouter } from 'next/navigation';
import { collection, onSnapshot, query, where, getDocs, collectionGroup, orderBy, limit } from 'firebase/firestore';
import {
  getUserDoc,
  createQueue,
  deleteQueue,
  updateQueueStatus,
  assignStaffToQueue,
  removeStaffAssignment,
  resetQueue,
} from '@/lib/firebase-helpers';

interface QueueData {
  id: string;
  deptName: string;
  currentCounter: number;
  lastToken: number;
  waitingCount: number;
  isActive: boolean;
  assignedStaff: string;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
}

interface AnalyticsData {
  totalIssued: number;
  totalCompleted: number;
  totalWaiting: number;
  avgWaitTime: number;
  avgServiceTime: number;
}

interface QueueStat {
  queueId: string;
  deptName: string;
  tokensIssued: number;
  tokensCompleted: number;
  tokensWaiting: number;
  avgWaitTime: number;
  avgServiceTime: number;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  operatorId: string;
  operatorName: string;
  timestamp?: Date;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Form states
  const [newQueueId, setNewQueueId] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newStaffId, setNewStaffId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Tab State: 'overview' (Queues), 'manage' (Staff), 'analytics' (Analytics)
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'analytics'>('overview');

  // Date filter states
  type DateFilter = 'today' | 'yesterday' | 'week' | 'custom';
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Log view tab state
  type LogView = 'system' | 'student';
  const [logView, setLogView] = useState<LogView>('system');
  
  // Search & Tooltips
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredBar, setHoveredBar] = useState<{
    label: string;
    value: string;
    extra?: string;
    x: number;
    y: number;
  } | null>(null);

  // Analytics states
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalIssued: 0,
    totalCompleted: 0,
    totalWaiting: 0,
    avgWaitTime: 0,
    avgServiceTime: 0,
  });
  const [queueStats, setQueueStats] = useState<QueueStat[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const exportToCSV = () => {
    // Columns: Department Name, Tokens Issued, Tokens Completed, Avg Wait Time (mins), Avg Service Time (mins)
    const headers = ['Department Name', 'Tokens Issued', 'Tokens Completed', 'Avg Wait Time (mins)', 'Avg Service Time (mins)'];
    const rows = queueStats.map(stat => [
      `"${stat.deptName.replace(/"/g, '""')}"`,
      stat.tokensIssued,
      stat.tokensCompleted,
      stat.avgWaitTime.toFixed(1),
      stat.avgServiceTime.toFixed(1)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smartqueue_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auth + Realtime listeners for Queues, Staff, Tokens and Logs
  useEffect(() => {
    let unsubQueues: (() => void) | null = null;
    let unsubStaff: (() => void) | null = null;
    let unsubTokens: (() => void) | null = null;
    let unsubLogs: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      
      try {
        const data = await getUserDoc(user.uid);
        if (!data || data.role !== 'admin') {
          await signOut(auth);
          router.push('/admin/login');
          return;
        }
        setAdminName(data.name as string);

        // Realtime listener for queues
        setLoading(true);
        setDbError(null);
        unsubQueues = onSnapshot(collection(db, 'queues'), (snap) => {
          const results = snap.docs.map((doc) => {
            const q = doc.data();
            return {
              id: doc.id,
              deptName: (q.deptName as string) ?? doc.id,
              currentCounter: (q.currentCounter as number) ?? 0,
              lastToken: (q.lastToken as number) ?? 0,
              waitingCount: (q.waitingCount as number) ?? 0,
              isActive: q.isActive !== false,
              assignedStaff: (q.assignedStaff as string) ?? '',
            };
          });
          setQueues(results);
          setLoading(false);
        }, (err) => {
          console.error('Failed to load queues:', err);
          setDbError('Failed to load queue configurations. Please verify connectivity.');
          setLoading(false);
        });

        // Realtime listener for staff directory
        unsubStaff = onSnapshot(query(collection(db, 'users'), where('role', '==', 'staff')), (snap) => {
          const staff = snap.docs.map((d) => {
            const u = d.data();
            return {
              id: d.id,
              name: (u.name as string) || 'Staff User',
              email: (u.email as string) || '',
            };
          });
          setStaffList(staff);
        });

        // Realtime listener for activity logs
        unsubLogs = onSnapshot(
          query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'), limit(100)),
          (snap) => {
            const logs = snap.docs.map((d) => {
              const u = d.data();
              return {
                id: d.id,
                action: (u.action as string) || '',
                details: (u.details as string) || '',
                operatorId: (u.operatorId as string) || '',
                operatorName: (u.operatorName as string) || '',
                timestamp: u.timestamp?.toDate() as Date | undefined,
              };
            });
            setActivityLogs(logs);
          }
        );

        // Realtime listener for tokens across all queues (collectionGroup)
        unsubTokens = onSnapshot(collectionGroup(db, 'tokens'), (snap) => {
          const totalIssued = snap.size;
          let totalCompleted = 0;
          let totalWaiting = 0;
          let totalWaitTime = 0;
          let totalServiceTime = 0;
          let completedWithWait = 0;
          let completedWithService = 0;

          // Queue wise accumulator
          const qAccumulator: {
            [queueId: string]: {
              issued: number;
              completed: number;
              waiting: number;
              totalSvc: number;
              svcCount: number;
              totalWait: number;
              waitCount: number;
            };
          } = {};

          snap.docs.forEach((tDoc) => {
            const t = tDoc.data();

            // Only count today's tokens
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const tokenDate = t.timestamp?.toDate?.();
            const isToday = tokenDate && tokenDate >= todayStart;
            if (!isToday) return; // skip tokens not from today

            // Find parent queue ID
            const queueId = tDoc.ref.parent.parent?.id || '';

            if (queueId) {
              if (!qAccumulator[queueId]) {
                qAccumulator[queueId] = { issued: 0, completed: 0, waiting: 0, totalSvc: 0, svcCount: 0, totalWait: 0, waitCount: 0 };
              }
              qAccumulator[queueId].issued++;
            }

            if (t.status === 'complete') {
              totalCompleted++;
              if (queueId) qAccumulator[queueId].completed++;
            } else if (t.status === 'waiting') {
              totalWaiting++;
              if (queueId) qAccumulator[queueId].waiting++;
            } else if (t.status === 'called') {
              if (queueId) qAccumulator[queueId].waiting++; // count currently called as still active on list
            }

            if (t.calledAt && t.timestamp) {
              const waitMs = t.calledAt.toDate().getTime() - t.timestamp.toDate().getTime();
              totalWaitTime += waitMs;
              completedWithWait++;
              if (queueId) {
                qAccumulator[queueId].totalWait += waitMs;
                qAccumulator[queueId].waitCount++;
              }
            }

            let svcMs = 0;
            if (t.serviceDuration !== undefined && t.serviceDuration !== null) {
              svcMs = t.serviceDuration * 1000;
            } else if (t.completedAt && t.calledAt) {
              svcMs = t.completedAt.toDate().getTime() - t.calledAt.toDate().getTime();
            }

            if (svcMs > 0) {
              totalServiceTime += svcMs;
              completedWithService++;
              if (queueId) {
                qAccumulator[queueId].totalSvc += svcMs;
                qAccumulator[queueId].svcCount++;
              }
            }
          });

          // Set live overall analytics
          setAnalytics({
            totalIssued,
            totalCompleted,
            totalWaiting,
            avgWaitTime: completedWithWait > 0 ? (totalWaitTime / completedWithWait) / 60000 : 0,
            avgServiceTime: completedWithService > 0 ? (totalServiceTime / completedWithService) / 60000 : 0,
          });

          // Calculate stats per queue dynamically mapping with current queues list
          onSnapshot(collection(db, 'queues'), (qSnap) => {
            const stats = qSnap.docs.map((qd) => {
              const qData = qd.data();
              const accum = qAccumulator[qd.id] || { issued: 0, completed: 0, waiting: 0, totalSvc: 0, svcCount: 0, totalWait: 0, waitCount: 0 };
              return {
                queueId: qd.id,
                deptName: (qData.deptName as string) || qd.id,
                tokensIssued: accum.issued,
                tokensCompleted: accum.completed,
                tokensWaiting: accum.waiting,
                avgWaitTime: accum.waitCount > 0 ? (accum.totalWait / accum.waitCount) / 60000 : 0,
                avgServiceTime: accum.svcCount > 0 ? (accum.totalSvc / accum.svcCount) / 60000 : 0,
              };
            });
            setQueueStats(stats);
          });
        });
      } catch (err) {
        console.error('Admin initialization failed:', err);
        setDbError('Failed to initialize administrator session.');
      }
    });

    return () => {
      unsubAuth();
      unsubQueues?.();
      unsubStaff?.();
      unsubTokens?.();
      unsubLogs?.();
    };
  }, [router]);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const slug = newQueueId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!slug) {
      setError('Please enter a valid Queue ID.');
      return;
    }
    if (!newDeptName.trim()) {
      setError('Please enter a department name.');
      return;
    }

    if (queues.some(q => q.id === slug)) {
      setError(`A queue with ID "${slug}" already exists.`);
      return;
    }

    try {
      await createQueue(slug, newDeptName.trim(), newStaffId);
      setNewQueueId('');
      setNewDeptName('');
      setNewStaffId('');
      setSuccess(`Queue "${newDeptName}" created successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to create queue. Try again.');
    }
  };

  const handleDeleteQueue = async (id: string, name: string) => {
    // SAFEGUARD: Prevent deleting if active tokens exist in subcollection
    const activeTokensSnap = await getDocs(
      query(
        collection(db, 'queues', id, 'tokens'),
        where('status', 'in', ['waiting', 'called'])
      )
    );

    if (!activeTokensSnap.empty) {
      alert(`⚠️ Cannot delete queue "${name}" because there are active/called students waiting in the queue. Please mark them complete or reset the queue first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete the queue "${name}"? This deletes all completed tokens.`)) return;
    try {
      await deleteQueue(id);
    } catch {
      alert('Failed to delete queue.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateQueueStatus(id, !currentStatus);
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleReset = async (id: string, name: string) => {
    if (!confirm(`⚠️ Reset queue "${name}" for today? This sets counters to 0 and deletes all current tokens.`)) return;
    try {
      await resetQueue(id);
      alert('✓ Queue reset successfully.');
    } catch {
      alert('Failed to reset queue.');
    }
  };

  // Staff Assignment Manager: handles single-queue unique assignments
  const handleAssignStaff = async (staffId: string, targetQueueId: string) => {
    try {
      // 1. Find if this staff is already assigned to another queue, and remove them
      const prevQueue = queues.find(q => q.assignedStaff === staffId);
      if (prevQueue) {
        await removeStaffAssignment(prevQueue.id);
      }

      // 2. Assign to new queue (if not unassigning)
      if (targetQueueId) {
        await assignStaffToQueue(targetQueueId, staffId);
      }
    } catch {
      alert('Failed to update staff queue assignment.');
    }
  };

  const handleRemoveStaffAssignment = async (queueId: string) => {
    try {
      await removeStaffAssignment(queueId);
    } catch {
      alert('Failed to remove staff assignment.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  // Directory filter logic
  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SVG Chart data configurations
  const maxIssued = Math.max(...queueStats.map(s => s.tokensIssued), 1);
  const maxSvcTime = Math.max(...queueStats.map(stat => stat.avgServiceTime), 5);
  const tokensIssuedChartHeight = Math.max(queueStats.length * 55 + 50, 150);

  // Date range filter helper
  function getDateRange(filter: DateFilter, cStart: string, cEnd: string): { start: Date; end: Date } {
    const now = new Date();
    const startOfDay = (d: Date) => { d.setHours(0,0,0,0); return d; };
    const endOfDay = (d: Date) => { d.setHours(23,59,59,999); return d; };

    if (filter === 'today') {
      return { start: startOfDay(new Date()), end: endOfDay(new Date()) };
    }
    if (filter === 'yesterday') {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { start: startOfDay(y), end: endOfDay(new Date(y)) };
    }
    if (filter === 'week') {
      const w = new Date(now); w.setDate(w.getDate() - 7);
      return { start: startOfDay(w), end: endOfDay(new Date()) };
    }
    if (filter === 'custom' && cStart && cEnd) {
      return { start: startOfDay(new Date(cStart)), end: endOfDay(new Date(cEnd)) };
    }
    return { start: startOfDay(new Date()), end: endOfDay(new Date()) };
  }

  // Filtered activity logs by date range
  const { start, end } = getDateRange(dateFilter, customStart, customEnd);
  const filteredLogs = activityLogs.filter(log => {
    if (!log.timestamp) return false;
    return log.timestamp >= start && log.timestamp <= end;
  });

  const SYSTEM_ACTIONS = [
    'QUEUE_OPENED',
    'QUEUE_CLOSED',
    'QUEUE_RESET',
    'QUEUE_CREATED',
    'QUEUE_DELETED',
    'TOKEN_CALLED',
    'TOKEN_COMPLETED',
    'STAFF_ASSIGNED',
    'STAFF_UNASSIGNED',
  ];

  const STUDENT_ACTIONS = [
    'TOKEN_CANCELLED',
    'TOKEN_JOINED',
  ];

  const viewFilteredLogs = filteredLogs.filter(log => {
    if (logView === 'system') return SYSTEM_ACTIONS.includes(log.action);
    if (logView === 'student') return STUDENT_ACTIONS.includes(log.action);
    return true;
  });

  // Aggregates
  const activeCount = queues.filter(q => q.isActive).length;
  const totalWaiting = queues.reduce((acc, q) => acc + q.waitingCount, 0);

  return (
    <>
      <Navbar 
        portal="admin" 
        userName={adminName} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab as 'overview' | 'manage' | 'analytics')} 
      />

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Header */}
        <div className="sq-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
            Administrator Panel
          </p>
          {activeTab === 'overview' && (
            <>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                Queue Management View
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Manage departments, queue status, and staff assignments.
              </p>
            </>
          )}
          {activeTab === 'manage' && (
            <>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                Staff Management View
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Manage staff assignments and department access.
              </p>
            </>
          )}
          {activeTab === 'analytics' && (
            <>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                Analytics View
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-sub)' }}>
                Monitor queue performance and operational metrics.
              </p>
            </>
          )}
        </div>

        {dbError && (
          <ErrorState message={dbError} onRetry={() => window.location.reload()} />
        )}

        {!dbError && loading && (
          <LoadingState type="list" count={3} />
        )}

        {!dbError && !loading && (
          <>
            {/* Dynamic Tooltip */}
            {hoveredBar && (
              <div style={{
                position: 'absolute',
                left: hoveredBar.x + 15,
                top: hoveredBar.y - 45,
                background: 'var(--bg-card)',
                color: 'var(--text)',
                padding: '8px 14px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 500,
                pointerEvents: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)',
                zIndex: 100,
                transition: 'transform 0.08s ease-out',
                transform: 'scale(1)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{hoveredBar.label}</div>
                <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{hoveredBar.value}</div>
                {hoveredBar.extra && (
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 4, borderTop: '1px solid var(--border-s)', paddingTop: 4 }}>
                    {hoveredBar.extra}
                  </div>
                )}
              </div>
            )}

            {/* 1. Queue Management Tab (Overview) */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Create Queue Form */}
                <div className="sq-card sq-fade-in">
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
                    Create New Queue
                  </h3>
                  
                  <form onSubmit={handleCreateQueue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div>
                        <label className="sq-label">Queue ID (Slug, e.g. fees_counter)</label>
                        <input 
                          type="text" 
                          placeholder="fees_counter"
                          className="sq-input"
                          value={newQueueId}
                          onChange={(e) => setNewQueueId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="sq-label">Department Display Name</label>
                        <input 
                          type="text" 
                          placeholder="Fees Counter"
                          className="sq-input"
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="sq-label">Assign Staff Member</label>
                        <select 
                          className="sq-input sq-select"
                          value={newStaffId}
                          onChange={(e) => setNewStaffId(e.target.value)}
                        >
                          <option value="">-- Leave Unassigned --</option>
                          {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {error && <div className="sq-alert sq-alert-error show">{error}</div>}
                    {success && <div className="sq-alert sq-alert-success show">{success}</div>}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="sq-btn sq-btn-primary">
                        Create Queue
                      </button>
                    </div>
                  </form>
                </div>

                {/* List & Manage Queues */}
                <div className="sq-card sq-fade-in" style={{ animationDelay: '0.05s' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 18 }}>
                    Departments Directory
                  </h3>

                  {queues.length === 0 ? (
                    <EmptyState
                      icon="🏢"
                      title="No department queues"
                      description="No department queues have been created yet. Use the creation form above to add a department."
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {queues.map(q => {
                        const staff = staffList.find(s => s.id === q.assignedStaff);
                        return (
                          <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 18, border: '1px solid var(--border-s)', borderRadius: 16, background: 'var(--bg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                                    {q.deptName}
                                  </h4>
                                  <code style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-sub)' }}>
                                    {q.id}
                                  </code>
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4 }}>
                                  Current: <strong>#{q.currentCounter}</strong> · Last Issued: <strong>#{q.lastToken}</strong> · Waiting: <strong>{q.waitingCount}</strong>
                                </p>
                              </div>
                              
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button 
                                  onClick={() => handleToggleStatus(q.id, q.isActive)}
                                  className={`sq-btn sq-btn-sm ${q.isActive ? 'sq-btn-ghost' : 'sq-btn-primary'}`}
                                  style={{ height: 32, fontSize: 12 }}
                                >
                                  {q.isActive ? '🚫 Close' : '⚡ Open'}
                                </button>
                                <button 
                                  onClick={() => handleReset(q.id, q.deptName)}
                                  className="sq-btn sq-btn-sm sq-btn-ghost"
                                  style={{ height: 32, fontSize: 12, color: '#ff9f0a', borderColor: 'rgba(255,159,10,0.2)' }}
                                >
                                  🔄 Reset
                                </button>
                                <button 
                                  onClick={() => handleDeleteQueue(q.id, q.deptName)}
                                  className="sq-btn sq-btn-sm sq-btn-danger"
                                  style={{ height: 32, fontSize: 12 }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-s)', paddingTop: 10, marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`sq-badge ${q.isActive ? 'sq-badge-called' : 'sq-badge-done'}`} style={{ fontSize: 11 }}>
                                  {q.isActive ? 'Active & Open' : 'Offline / Closed'}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                                  Staff Assigned: <strong>{staff ? staff.name : 'None'}</strong>
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <select 
                                  className="sq-input sq-select"
                                  style={{ width: 170, padding: '4px 10px', fontSize: 11, borderRadius: 8, height: 28 }}
                                  value={q.assignedStaff}
                                  onChange={(e) => handleAssignStaff(e.target.value, q.id)}
                                >
                                  <option value="">-- Assign Staff --</option>
                                  {staffList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                                {q.assignedStaff && (
                                  <button 
                                    onClick={() => handleRemoveStaffAssignment(q.id)}
                                    className="sq-btn sq-btn-ghost"
                                    style={{ height: 28, padding: '0 8px', fontSize: 11, borderRadius: 8 }}
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Staff Management Tab */}
            {activeTab === 'manage' && (
              <div className="sq-card sq-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                    Staff Member Directory
                  </h3>
                  <input 
                    type="text" 
                    placeholder="🔍 Search staff by name or email..."
                    className="sq-input"
                    style={{ maxWidth: 300, height: 36, fontSize: 13, borderRadius: 10 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {filteredStaff.length === 0 ? (
                  <EmptyState
                    icon="👥"
                    title={searchQuery ? "No matching staff" : "No staff members"}
                    description={searchQuery ? "No staff members matched your search criteria." : "No staff members have been registered in the system."}
                  />
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-sub)' }}>
                          <th style={{ padding: '12px 8px', fontWeight: 600 }}>Staff Name</th>
                          <th style={{ padding: '12px 8px', fontWeight: 600 }}>Email Address</th>
                          <th style={{ padding: '12px 8px', fontWeight: 600 }}>Assigned Department Queue</th>
                          <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStaff.map(s => {
                          const assignedQ = queues.find(q => q.assignedStaff === s.id);
                          return (
                            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-s)' }}>
                              <td style={{ padding: '14px 8px', fontWeight: 600, color: 'var(--text)' }}>
                                {s.name}
                              </td>
                              <td style={{ padding: '14px 8px', color: 'var(--text-sub)' }}>
                                {s.email}
                              </td>
                              <td style={{ padding: '14px 8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <select 
                                    className="sq-input sq-select"
                                    style={{ width: 180, padding: '4px 10px', fontSize: 12, borderRadius: 8, height: 30 }}
                                    value={assignedQ ? assignedQ.id : ''}
                                    onChange={(e) => handleAssignStaff(s.id, e.target.value)}
                                  >
                                    <option value="">-- Idle / Unassigned --</option>
                                    {queues.map(q => (
                                      <option key={q.id} value={q.id}>{q.deptName}</option>
                                    ))}
                                  </select>
                                  {assignedQ && (
                                    <button 
                                      onClick={() => handleRemoveStaffAssignment(assignedQ.id)}
                                      style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}
                                    >
                                      Unassign
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '14px 8px' }}>
                                <span className={`sq-badge ${assignedQ ? 'sq-badge-called' : 'sq-badge-done'}`} style={{ fontSize: 11 }}>
                                  {assignedQ ? 'Assigned' : 'Idle'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. Analytics Tab */}
            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* CSV Export Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={exportToCSV}
                    className="sq-btn sq-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                  >
                    📥 Export CSV Report
                  </button>
                </div>

                {/* KPI Cards Grid */}
                <div className="sq-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div className="sq-card" style={{ padding: 18, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🏢</div>
                    <div className="sq-stat-label">Active Queues</div>
                    <div className="sq-stat-value" style={{ fontSize: 28, margin: '4px 0' }}>{activeCount}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Accepting students</div>
                  </div>
                  <div className="sq-card" style={{ padding: 18, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>👥</div>
                    <div className="sq-stat-label">Waiting Students</div>
                    <div className="sq-stat-value" style={{ fontSize: 28, margin: '4px 0' }}>{totalWaiting}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Across departments</div>
                  </div>
                  <div className="sq-card" style={{ padding: 18, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                    <div className="sq-stat-label">Served Today</div>
                    <div className="sq-stat-value" style={{ fontSize: 28, margin: '4px 0' }}>{analytics.totalCompleted}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Completed session tokens</div>
                  </div>
                  <div className="sq-card" style={{ padding: 18, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>⏱️</div>
                    <div className="sq-stat-label">Avg Service Time</div>
                    <div className="sq-stat-value" style={{ fontSize: 28, margin: '4px 0', color: 'var(--accent)' }}>
                      {analytics.avgServiceTime.toFixed(1)}m
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Minutes per session</div>
                  </div>
                </div>

                {/* SVG Visual Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                  
                  {/* Chart 1: Tokens Issued Per Queue */}
                  <div className="sq-card sq-fade-in" style={{ animationDelay: '0.05s', position: 'relative' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
                      Tokens Issued Per Department (Today)
                    </h3>

                    {queueStats.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '50px 0', fontSize: 13 }}>
                        No queue traffic data available.
                      </p>
                    ) : (
                      <div style={{ width: '100%', overflow: 'hidden' }}>
                        <svg width="100%" height={tokensIssuedChartHeight} viewBox={`0 0 500 ${tokensIssuedChartHeight}`}>
                          <defs>
                            <linearGradient id="issuedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.75" />
                              <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
                            </linearGradient>
                          </defs>

                          {/* Grid guidelines */}
                          <line x1="130" y1="20" x2="130" y2={tokensIssuedChartHeight - 30} stroke="var(--border)" strokeWidth="1" strokeDasharray="3" />
                          <line x1="240" y1="20" x2="240" y2={tokensIssuedChartHeight - 30} stroke="var(--border)" strokeWidth="1" strokeDasharray="3" />
                          <line x1="350" y1="20" x2="350" y2={tokensIssuedChartHeight - 30} stroke="var(--border)" strokeWidth="1" strokeDasharray="3" />
                          <line x1="460" y1="20" x2="460" y2={tokensIssuedChartHeight - 30} stroke="var(--border)" strokeWidth="1" strokeDasharray="3" />

                          {queueStats.map((stat, i) => {
                            const y = i * 55 + 25;
                            const barWidth = maxIssued > 0 ? (stat.tokensIssued / maxIssued) * 310 : 0;

                            return (
                              <g key={stat.queueId} style={{ cursor: 'pointer' }}>
                                {/* Label */}
                                <text 
                                  x="10" 
                                  y={y + 16} 
                                  fill="var(--text-sub)" 
                                  fontSize="11" 
                                  fontWeight="600"
                                  textAnchor="start"
                                  width="110"
                                >
                                  {stat.deptName.length > 15 ? `${stat.deptName.slice(0, 14)}…` : stat.deptName}
                                </text>

                                {/* Bar background track */}
                                <rect 
                                  x="130" 
                                  y={y} 
                                  width="320" 
                                  height="24" 
                                  rx="6" 
                                  fill="var(--bg)" 
                                />

                                {/* Active Bar */}
                                <rect 
                                  x="130" 
                                  y={y} 
                                  width={Math.max(barWidth, 4)} 
                                  height="24" 
                                  rx="6" 
                                  fill="url(#issuedGrad)"
                                  onMouseMove={(e) => {
                                    const rect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                    if (rect) {
                                      setHoveredBar({
                                        label: stat.deptName,
                                        value: `${stat.tokensIssued} Tokens Issued`,
                                        extra: `Completed: ${stat.tokensCompleted} · Waiting: ${stat.tokensWaiting}`,
                                        x: e.clientX - rect.left,
                                        y: e.clientY - rect.top,
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => setHoveredBar(null)}
                                  style={{ transition: 'width 0.5s ease-out' }}
                                />

                                {/* Value label */}
                                <text 
                                  x={130 + Math.max(barWidth, 4) + 8} 
                                  y={y + 16} 
                                  fill="var(--text)" 
                                  fontSize="11" 
                                  fontWeight="700"
                                >
                                  {stat.tokensIssued}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Average Service Duration */}
                  <div className="sq-card sq-fade-in" style={{ animationDelay: '0.1s', position: 'relative' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
                      Average Service Speed (Minutes)
                    </h3>

                    {queueStats.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '50px 0', fontSize: 13 }}>
                        No service duration data available.
                      </p>
                    ) : (
                      <div style={{ width: '100%', overflow: 'hidden' }}>
                        <svg width="100%" height="240" viewBox="0 0 500 240">
                          <defs>
                            <linearGradient id="svcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ff9f0a" />
                              <stop offset="100%" stopColor="#ff5e3a" />
                            </linearGradient>
                          </defs>

                          {/* Guidelines */}
                          <line x1="50" y1="30" x2="470" y2="30" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1="50" y1="80" x2="470" y2="80" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1="50" y1="130" x2="470" y2="130" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
                          <line x1="50" y1="180" x2="470" y2="180" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />

                          {/* X and Y Axis */}
                          <line x1="50" y1="180" x2="470" y2="180" stroke="var(--border)" strokeWidth="1.5" />
                          <line x1="50" y1="30" x2="50" y2="180" stroke="var(--border)" strokeWidth="1" />

                          {/* Ticks on Y-axis */}
                          <text x="40" y="34" fill="var(--text-dim)" fontSize="10" textAnchor="end">{maxSvcTime.toFixed(0)}m</text>
                          <text x="40" y="109" fill="var(--text-dim)" fontSize="10" textAnchor="end">{(maxSvcTime / 2).toFixed(0)}m</text>
                          <text x="40" y="184" fill="var(--text-dim)" fontSize="10" textAnchor="end">0m</text>

                          {/* Bars */}
                          {queueStats.map((stat, i) => {
                            const count = queueStats.length;
                            const availableWidth = 400;
                            const barWidth = Math.min(45, (availableWidth / count) - 16);
                            const gap = (availableWidth / count);
                            const x = 70 + i * gap;

                            const barHeight = maxSvcTime > 0 ? (stat.avgServiceTime / maxSvcTime) * 150 : 0;
                            const y = 180 - barHeight;

                            return (
                              <g key={stat.queueId} style={{ cursor: 'pointer' }}>
                                {/* Animated SVG Rect */}
                                <rect 
                                  x={x} 
                                  y={y} 
                                  width={barWidth} 
                                  height={Math.max(barHeight, 2)} 
                                  rx="5" 
                                  fill="url(#svcGrad)"
                                  onMouseMove={(e) => {
                                    const rect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                                    if (rect) {
                                      setHoveredBar({
                                        label: stat.deptName,
                                        value: `Avg Service Speed: ${stat.avgServiceTime.toFixed(1)} mins`,
                                        extra: `Based on completed tokens today`,
                                        x: e.clientX - rect.left,
                                        y: e.clientY - rect.top,
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => setHoveredBar(null)}
                                  style={{ transition: 'height 0.4s ease-out, y 0.4s ease-out' }}
                                />

                                {/* Value on top of bar */}
                                {stat.avgServiceTime > 0 && (
                                  <text 
                                    x={x + barWidth / 2} 
                                    y={y - 6} 
                                    fill="var(--text)" 
                                    fontSize="9" 
                                    fontWeight="700" 
                                    textAnchor="middle"
                                  >
                                    {stat.avgServiceTime.toFixed(1)}m
                                  </text>
                                )}

                                {/* Dept Name under X axis */}
                                <text 
                                  x={x + barWidth / 2} 
                                  y="198" 
                                  fill="var(--text-sub)" 
                                  fontSize="9" 
                                  fontWeight="600" 
                                  textAnchor="middle"
                                >
                                  {stat.deptName.length > 8 ? `${stat.deptName.slice(0, 7)}…` : stat.deptName}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}
                  </div>

                </div>

                {/* Realtime Activity Logs Table */}
                <div className="sq-card sq-fade-in" style={{ animationDelay: '0.15s' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>

                    {/* Row 1 — Title + View Tabs */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                        Activity Log
                      </h3>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setLogView('system')}
                          className={`sq-btn sq-btn-sm ${logView === 'system' ? 'sq-btn-primary' : 'sq-btn-ghost'}`}
                          style={{ fontSize: 11, height: 28, padding: '0 12px' }}
                        >
                          ⚙️ Staff & Admin
                        </button>
                        <button
                          onClick={() => setLogView('student')}
                          className={`sq-btn sq-btn-sm ${logView === 'student' ? 'sq-btn-primary' : 'sq-btn-ghost'}`}
                          style={{ fontSize: 11, height: 28, padding: '0 12px' }}
                        >
                          🎓 Student
                        </button>
                      </div>
                    </div>

                    {/* Row 2 — Date Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {(['today', 'yesterday', 'week', 'custom'] as DateFilter[]).map(f => (
                        <button
                          key={f}
                          onClick={() => setDateFilter(f)}
                          className={`sq-btn sq-btn-sm ${dateFilter === f ? 'sq-btn-primary' : 'sq-btn-ghost'}`}
                          style={{ fontSize: 11, height: 28, padding: '0 10px', textTransform: 'capitalize' }}
                        >
                          {f === 'today' ? 'Today' : f === 'yesterday' ? 'Yesterday' : f === 'week' ? 'Last 7 Days' : 'Custom'}
                        </button>
                      ))}
                      {dateFilter === 'custom' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="date"
                            className="sq-input"
                            style={{ height: 28, fontSize: 11, padding: '0 8px', borderRadius: 8 }}
                            value={customStart}
                            onChange={e => setCustomStart(e.target.value)}
                          />
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>to</span>
                          <input
                            type="date"
                            className="sq-input"
                            style={{ height: 28, fontSize: 11, padding: '0 8px', borderRadius: 8 }}
                            value={customEnd}
                            onChange={e => setCustomEnd(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Log count */}
                    <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      Showing {viewFilteredLogs.length} {logView === 'system' ? 'staff/admin' : 'student'} events
                    </p>

                  </div>

                  {viewFilteredLogs.length === 0 ? (
                    <EmptyState
                      icon={logView === 'student' ? '🎓' : '📋'}
                      title={logView === 'student' ? 'No student activity' : 'No system activity'}
                      description={
                        logView === 'student'
                          ? 'No student actions (join/leave queue) recorded in this period.'
                          : 'No staff or admin actions recorded in this period.'
                      }
                      style={{ margin: 0, padding: '24px 16px' }}
                    />
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-sub)' }}>
                            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Timestamp</th>
                            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Action</th>
                            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Details</th>
                            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Operator</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewFilteredLogs.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border-s)' }}>
                              <td style={{ padding: '12px 8px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                                {log.timestamp 
                                  ? log.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) 
                                    + ' · ' 
                                    + log.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                                  : '...'}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span className={`sq-badge ${
                                  log.action.startsWith('QUEUE_') 
                                    ? 'sq-badge-waiting' 
                                    : log.action.startsWith('STAFF_') 
                                    ? 'sq-badge-called' 
                                    : 'sq-badge-done'
                                }`} style={{ fontSize: 10 }}>
                                  {log.action}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', color: 'var(--text-sub)' }}>
                                {log.details}
                              </td>
                              <td style={{ padding: '12px 8px', color: 'var(--text-dim)' }}>
                                {log.operatorName}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}