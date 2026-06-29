import { db, auth } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  increment,
  collectionGroup,
  serverTimestamp,
} from 'firebase/firestore';

export async function logActivity(action: string, details: string, operatorId?: string, operatorName?: string) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, 'activityLogs'), {
      action,
      details,
      timestamp: serverTimestamp(),
      operatorId: operatorId || user?.uid || 'system',
      operatorName: operatorName || user?.email || 'System',
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export interface QueueStatsUpdate {
  deptName?: string;
  isActive?: boolean;
  currentCounter?: number;
  lastToken?: number;
  waitingCount?: number;
}

export async function syncQueueStats(queueId: string, data: QueueStatsUpdate) {
  try {
    await setDoc(doc(db, 'publicQueueStats', queueId), data, { merge: true });
  } catch (err) {
    console.error(`Failed to sync public stats for queue ${queueId}:`, err);
  }
}

export async function getUserDoc(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    name: (data.name as string) || '',
    email: (data.email as string) || '',
    role: (data.role as string) || '',
  };
}

export async function registerUserDoc(uid: string, name: string, email: string, role: string = 'student') {
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role,
    createdAt: new Date(),
  });
}

export async function getAllQueues() {
  const snap = await getDocs(collection(db, 'queues'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createQueue(queueId: string, deptName: string, assignedStaffId: string = '') {
  await setDoc(doc(db, 'queues', queueId), {
    deptName,
    assignedStaff: assignedStaffId,
    isActive: true,
    currentCounter: 0,
    lastToken: 0,
    waitingCount: 0,
    createdAt: new Date(),
  });
  await syncQueueStats(queueId, {
    deptName,
    isActive: true,
    currentCounter: 0,
    lastToken: 0,
    waitingCount: 0,
  });
  await logActivity('QUEUE_CREATED', `Queue "${deptName}" (${queueId}) was created.`);
  if (assignedStaffId) {
    await logActivity('STAFF_ASSIGNED', `Staff member "${assignedStaffId}" was assigned to queue "${queueId}" on creation.`);
  }
}

export async function deleteQueue(queueId: string) {
  const tokensSnap = await getDocs(collection(db, 'queues', queueId, 'tokens'));
  const batchPromises = tokensSnap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(batchPromises);
  await deleteDoc(doc(db, 'queues', queueId));
  await deleteDoc(doc(db, 'publicQueueStats', queueId));
  await logActivity('QUEUE_DELETED', `Queue "${queueId}" was deleted.`);
}

export async function updateQueueStatus(queueId: string, isActive: boolean) {
  await updateDoc(doc(db, 'queues', queueId), { isActive });
  await syncQueueStats(queueId, { isActive });
  const action = isActive ? 'QUEUE_OPENED' : 'QUEUE_CLOSED';
  const details = isActive ? `Queue "${queueId}" was opened.` : `Queue "${queueId}" was closed.`;
  await logActivity(action, details);
}

export async function assignStaffToQueue(queueId: string, staffId: string) {
  await updateDoc(doc(db, 'queues', queueId), { assignedStaff: staffId });
  if (staffId) {
    await logActivity('STAFF_ASSIGNED', `Staff member "${staffId}" was assigned to queue "${queueId}".`);
  } else {
    await logActivity('STAFF_UNASSIGNED', `Staff assignment was cleared for queue "${queueId}".`);
  }
}

export async function resetQueue(queueId: string) {
  await updateDoc(doc(db, 'queues', queueId), {
    currentCounter: 0,
    lastToken: 0,
    waitingCount: 0,
  });
  await syncQueueStats(queueId, {
    currentCounter: 0,
    lastToken: 0,
    waitingCount: 0,
  });
  const tokensSnap = await getDocs(
    query(
      collection(db, 'queues', queueId, 'tokens'),
      where('status', 'in', ['waiting', 'called'])
    )
  );
  const batchPromises = tokensSnap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(batchPromises);
  await logActivity('QUEUE_CLOSED', `Queue "${queueId}" was reset.`);
}

export async function joinQueue(queueId: string, studentId: string, studentName: string) {
  const queueRef = doc(db, 'queues', queueId);
  let newTokenNumber = 0;

  await runTransaction(db, async (transaction) => {
    const queueSnap = await transaction.get(queueRef);
    if (!queueSnap.exists()) {
      throw new Error('Queue does not exist.');
    }
    newTokenNumber = ((queueSnap.data().lastToken as number) ?? 0) + 1;
    transaction.update(queueRef, {
      lastToken: increment(1),
      waitingCount: increment(1),
    });
    transaction.set(doc(db, 'publicQueueStats', queueId), {
      lastToken: increment(1),
      waitingCount: increment(1),
    }, { merge: true });
  });

  const tokenRef = await addDoc(collection(db, 'queues', queueId, 'tokens'), {
    tokenNumber: newTokenNumber,
    studentId,
    studentName,
    status: 'waiting',
    timestamp: new Date(),
  });

  await logActivity(
    'TOKEN_JOINED',
    `Token #${newTokenNumber} (${studentName}) joined queue "${queueId}".`,
    studentId,
    studentName
  );

  return { tokenId: tokenRef.id, tokenNumber: newTokenNumber };
}

export async function leaveQueue(queueId: string, tokenId: string) {
  const tokenRef = doc(db, 'queues', queueId, 'tokens', tokenId);
  const tokenSnap = await getDoc(tokenRef);
  if (tokenSnap.exists()) {
    const status = tokenSnap.data().status;
    await deleteDoc(tokenRef);
    if (status === 'waiting') {
      await updateDoc(doc(db, 'queues', queueId), {
        waitingCount: increment(-1),
      });
      await updateDoc(doc(db, 'publicQueueStats', queueId), {
        waitingCount: increment(-1),
      });
    }
  }
}

export async function callNextToken(queueId: string) {
  const tokensSnap = await getDocs(
    query(
      collection(db, 'queues', queueId, 'tokens'),
      where('status', '==', 'waiting'),
      orderBy('tokenNumber', 'asc'),
      limit(1)
    )
  );

  if (tokensSnap.empty) {
    return null;
  }

  const nextDoc = tokensSnap.docs[0];
  const nextNum = nextDoc.data().tokenNumber as number;
  const studentName = nextDoc.data().studentName || 'Student';

  await updateDoc(nextDoc.ref, { status: 'called', calledAt: new Date() });
  
  await updateDoc(doc(db, 'queues', queueId), {
    currentCounter: nextNum,
    waitingCount: increment(-1),
  });
  
  await updateDoc(doc(db, 'publicQueueStats', queueId), {
    currentCounter: nextNum,
    waitingCount: increment(-1),
  });

  await logActivity('TOKEN_CALLED', `Token #${nextNum} (${studentName}) was called in queue "${queueId}".`);

  return { tokenId: nextDoc.id, tokenNumber: nextNum };
}

export async function markTokenComplete(queueId: string, tokenId: string, serviceDuration: number | null) {
  const tokenRef = doc(db, 'queues', queueId, 'tokens', tokenId);
  const tokenSnap = await getDoc(tokenRef);
  let tokenNumber = '?';
  let studentName = 'Student';
  if (tokenSnap.exists()) {
    const tData = tokenSnap.data();
    tokenNumber = String(tData.tokenNumber || '?');
    studentName = tData.studentName || 'Student';
  }

  await updateDoc(tokenRef, {
    status: 'complete',
    completedAt: new Date(),
    serviceDuration,
  });

  await logActivity('TOKEN_COMPLETED', `Token #${tokenNumber} (${studentName}) in queue "${queueId}" was marked complete.`);
}

export async function getStaffUsers() {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'staff')));
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: (data.name as string) || '',
      email: (data.email as string) || '',
      role: (data.role as string) || '',
    };
  });
}

