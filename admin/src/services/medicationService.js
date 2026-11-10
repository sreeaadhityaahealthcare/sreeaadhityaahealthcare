import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { mapDoc } from './crud';
import { DEFAULT_MEDICATIONS } from './medicationData';

const colRef = () => collection(db, 'medications');

/**
 * List active medications. Scoped by practice:
 * - If practiceScope is 'ayurveda', returns ayurveda + both.
 * - If practiceScope is 'dental', returns dental + both.
 * - If practiceScope is null (super_admin), returns all.
 */
export async function listMedications(practiceScope) {
  try {
    const snap = await getDocs(query(colRef(), orderBy('name', 'asc'), limit(500)));
    const all = snap.docs.map(mapDoc);

    // If database is empty, return defaults filtered by scope
    if (all.length === 0) {
      return DEFAULT_MEDICATIONS.filter((m) => {
        if (!practiceScope) return true;
        return m.practiceType === practiceScope || m.practiceType === 'both';
      });
    }

    return all.filter((m) => {
      if (!practiceScope) return true;
      return m.practiceType === practiceScope || m.practiceType === 'both';
    });
  } catch (err) {
    console.warn('Could not load medications from Firestore, using default formulary:', err);
    return DEFAULT_MEDICATIONS.filter((m) => {
      if (!practiceScope) return true;
      return m.practiceType === practiceScope || m.practiceType === 'both';
    });
  }
}

/**
 * Seed default formulary into Firestore if not already seeded.
 */
export async function seedDefaultMedicationsIfEmpty(user) {
  try {
    const snap = await getDocs(query(colRef(), limit(5)));
    if (!snap.empty) return { seeded: false, count: snap.size };

    const batch = writeBatch(db);
    DEFAULT_MEDICATIONS.forEach((med) => {
      const ref = doc(colRef());
      batch.set(ref, {
        ...med,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid || 'system',
        updatedBy: user?.uid || 'system',
      });
    });
    await batch.commit();
    return { seeded: true, count: DEFAULT_MEDICATIONS.length };
  } catch (err) {
    console.error('Error seeding default medications:', err);
    return { seeded: false, error: err.message };
  }
}

export async function createMedication(data, user) {
  const ref = await addDoc(colRef(), {
    ...data,
    active: data.active ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user?.uid || 'staff',
    updatedBy: user?.uid || 'staff',
  });
  return ref.id;
}

export async function updateMedication(id, data, user) {
  await updateDoc(doc(db, 'medications', id), {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: user?.uid || 'staff',
  });
}

export async function deleteMedication(id) {
  await deleteDoc(doc(db, 'medications', id));
}
