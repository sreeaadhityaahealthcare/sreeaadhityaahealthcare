import { collection, getDocs, query, where } from 'firebase/firestore';
import { byOrder, getDb, mapDoc } from './base';

/** Active doctors, optionally for one practice ('ayurveda' | 'dental'). */
export async function listDoctors(practice) {
  const clauses = [where('active', '==', true)];
  if (practice) clauses.push(where('practiceType', '==', practice));
  const snap = await getDocs(query(collection(getDb(), 'doctors'), ...clauses));
  return snap.docs.map(mapDoc).sort(byOrder);
}
