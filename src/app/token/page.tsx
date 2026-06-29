'use client';

import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar } from '@/components/layout/Navbar';
import { leaveQueue as leaveQueueAction, getUserDoc, logActivity } from '@/lib/firebase-helpers';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  doc,
  onSnapshot,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

type TokenStatus = 'waiting' | 'called' | 'complete';

interface TokenData {
  tokenNumber: number;
  status: TokenStatus;
  studentName: string;
}

interface QueueData {
  deptName: string;
  currentCounter: number;
  isActive: boolean;
}

function formatWait(secs: number): string {
  if (secs <= 0) return '0m';
  if (secs < 60) return `${secs}s`;
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function TokenPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [findingToken, setFindingToken] = useState(false);
  const [noTokenFound, setNoTokenFound] = useState(false);

  const [token, setToken] = useState<TokenData | null>(null);
  const [queue, setQueue] = useState<QueueData | null>(null);
  const [avgServiceTime, setAvgServiceTime] = useState(5 * 60); // default 5 mins in secs
  const [aiLabelVisible, setAiLabelVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);

  const lastPositionRef = useRef<number | null>(null);
  const unsubTokenRef = useRef<(() => void) | null>(null);
  const unsubQueueRef = useRef<(() => void) | null>(null);

  // Scan all queues for student's active token
  const searchActiveToken = useCallback(async (uid: string) => {
    try {
      const queuesSnap = await getDocs(collection(db, 'queues'));
      for (const qDoc of queuesSnap.docs) {
        const tokenQuery = query(
          collection(db, 'queues', qDoc.id, 'tokens'),
          where('studentId', '==', uid),
          where('status', 'in', ['waiting', 'called']),
          limit(1)
        );
        const tokenSnap = await getDocs(tokenQuery);
        if (!tokenSnap.empty) {
          const tDoc = tokenSnap.docs[0];
          const qId = qDoc.id;
          const tId = tDoc.id;
          // Update URL search parameters without reloading
          const newUrl = `${window.location.pathname}?queueId=${qId}&tokenId=${tId}`;
          window.history.replaceState(null, '', newUrl);
          setActiveQueueId(qId);
          setActiveTokenId(tId);
          setFindingToken(false);
          return;
        }
      }
      setNoTokenFound(true);
      setFindingToken(false);
    } catch {
      setNoTokenFound(true);
      setFindingToken(false);
    }
  }, []);

  const requestNotifications = useCallback(async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotifGranted(permission === 'granted');

      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
      }
    } catch {
      // silently fail
    }
  }, []);

  const sendNotification = useCallback(async (title: string, body: string) => {
    if (!notifGranted) return;
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
          badge: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
          vibrate: [200, 100, 200],
          tag: 'smartqueue-update',
          renotify: true,
        } as NotificationOptions);
      } else if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {
      // silently fail
    }
  }, [notifGranted]);

  const loadAvgServiceTime = useCallback(async () => {
    if (!activeQueueId) return;
    try {
      const snap = await getDocs(
        query(
          collection(db, 'queues', activeQueueId, 'tokens'),
          where('status', '==', 'complete'),
          where('serviceDuration', '!=', null),
          orderBy('serviceDuration'),
          limit(10)
        )
      );
      if (snap.empty) return;
      let total = 0, count = 0;
      snap.forEach((d) => {
        const dur = d.data().serviceDuration as number;
        if (dur > 0 && dur < 3600) { total += dur; count++; }
      });
      if (count > 0) {
        setAvgServiceTime(Math.round(total / count));
        setAiLabelVisible(true);
      }
    } catch {
      // use default
    }
  }, [activeQueueId]);

  const startListeners = useCallback(() => {
    if (!activeQueueId || !activeTokenId) return;

    // Token listener
    unsubTokenRef.current = onSnapshot(
      doc(db, 'queues', activeQueueId, 'tokens', activeTokenId),
      (snap) => {
        if (!snap.exists()) {
          router.push('/dashboard');
          return;
        }
        const data = snap.data();
        setToken({
          tokenNumber: data.tokenNumber as number,
          status: data.status as TokenStatus,
          studentName: data.studentName as string,
        });
      }
    );

    // Queue listener
    unsubQueueRef.current = onSnapshot(
      doc(db, 'queues', activeQueueId),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setQueue({
          deptName: data.deptName as string,
          currentCounter: (data.currentCounter as number) ?? 0,
          isActive: data.isActive !== false,
        });
      }
    );
  }, [activeQueueId, activeTokenId, router]);

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

  // Auth guard + Role check + Active Token Search Fallback
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const profile = await getUserDoc(user.uid);
        if (!profile || profile.role !== 'student') {
          await signOut(auth);
          router.push('/login');
          return;
        }

        const qParam = searchParams.get('queueId');
        const tParam = searchParams.get('tokenId');

        if (qParam && tParam) {
          setActiveQueueId(qParam);
          setActiveTokenId(tParam);
        } else {
          setFindingToken(true);
          await searchActiveToken(user.uid);
        }
      } catch {
        await signOut(auth);
        router.push('/login');
      }
    });
    return () => unsub();
  }, [searchParams, searchActiveToken, router]);

  // Request notification permission + load avg service time + start listeners
  useEffect(() => {
    if (!activeQueueId || !activeTokenId) return;

    setTimeout(() => {
      requestNotifications();
      loadAvgServiceTime();
      startListeners();
    }, 0);

    return () => {
      unsubTokenRef.current?.();
      unsubQueueRef.current?.();
    };
  }, [activeQueueId, activeTokenId, requestNotifications, loadAvgServiceTime, startListeners]);

  // Notification trigger based on position
  useEffect(() => {
    if (!token || !queue) return;
    const position = token.tokenNumber - queue.currentCounter;
    if (position === lastPositionRef.current) return;
    lastPositionRef.current = position;

    if (position === 5) {
      sendNotification(
        '⏰ Position Update: 5 People Ahead',
        `You are 5th in line for ${queue.deptName}.`
      );
    }
    if (position === 3) {
      sendNotification(
        '⏰ Almost Your Turn!',
        `You are 3rd in line for ${queue.deptName}.`
      );
    }
    if (position === 1) {
      sendNotification(
        '🔔 You Are Next!',
        `You are next in line! Head to the ${queue.deptName} counter now.`
      );
    }
    if (token.status === 'called') {
      sendNotification(
        '📢 Ticket Called!',
        `Your token #${token.tokenNumber} has been called for ${queue.deptName}!`
      );
    }
  }, [token, queue, sendNotification]);

  const handleLeaveQueue = async () => {
    if (!confirm('Leave the queue? Your token will be cancelled.')) return;
    unsubTokenRef.current?.();
    unsubQueueRef.current?.();
    if (activeQueueId && activeTokenId) {
      if (token) {
        await logActivity('TOKEN_CANCELLED', `Token #${token.tokenNumber} (${token.studentName}) left the queue "${activeQueueId}".`);
      }
      await leaveQueueAction(activeQueueId, activeTokenId);
    }
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    unsubTokenRef.current?.();
    unsubQueueRef.current?.();
    await signOut(auth);
    router.push('/login');
  };


  // Derived display values
  const position = token && queue ? token.tokenNumber - queue.currentCounter : null;
  const estWait = position != null && position > 0
    ? formatWait(position * avgServiceTime)
    : position === 0 || position != null && position <= 0
    ? '0m'
    : '--';

  const isCalled = token?.status === 'called';
  const isComplete = token?.status === 'complete';

  if (findingToken) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <LoadingState type="card" count={1} />
      </div>
    );
  }

  if (noTokenFound) {
    return (
      <>
        <Navbar portal="token" onLogout={handleLogout} />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <EmptyState
            icon="🎫"
            title="No Active Token"
            description="You do not have an active queue token at the moment. Join a department queue from the dashboard to get a token."
            actionHref="/dashboard"
            actionLabel="Go to Dashboard"
          />
        </div>
      </>
    );
  }

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
          * You are offline — showing last known data.
        </div>
      )}

      <Navbar portal="token" onLogout={handleLogout} style={{ top: isOnline ? 0 : 40 }} />

      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>

        {/* Token card */}
        <div className="sq-card sq-fade-in" style={{ textAlign: 'center', padding: '40px 28px' }}>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 28,
          }}>
            Your Token Number
          </div>

          {/* Token ring */}
          <div
            className={`sq-token-ring${isCalled ? ' called' : ''}`}
            style={{ transition: 'all 0.4s' }}
          >
            <span className="sq-token-num">
              {token ? token.tokenNumber : '--'}
            </span>
          </div>

          {/* Department name */}
          <div style={{
            fontSize: 14, color: 'var(--text-sub)',
            margin: '16px 0 20px',
          }}>
            {queue?.deptName ?? ''}
          </div>

          {/* Status badge */}
          {isComplete ? (
            <span className="sq-badge sq-badge-done" style={{ margin: '0 auto' }}>
              ✓ Service Complete — Thank you!
            </span>
          ) : isCalled ? (
            <span className="sq-badge sq-badge-called" style={{ margin: '0 auto', display: 'inline-flex', gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'currentColor', display: 'inline-block',
                animation: 'livePulse 1s infinite',
              }} />
              🔔 Your Turn! Head to the counter.
            </span>
          ) : (
            <span className="sq-badge sq-badge-waiting" style={{ margin: '0 auto', display: 'inline-flex', gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'currentColor', opacity: 0.7,
                display: 'inline-block', animation: 'livePulse 2s infinite',
              }} />
              Waiting in queue
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="sq-card sq-fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div className="sq-stat">
              <div className="sq-stat-label">Now Serving</div>
              <div className="sq-stat-value">
                {queue ? queue.currentCounter : '--'}
              </div>
            </div>
            <div className="sq-stat">
              <div className="sq-stat-label">Your Position</div>
              <div className="sq-stat-value">
                {position != null
                  ? position > 0
                    ? position
                    : '🎉'
                  : '--'}
              </div>
            </div>
            <div className="sq-stat">
              <div className="sq-stat-label">Est. Wait</div>
              <div className="sq-stat-value" style={{ fontSize: 24 }}>
                {estWait}
              </div>
            </div>
          </div>

          {aiLabelVisible && (
            <p style={{
              textAlign: 'center', fontSize: 11,
              color: 'var(--text-dim)', marginTop: 14,
            }}>
              🤖 Wait time based on real service history
            </p>
          )}
        </div>

        {/* Info box */}
        <div className="sq-fade-in" style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: 16, background: 'var(--bg)',
          border: '1px solid var(--border-s)', borderRadius: 14,
          fontSize: 13, color: 'var(--text-sub)',
          animationDelay: '0.15s',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <span>You can close this page and come back — your token is saved.</span>
        </div>

        {/* Leave queue — hide when complete */}
        {!isComplete && (
          <button
            onClick={handleLeaveQueue}
            disabled={!isOnline}
            className="sq-btn sq-btn-danger sq-btn-full sq-btn-lg sq-fade-in"
            style={{ animationDelay: '0.2s', opacity: !isOnline ? 0.5 : 1 }}
          >
            Leave Queue
          </button>
        )}

        {/* Back to dashboard when complete */}
        {isComplete && (
          <a
            href="/dashboard"
            className="sq-btn sq-btn-primary sq-btn-full sq-btn-lg sq-fade-in"
            style={{ animationDelay: '0.2s', textAlign: 'center' }}
          >
            Back to Dashboard
          </a>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)' }}>
          🔴 Updates automatically in real-time
        </p>

      </div>
    </>
  );
}

export default function TokenPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <LoadingState type="card" count={2} />
      </div>
    }>
      <TokenPageContent />
    </Suspense>
  );
}