export async function getStaffDirectory() {
  return getStaffUsers();
}

export async function removeStaffAssignment(queueId: string) {
  await updateDoc(doc(db, 'queues', queueId), { assignedStaff: '' });
}

export async function getAnalyticsMetrics() {
  const tokensSnap = await getDocs(collectionGroup(db, 'tokens'));
  const totalIssued = tokensSnap.size;
  let totalCompleted = 0;
  let totalWaiting = 0;
  let totalWaitTime = 0;
  let totalServiceTime = 0;
  let completedWithWait = 0;
  let completedWithService = 0;

  tokensSnap.docs.forEach((doc) => {
    const t = doc.data();
    if (t.status === 'complete') {
      totalCompleted++;
    } else if (t.status === 'waiting') {
      totalWaiting++;
    }

    if (t.calledAt && t.timestamp) {
      const waitMs = t.calledAt.toDate().getTime() - t.timestamp.toDate().getTime();
      totalWaitTime += waitMs;
      completedWithWait++;
    }

    if (t.serviceDuration !== undefined && t.serviceDuration !== null) {
      totalServiceTime += t.serviceDuration * 1000;
      completedWithService++;
    } else if (t.completedAt && t.calledAt) {
      const svcMs = t.completedAt.toDate().getTime() - t.calledAt.toDate().getTime();
      totalServiceTime += svcMs;
      completedWithService++;
    }
  });

  const avgWaitTime = completedWithWait > 0 ? (totalWaitTime / completedWithWait) / 60000 : 0;
  const avgServiceTime = completedWithService > 0 ? (totalServiceTime / completedWithService) / 60000 : 0;

  return {
    totalIssued,
    totalCompleted,
    totalWaiting,
    avgWaitTime,
    avgServiceTime,
  };
}

export async function getQueueStatistics() {
  const queuesSnap = await getDocs(collection(db, 'queues'));
  const statsPromises = queuesSnap.docs.map(async (qDoc) => {
    const qData = qDoc.data();
    const tokensSnap = await getDocs(collection(db, 'queues', qDoc.id, 'tokens'));
    
    const tokensIssued = tokensSnap.size;
    let tokensCompleted = 0;
    let tokensWaiting = 0;
    let totalServiceTime = 0;
    let completedWithService = 0;

    tokensSnap.docs.forEach((tDoc) => {
      const t = tDoc.data();
      if (t.status === 'complete') {
        tokensCompleted++;
      } else if (t.status === 'waiting') {
        tokensWaiting++;
      }

      if (t.serviceDuration !== undefined && t.serviceDuration !== null) {
        totalServiceTime += t.serviceDuration * 1000;
        completedWithService++;
      } else if (t.completedAt && t.calledAt) {
        const svcMs = t.completedAt.toDate().getTime() - t.calledAt.toDate().getTime();
        totalServiceTime += svcMs;
        completedWithService++;
      }
    });

    const avgServiceTime = completedWithService > 0 ? (totalServiceTime / completedWithService) / 60000 : 0;

    return {
      queueId: qDoc.id,
      deptName: (qData.deptName as string) || qDoc.id,
      tokensIssued,
      tokensCompleted,
      tokensWaiting,
      avgServiceTime,
    };
  });

  return Promise.all(statsPromises);
}
