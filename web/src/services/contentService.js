import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { byOrder, getDb, isFirebaseConfigured, mapDoc } from './base';

/** Loads settings/general and siteContent/{main,ayurveda,dental}. Missing docs come back as null. */
export async function getSiteData() {
  if (!isFirebaseConfigured) return { settings: null, main: null, ayurveda: null, dental: null };
  const db = getDb();
  const read = async (path, id) => {
    const snap = await getDoc(doc(db, path, id));
    return snap.exists() ? snap.data() : null;
  };
  const [settings, main, ayurveda, dental] = await Promise.all([
    read('settings', 'general'),
    read('siteContent', 'main'),
    read('siteContent', 'ayurveda'),
    read('siteContent', 'dental'),
  ]);
  return { settings, main, ayurveda, dental };
}

/** Active testimonials for a scope ('main' | 'ayurveda' | 'dental'). */
export async function listTestimonials(scope) {
  const snap = await getDocs(
    query(collection(getDb(), 'testimonials'), where('active', '==', true), where('practiceType', '==', scope)),
  );
  return snap.docs.map(mapDoc).sort(byOrder);
}

export async function listFaqs(scope) {
  const snap = await getDocs(
    query(collection(getDb(), 'faqs'), where('active', '==', true), where('practiceType', '==', scope)),
  );
  return snap.docs.map(mapDoc).sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
}
