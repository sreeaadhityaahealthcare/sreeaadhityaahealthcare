import { db, isFirebaseConfigured } from '../config/firebase';
import { DEMO_ENABLED } from '../config/site';
import { AppError } from '../utils/errors';

export { isFirebaseConfigured };

/** Returns the Firestore instance or throws a friendly error when Firebase isn't configured. */
export function getDb() {
  if (!db) throw new AppError('This feature isn’t available yet because the site is still being set up.', 'unconfigured');
  return db;
}

export const mapDoc = (snap) => ({ id: snap.id, ...snap.data() });

export const byOrder = (a, b) =>
  (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || String(a.name || '').localeCompare(String(b.name || ''));

/**
 * Runs `fetcher` directly from Firestore. Demo fallback has been completely removed.
 */
export async function withDemo(fetcher) {
  if (!isFirebaseConfigured) {
    throw new AppError('This feature isn’t available yet because the site is still being set up.', 'unconfigured');
  }
  return await fetcher();
}
