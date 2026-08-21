'use client';

import { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar } from '@/components/layout/Navbar';
import { leaveQueue as leaveQueueAction, getUserDoc, logActivity } from '@/lib/firebase-helpers';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket, Bell, Check, CircleDot, Circle } from 'lucide-react';
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
  const [avgServiceTime, setAvgServiceTime] = useState(5 * 60);
  const [isOnline, setIsOnline] = useState(true);
  const [notifGranted, setNotifGranted] = useState(false);
  
  const [startPosition, setStartPosition] = useState<number | null>(null);
  const [issueTime, setIssueTime] = useState<string>('--:--');

  const lastPositionRef = useRef<number | null>(null);
  const unsubTokenRef = useRef<(() => void) | null>(null);
  const unsubQueueRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIssueTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

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
          icon: '/icon.png',
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
      }
    } catch {
      // use default
    }
  }, [activeQueueId]);

  const startListeners = useCallback(() => {
    if (!activeQueueId || !activeTokenId) return;

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

  useEffect(() => {
    if (!activeQueueId || !activeTokenId) return;
    requestNotifications();
    loadAvgServiceTime();
    startListeners();

    return () => {
      unsubTokenRef.current?.();
      unsubQueueRef.current?.();
    };
  }, [activeQueueId, activeTokenId, requestNotifications, loadAvgServiceTime, startListeners]);

  // Derived display values
  const position = token && queue ? token.tokenNumber - queue.currentCounter : null;
  const aheadCount = position != null && position > 0 ? position - 1 : 0;
  const estWait = position != null && position > 0 ? formatWait(position * avgServiceTime) : '0m';

  const isCalled = token?.status === 'called';
  const isComplete = token?.status === 'complete';

  useEffect(() => {
    if (position !== null && startPosition === null && position > 0) {
      setStartPosition(position);
    }
  }, [position, startPosition]);

  useEffect(() => {
    if (position === null || !queue || !token) return;
    if (position === lastPositionRef.current) return;
    lastPositionRef.current = position;

    if (position === 5) sendNotification('Update', `You are 5th in line for ${queue.deptName}.`);
    if (position === 3) sendNotification('Almost Your Turn!', `You are 3rd in line for ${queue.deptName}.`);
    if (position === 1) sendNotification('You Are Next!', `Head to the ${queue.deptName} counter now.`);
    if (token.status === 'called') sendNotification('Ticket Called!', `Your token #${token.tokenNumber} was called!`);
  }, [position, queue, token, sendNotification]);

  const handleLeaveQueue = async () => {
    if (!confirm('Leave the queue? Your token will be cancelled.')) return;
    unsubTokenRef.current?.();
    unsubQueueRef.current?.();
    if (activeQueueId && activeTokenId) {
      if (token) {
        await logActivity('TOKEN_CANCELLED', `Token #${token.tokenNumber} left.`);
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

  const progressPercent = startPosition && startPosition > 0 && position !== null 
    ? Math.max(5, Math.min(100, ((startPosition - position) / startPosition) * 100)) 
    : isCalled || isComplete ? 100 : 5;

  // Determine Notification Mockup Text based on position
  let alertTitle = "Tracking position...";
  let alertBody = `We will notify you when you are 5th in line.`;
  let alertColor = "var(--text)";
  
  if (aheadCount <= 5 && aheadCount > 3) {
    alertTitle = "5 people ahead";
    alertBody = `Token #${token?.tokenNumber} — you are getting closer.`;
  } else if (aheadCount <= 3 && aheadCount > 0) {
    alertTitle = "3 people ahead";
    alertBody = `Token #${token?.tokenNumber} — almost there!`;
  } else if (aheadCount === 0) {
    alertTitle = "You're next!";
    alertBody = `Token #${token?.tokenNumber} — head to ${queue?.deptName} now.`;
    alertColor = "var(--accent)";
  } else if (isCalled) {
    alertTitle = "Ticket Called!";
    alertBody = `Please approach the counter immediately.`;
    alertColor = "#34c759";
  }

  if (findingToken) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 20px' }}>
        <LoadingState type="card" count={1} />
      </div>
    );
  }

  if (noTokenFound) {
    return (
      <>
        <Navbar portal="token" onLogout={handleLogout} />
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 20px' }}>
          <EmptyState
            title="No Active Token"
            description="You do not have an active queue token. Join a queue from the dashboard."
            actionHref="/dashboard"
            actionLabel="Go to Dashboard"
          />
        </div>
      </>
    );
  }

  return (
    <>
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#ff3b30', color: '#fff', textAlign: 'center', padding: '10px',
          fontSize: 13, fontWeight: 600,
        }}>
          * You are offline — showing last known data.
        </div>
      )}

      <Navbar portal="token" onLogout={handleLogout} style={{ top: isOnline ? 0 : 40 }} />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 120px 20px' }}>
        
        {/* 3-Card Grid Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '32px'
        }}>

          {/* CARD 1: YOUR TICKET */}
          <div className="sq-card sq-fade-in" style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>
              YOUR TICKET
            </div>
            <div style={{ fontSize: 72, fontWeight: 800, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 8 }}>
              #{token?.tokenNumber ?? '--'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', fontWeight: 500 }}>
              {queue?.deptName ?? 'Loading...'} · Est. {estWait}
            </div>

            <div style={{ borderTop: '2px dashed var(--border)', margin: '24px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
              <div style={{ background: 'var(--bg)', padding: '16px 12px', borderRadius: '12px', border: '1px solid var(--border-s)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>ISSUED</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{issueTime}</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '16px 12px', borderRadius: '12px', border: '1px solid var(--border-s)', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>AHEAD</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                  {isCalled || isComplete ? '0' : aheadCount} People
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: LIVE QUEUE PROGRESS */}
          <div className="sq-card sq-fade-in" style={{ animationDelay: '0.1s', padding: '32px 24px', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                LIVE QUEUE<br/>PROGRESS
              </span>
              {isCalled ? (
                 <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: 999 }}>
                   <Bell size={12} className="sq-bounce" /> CALLED
                 </span>
              ) : (
                 <span style={{ color: '#34c759', fontWeight: 600, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,199,89,0.1)', padding: '4px 10px', borderRadius: 999 }}>
                   <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', animation: 'pulse 2s infinite' }} /> LIVE
                 </span>
              )}
            </div>

            <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent), #5ac8ff)', 
                width: `${progressPercent}%`, 
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 4
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 24 }}>
              <span style={{ color: 'var(--text-sub)' }}>Currently:<br/><strong style={{ color: 'var(--text)', fontSize: 15 }}>#{queue?.currentCounter ?? '--'}</strong></span>
              <span style={{ color: 'var(--text-sub)', textAlign: 'right' }}>Your turn:<br/><strong style={{ color: 'var(--accent)', fontSize: 15 }}>#{token?.tokenNumber ?? '--'}</strong></span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 'auto' }}>
              <div style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border-s)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>AHEAD</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                  {isCalled || isComplete ? '0' : aheadCount}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border-s)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.05em' }}>WAIT</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>
                  {isCalled || isComplete ? '0m' : `~${estWait}`}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: ALERT MILESTONES */}
          <div className="sq-card sq-fade-in" style={{ animationDelay: '0.2s', padding: '32px 24px', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            
            {/* Dynamic Notification Mockup */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border-s)', borderRadius: '14px', padding: '14px 16px', marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
               <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>
                     <Bell size={18} />
                  </div>
                  <div>
                     <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>SmartQueue Alert</div>
                     <div style={{ fontSize: 12, color: alertColor, fontWeight: 600, marginTop: 2 }}>{alertTitle}</div>
                     <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2, lineHeight: 1.4 }}>{alertBody}</div>
                  </div>
               </div>
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 14 }}>
              ALERT MILESTONES
            </div>

            {/* Checklists */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 'auto' }}>
              
              {/* 5 Ahead */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-s)' }}>
                {aheadCount <= 5 ? (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : (
                  <Circle size={20} color="var(--border)" />
                )}
                <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>5 ahead</span>
              </div>

              {/* 3 Ahead */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-s)' }}>
                {aheadCount <= 3 ? (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : (
                  <Circle size={20} color="var(--border)" />
                )}
                <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>3 ahead</span>
              </div>

              {/* You're next! */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                {aheadCount === 0 ? (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : aheadCount <= 1 ? (
                  <CircleDot size={20} color="var(--accent)" />
                ) : (
                  <Circle size={20} color="var(--border)" />
                )}
                <span style={{ fontSize: 13, color: aheadCount <= 1 ? 'var(--accent)' : 'var(--text-sub)', fontWeight: aheadCount <= 1 ? 600 : 400 }}>You're next!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Container */}
        <div style={{ display: 'flex', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
          {!isComplete && !isCalled && (
            <button
              onClick={handleLeaveQueue}
              disabled={!isOnline}
              className="sq-btn sq-btn-danger sq-btn-lg sq-fade-in"
              style={{ flex: 1, animationDelay: '0.3s', opacity: !isOnline ? 0.5 : 1 }}
            >
              Cancel Ticket
            </button>
          )}

          {isComplete && (
            <button
              onClick={() => router.push('/dashboard')}
              className="sq-btn sq-btn-primary sq-btn-lg sq-fade-in"
              style={{ flex: 1, animationDelay: '0.3s' }}
            >
              Back to Dashboard
            </button>
          )}
        </div>

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