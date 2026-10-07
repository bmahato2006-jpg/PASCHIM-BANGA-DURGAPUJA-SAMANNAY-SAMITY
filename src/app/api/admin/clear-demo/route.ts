export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isSuperAdmin } from '@/lib/admin';

async function deleteCollection(collectionName: string, batchSize = 100): Promise<{ count: number; docIds: string[] }> {
  if (!adminDb) {
    throw new Error('Firebase Admin DB is not initialized.');
  }

  const colRef = adminDb.collection(collectionName);
  let totalDeleted = 0;
  const deletedDocIds: string[] = [];

  while (true) {
    const snapshot = await colRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
      deletedDocIds.push(doc.id);
      batch.delete(doc.ref);
    });

    await batch.commit();
    totalDeleted += snapshot.size;
  }

  return { count: totalDeleted, docIds: deletedDocIds };
}

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, message: 'Firebase Admin Firestore is not initialized on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { adminEmail, confirmation } = body;

    // 1. Authorize: Verify admin authority with designated Super Admin check
    if (!adminEmail || !isSuperAdmin(adminEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন টেস্ট ডেটা মুছতে পারেন। (Unauthorized: Super Admin access required)',
        },
        { status: 403 }
      );
    }

    // 2. Extra safety confirmation check
    if (confirmation !== 'CLEAR_ALL_DEMO_DATA') {
      return NextResponse.json(
        {
          success: false,
          message: 'নিরাপত্তা নিশ্চিতকরণ ব্যর্থ হয়েছে। confirmation: "CLEAR_ALL_DEMO_DATA" প্রদান করুন।',
        },
        { status: 400 }
      );
    }

    // 3. Perform batch deletion across committees, pandals, and votes_log
    const targets = ['committees', 'pandals', 'votes_log'];
    const results: Record<string, { count: number; docIds: string[] }> = {};

    for (const col of targets) {
      results[col] = await deleteCollection(col);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'সমস্ত টেস্ট/ডেমো ডেটা সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে। (All demo/test data successfully cleared)',
        summary: {
          committeesDeleted: results.committees.count,
          pandalsDeleted: results.pandals.count,
          votesDeleted: results.votes_log.count,
          deletedDocs: results,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API /api/admin/clear-demo exception:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'ডেটা মুছে ফেলার সময় সার্ভার ত্রুটি ঘটেছে। (An error occurred while clearing demo data)',
      },
      { status: 500 }
    );
  }
}
