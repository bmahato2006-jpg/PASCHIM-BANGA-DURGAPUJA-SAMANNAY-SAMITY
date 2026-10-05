export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import type { Transaction } from 'firebase-admin/firestore';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, message: 'Firebase Admin Firestore is not initialized on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const user_uid = body.user_uid || body.voterUid || body.deviceId;
    const pandal_id = body.pandal_id || body.pandalId;
    const category = body.category ? body.category.toLowerCase().trim() : 'overall';

    if (!user_uid || !pandal_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameters: user_uid and pandal_id are required.',
        },
        { status: 400 }
      );
    }

    // Reference to unique vote log document by user_uid and pandal_id
    const voteDocId = `${user_uid}_${pandal_id}`;
    const voteDocRef = adminDb.collection('votes_log').doc(voteDocId);

    // Optional category token lock document to prevent duplicate usage of the same category token
    const categoryDocRef = category !== 'overall'
      ? adminDb.collection('votes_log').doc(`${user_uid}_cat_${category}`)
      : null;

    // Reference to the target pandal document
    const pandalDocRef = adminDb.collection('pandals').doc(pandal_id);

    // Run atomic transaction to guarantee concurrency safety and zero over-counting
    const result = await adminDb.runTransaction(async (transaction: Transaction) => {
      // 1. Check if user already voted for this pandal
      const existingVote = await transaction.get(voteDocRef);
      if (existingVote.exists) {
        throw new Error('DUPLICATE_PANDAL_VOTE');
      }

      // 2. If a specific category token was used, check if already exhausted
      if (categoryDocRef) {
        const existingCategoryVote = await transaction.get(categoryDocRef);
        if (existingCategoryVote.exists) {
          throw new Error('DUPLICATE_CATEGORY_TOKEN');
        }
      }

      // 3. Read the pandal document to determine whether it exists
      const pandalDoc = await transaction.get(pandalDocRef);

      const serverTime = FieldValue.serverTimestamp();

      // 4. Insert vote record into votes_log (Fields: id, pandal_id, user_uid, timestamp)
      transaction.set(voteDocRef, {
        id: voteDocId,
        pandal_id,
        user_uid,
        category,
        timestamp: serverTime,
      });

      if (categoryDocRef) {
        transaction.set(categoryDocRef, {
          id: categoryDocRef.id,
          pandal_id,
          user_uid,
          category,
          timestamp: serverTime,
        });
      }

      // 5. Atomically increment total_votes on pandal document strictly by 1
      if (pandalDoc.exists) {
        const updatePayload: Record<string, any> = {
          total_votes: FieldValue.increment(1),
          updated_at: serverTime,
        };
        if (category && category !== 'overall') {
          updatePayload[`votes.${category}`] = FieldValue.increment(1);
        }
        transaction.update(pandalDocRef, updatePayload);
      } else {
        // Pre-initialize pandal document if not yet seeded
        transaction.set(pandalDocRef, {
          id: pandal_id,
          name: pandal_id,
          total_votes: 1,
          votes: category && category !== 'overall' ? { [category]: 1 } : {},
          created_at: serverTime,
        }, { merge: true });
      }

      return { voteId: voteDocId };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Vote cast successfully!',
        data: result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err?.message === 'DUPLICATE_PANDAL_VOTE') {
      return NextResponse.json(
        {
          success: false,
          message: 'You have already honored this pandal with your device.',
        },
        { status: 409 }
      );
    }

    if (err?.message === 'DUPLICATE_CATEGORY_TOKEN') {
      return NextResponse.json(
        {
          success: false,
          message: 'This category token has already been awarded by your device.',
        },
        { status: 409 }
      );
    }

    console.error('API /api/vote Firestore error:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to record vote via Firestore transaction.',
      },
      { status: 500 }
    );
  }
}
