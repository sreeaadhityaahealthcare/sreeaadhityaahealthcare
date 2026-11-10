import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapDoc } from './crud';
import { todayISO } from '../utils/format';

const colRef = () => collection(db, 'opVisits');

/**
 * Get next token number for today's practice OPD queue.
 */
export async function getNextTodayToken(practiceType, date = todayISO()) {
  try {
    const q = query(
      colRef(),
      where('visitDate', '==', date),
      where('practiceType', '==', practiceType),
      orderBy('tokenNumber', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return 1;
    const top = snap.docs[0].data();
    return (Number(top.tokenNumber) || 0) + 1;
  } catch (err) {
    // If index is pending, count simple query
    try {
      const snap = await getDocs(
        query(colRef(), where('visitDate', '==', date))
      );
      const filtered = snap.docs.filter(
        (d) => d.data().practiceType === practiceType
      );
      return filtered.length + 1;
    } catch (e) {
      return 1;
    }
  }
}

/**
 * Create a new OP Consultation Visit.
 * Also increments patient's totalVisits count and updates lastVisitDate.
 */
export async function createOpVisit(data, user) {
  const visitDate = data.visitDate || todayISO();
  const tokenNumber =
    data.tokenNumber || (await getNextTodayToken(data.practiceType, visitDate));

  const payload = {
    ...data,
    visitDate,
    visitTime:
      data.visitTime ||
      new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }),
    tokenNumber,
    visitStatus: data.visitStatus || 'completed',
    paymentStatus: data.paymentStatus || 'paid',
    consultationFee: Number(data.consultationFee) || 0,
    vitals: data.vitals || {
      bp: '',
      pulse: '',
      temp: '',
      weight: '',
      height: '',
      bmi: '',
      rbs: '',
      spo2: '',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user?.uid || 'staff',
    updatedBy: user?.uid || 'staff',
  };

  const ref = await addDoc(colRef(), payload);

  // Update patient's visit counters
  if (data.patientId) {
    try {
      await updateDoc(doc(db, 'patients', data.patientId), {
        totalVisits: increment(1),
        lastVisitDate: visitDate,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'staff',
      });
    } catch (err) {
      console.warn('Could not update patient totalVisits:', err);
    }
  }

  return { id: ref.id, tokenNumber };
}

/**
 * List all OP visits (with practice filtering and date ordering).
 */
export async function listOpVisits(practiceScope, maxCount = 200) {
  try {
    const snap = await getDocs(
      query(colRef(), orderBy('createdAt', 'desc'), limit(maxCount))
    );
    const all = snap.docs.map(mapDoc);

    if (!practiceScope) return all;
    return all.filter((v) => v.practiceType === practiceScope);
  } catch (err) {
    console.error('Error listing OP visits:', err);
    return [];
  }
}

/**
 * Update OP visit details.
 */
export async function updateOpVisit(id, data, user) {
  await updateDoc(doc(db, 'opVisits', id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user?.uid || 'staff',
  });
}

/**
 * Delete an OP visit (super_admin only).
 */
export async function deleteOpVisit(id) {
  await deleteDoc(doc(db, 'opVisits', id));
}
