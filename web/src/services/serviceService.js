import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { byOrder, getDb, mapDoc } from './base';

/** Active treatments/services, optionally for one practice. */
export async function listServices(practice) {
  const clauses = [where('active', '==', true)];
  if (practice) clauses.push(where('practiceType', '==', practice));
  const snap = await getDocs(query(collection(getDb(), 'services'), ...clauses));
  return snap.docs.map(mapDoc).sort(byOrder);
}

export async function getServiceBySlug(practice, slug) {
  const snap = await getDocs(
    query(
      collection(getDb(), 'services'),
      where('active', '==', true),
      where('practiceType', '==', practice),
      where('slug', '==', slug),
      limit(1),
    ),
  );
  return snap.empty ? null : mapDoc(snap.docs[0]);
}
