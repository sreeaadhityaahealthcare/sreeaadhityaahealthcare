import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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

const colRef = () => collection(db, 'prescriptions');

/**
 * Generate sequential Prescription ID:
 * e.g., RX-SID-26-0001 or RX-DEN-26-0001
 */
export async function generatePrescriptionNumber(practiceType = 'ayurveda') {
  const prefixMap = {
    ayurveda: 'RX-SID',
    dental: 'RX-DEN',
    both: 'RX-AAH',
  };
  const prefix = prefixMap[practiceType] || 'RX-AAH';
  const yearSuffix = new Date().getFullYear().toString().slice(-2);

  try {
    const q = query(colRef(), orderBy('createdAt', 'desc'), limit(15));
    const snap = await getDocs(q);

    let maxSeq = 0;
    const regex = new RegExp(`^${prefix}-${yearSuffix}-(\\d{4})$`);

    snap.docs.forEach((d) => {
      const rxNum = d.data().prescriptionNumber || '';
      const match = rxNum.match(regex);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    });

    const nextSeq = String(maxSeq + 1).padStart(4, '0');
    return `${prefix}-${yearSuffix}-${nextSeq}`;
  } catch (err) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${yearSuffix}-${rand}`;
  }
}

/**
 * Create a new Prescription.
 */
export async function createPrescription(data, user) {
  const practiceType = data.practiceType || 'ayurveda';
  let prescriptionNumber = data.prescriptionNumber?.trim();
  if (!prescriptionNumber) {
    prescriptionNumber = await generatePrescriptionNumber(practiceType);
  }

  const payload = {
    ...data,
    prescriptionNumber,
    date: data.date || todayISO(),
    items: data.items || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user?.uid || 'staff',
    updatedBy: user?.uid || 'staff',
  };

  const ref = await addDoc(colRef(), payload);

  // If this prescription was generated from an OP Visit, update that OP visit's prescriptionId
  if (data.visitId) {
    try {
      await updateDoc(doc(db, 'opVisits', data.visitId), {
        prescriptionId: ref.id,
        prescriptionItems: data.items || [],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not link prescription to visit:', err);
    }
  }

  return { id: ref.id, prescriptionNumber };
}

/**
 * Fetch a single prescription by ID.
 */
export async function getPrescription(id) {
  const snap = await getDoc(doc(db, 'prescriptions', id));
  return snap.exists() ? mapDoc(snap) : null;
}

/**
 * List prescriptions (filtered by practiceScope).
 */
export async function listPrescriptions(practiceScope, maxCount = 200) {
  try {
    const snap = await getDocs(
      query(colRef(), orderBy('createdAt', 'desc'), limit(maxCount))
    );
    const all = snap.docs.map(mapDoc);

    if (!practiceScope) return all;
    return all.filter((p) => p.practiceType === practiceScope);
  } catch (err) {
    console.error('Error listing prescriptions:', err);
    return [];
  }
}

/**
 * Update prescription.
 */
export async function updatePrescription(id, data, user) {
  await updateDoc(doc(db, 'prescriptions', id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user?.uid || 'staff',
  });
}

/**
 * Delete prescription.
 */
export async function deletePrescription(id) {
  await deleteDoc(doc(db, 'prescriptions', id));
}
