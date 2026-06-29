'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar } from '@/components/layout/Navbar';
import { joinQueue as joinQueueAction } from '@/lib/firebase-helpers';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

interface QueueData {
  id: string;
  deptName: string;
  isActive: boolean;
  currentCounter: number;
  lastToken: number;
  waiting: number;
  icon: string;
}

const QUEUE_ICONS: Record<string, string> = {
  fees_counter: '💰',
  admissions: '📋',
  scholarship: '🎓',
};

export default function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Online/offline
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Auth guard + load data and start live snapshot listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.uid);

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role !== 'student') {
            await signOut(auth);
            router.push('/login');
            return;
          }
          const name = data.name as string;
          setUserName(name);
          setFirstName(name.split(' ')[0]);
        } else {
          await signOut(auth);
          router.push('/login');
          return;
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Unable to load user profile. Please verify your connection.');
      }
    });

    const unsubQueues = onSnapshot(collection(db, 'queues'), (snap) => {
      const results = snap.docs.map((qDoc) => {
        const q = qDoc.data();
        return {
          id: qDoc.id,
          deptName: (q.deptName as string) ?? qDoc.id,
          isActive: q.isActive !== false,
          currentCounter: (q.currentCounter as number) ?? 0,
          lastToken: (q.lastToken as number) ?? 0,
          waiting: (q.waitingCount as number) ?? 0,
          icon: QUEUE_ICONS[qDoc.id] ?? '🏢',
        };
      });
      setQueues(results);
      setLoading(false);
    }, (err) => {
      console.error('Failed to listen to queues:', err);
      setError('Unable to connect to the queue service. Please try again.');
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubQueues();
    };
  }, [router]);

  const joinQueue = async (queueId: string) => {
    if (!currentUserId) return;
    if (!isOnline) {
      alert('You are offline. Please check your connection.');
      return;
    }

    setJoiningId(queueId);

    try {
      // Check if already in any active queue (waiting or called)
      const queuesSnap = await getDocs(collection(db, 'queues'));
      for (const qDoc of queuesSnap.docs) {
        for (const status of ['waiting', 'called']) {
          const existing = await getDocs(
            query(
              collection(db, 'queues', qDoc.id, 'tokens'),
              where('studentId', '==', currentUserId),
              where('status', '==', status)
            )
          );
          if (!existing.empty) {
            const label = status === 'called' ? 'currently being served at' : 'already in the';
            alert(
              `You are ${label} ${qDoc.data().deptName} queue.\n${
                status === 'called' ? 'Please complete that first.' : 'Leave that queue first.'
              }`
            );
            setJoiningId(null);
            return;
          }
        }
      }

      // Get student name
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      const studentName = (userDoc.data()?.name as string) ?? 'Student';

      // Use joinQueue helper
      const { tokenId } = await joinQueueAction(queueId, currentUserId, studentName);

      router.push(`/token?queueId=${queueId}&tokenId=${tokenId}`);
    } catch {
      alert('Failed to join queue. Please try again.');
      setJoiningId(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      {/* Offline banner */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#ff3b30', color: '#fff',
          textAlign: 'center', padding: '10px',
          fontSize: 13, fontWeight: 600,
        }}>
          * You are offline — check your connection.
        </div>
      )}

      <Navbar portal="student" userName={userName} onLogout={handleLogout} style={{ top: isOnline ? 0 : 40 }} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 20px' }}>

        {/* Greeting */}
        <div className="sq-fade-in" style={{ marginBottom: 36 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--text-dim)', marginBottom: 8,
          }}>
            Student Dashboard
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
            Hello, {firstName || 'there'} 👋
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-sub)', marginTop: 6 }}>
            Select a department to join its virtual queue.
          </p>
        </div>



        {/* Queue list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          )}

          {!error && loading && (
            <LoadingState type="list" count={3} />
          )}

          {!error && !loading && queues.length === 0 && (
            <EmptyState
              icon="🏢"
              title="No queues available"
              description="Check back later or contact the admin."
            />
          )}

          {!error && !loading && queues.map((queue, i) => {
            const isJoining = joiningId === queue.id;
            const badgeClass = !queue.isActive
              ? 'sq-badge-done'
              : queue.waiting === 0
              ? 'sq-badge-low'
              : queue.waiting <= 3
              ? 'sq-badge-mid'
              : 'sq-badge-high';
            const waitText = !queue.isActive
              ? 'Queue closed'
              : queue.waiting === 0
              ? '✓ No wait'
              : `${queue.waiting} waiting`;

            return (
              <div
                key={queue.id}
                className="sq-card sq-card-lift sq-fade-in"
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: 20,
                  animationDelay: `${0.05 + i * 0.07}s`,
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--bg)', border: '1px solid var(--border-s)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                  opacity: queue.isActive ? 1 : 0.4,
                }}>
                  {queue.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: queue.isActive ? 'var(--text)' : 'var(--text-dim)',
                    marginBottom: 6,
                  }}>
                    {queue.deptName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className={`sq-badge ${badgeClass}`}>{waitText}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      Now serving:{' '}
                      <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>
                        #{queue.currentCounter}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action */}
                {queue.isActive ? (
                  <button
                    onClick={() => joinQueue(queue.id)}
                    disabled={isJoining || joiningId !== null || !isOnline}
                    className="sq-btn sq-btn-primary sq-btn-sm"
                    style={{
                      flexShrink: 0,
                      opacity: joiningId !== null && !isJoining ? 0.5 : 1,
                      minWidth: 60,
                    }}
                  >
                    {isJoining ? '…' : 'Join'}
                  </button>
                ) : (
                  <span className="sq-badge" style={{
                    background: 'rgba(255,59,48,0.08)', color: '#ff3b30',
                    border: '1px solid rgba(255,59,48,0.2)',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    🚫 Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}