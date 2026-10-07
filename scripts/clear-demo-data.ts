/**
 * Paschim Banga DurgaPuja Samannay Samity
 * One-Time Maintenance Script: Clear All Test / Demo Data (TypeScript)
 *
 * Wipes all test documents from:
 * - committees
 * - pandals
 * - votes_log
 */

import { adminDb } from '../src/lib/firebaseAdmin';

async function deleteCollection(collectionName: string, batchSize = 100): Promise<number> {
  if (!adminDb) {
    throw new Error('Firebase Admin DB is not initialized.');
  }

  const colRef = adminDb.collection(collectionName);
  let totalDeleted = 0;

  while (true) {
    const snapshot = await colRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    totalDeleted += snapshot.size;
  }

  return totalDeleted;
}

export async function clearAllDemoData(): Promise<Record<string, number>> {
  const collections = ['committees', 'pandals', 'votes_log'];
  const results: Record<string, number> = {};

  for (const col of collections) {
    results[col] = await deleteCollection(col);
  }

  return results;
}

// Auto-run if executed directly
if (require.main === module) {
  clearAllDemoData()
    .then((results) => {
      console.log('Cleanup results:', results);
    })
    .catch((err) => {
      console.error('Cleanup error:', err);
    });
}
