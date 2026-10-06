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
    const rawCategory = body.category ? body.category.toLowerCase().trim() : 'overall';
    const category = rawCategory;
    const shortCategory = category.replace(/^best_/, '');

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

    // Optional category token lock documents to prevent duplicate usage of the same category token
    const categoryDocRef = category !== 'overall'
      ? adminDb.collection('votes_log').doc(`${user_uid}_cat_${category}`)
      : null;
    const shortCategoryDocRef = category !== 'overall' && shortCategory !== category
      ? adminDb.collection('votes_log').doc(`${user_uid}_cat_${shortCategory}`)
      : null;

    // References to the target pandal and committee documents
    const pandalDocRef = adminDb.collection('pandals').doc(pandal_id);
    const committeeDocRef = adminDb.collection('committees').doc(pandal_id);

    // Run atomic transaction strictly adhering to Firestore rule: ALL READS BEFORE ALL WRITES
    const result = await adminDb.runTransaction(async (transaction: Transaction) => {
      // =========================================================================
      // 1. ALL READS FIRST (STRICT REQUIREMENT: NO READS CAN OCCUR AFTER WRITES)
      // =========================================================================
      const [
        existingVote,
        existingCategoryVote,
        existingShortCategoryVote,
        pandalDoc,
        committeeDoc,
      ] = await Promise.all([
        transaction.get(voteDocRef),
        categoryDocRef ? transaction.get(categoryDocRef) : Promise.resolve(null),
        shortCategoryDocRef ? transaction.get(shortCategoryDocRef) : Promise.resolve(null),
        transaction.get(pandalDocRef),
        transaction.get(committeeDocRef),
      ]);

      // =========================================================================
      // 2. LOGIC & VALIDATION CHECKS (PERFORMED AFTER ALL READS ARE COMPLETED)
      // =========================================================================
      // Validation Check 1: User has already cast a vote for this specific pandal
      if (existingVote.exists) {
        throw new Error('DUPLICATE_PANDAL_VOTE');
      }

      // Validation Check 2: Category token already exhausted by this user device
      if (
        (existingCategoryVote && existingCategoryVote.exists) ||
        (existingShortCategoryVote && existingShortCategoryVote.exists)
      ) {
        throw new Error('DUPLICATE_CATEGORY_TOKEN');
      }

      // =========================================================================
      // 3. ALL WRITES LAST (STRICT REQUIREMENT: PERFORMED AFTER ALL READS & CHECKS)
      // =========================================================================
      const serverTime = FieldValue.serverTimestamp();

      // Write 1: Record primary vote document in votes_log
      transaction.set(voteDocRef, {
        id: voteDocId,
        pandal_id,
        user_uid,
        category,
        timestamp: serverTime,
      });

      // Write 2: Record category token locks in votes_log to prevent double awarding
      if (categoryDocRef) {
        transaction.set(categoryDocRef, {
          id: categoryDocRef.id,
          pandal_id,
          user_uid,
          category,
          timestamp: serverTime,
        });
      }
      if (shortCategoryDocRef) {
        transaction.set(shortCategoryDocRef, {
          id: shortCategoryDocRef.id,
          pandal_id,
          user_uid,
          category: shortCategory,
          timestamp: serverTime,
        });
      }

      // Prepare incremental payload for vote counts
      const updatePayload: Record<string, any> = {
        total_votes: FieldValue.increment(1),
        updated_at: serverTime,
      };
      if (category && category !== 'overall') {
        updatePayload[`votes.${category}`] = FieldValue.increment(1);
        if (shortCategory !== category) {
          updatePayload[`votes.${shortCategory}`] = FieldValue.increment(1);
        }
      }

      // Write 3: Atomically increment or initialize pandal document
      if (pandalDoc.exists) {
        transaction.update(pandalDocRef, updatePayload);
      } else {
        const initialVotes: Record<string, number> = {};
        if (category && category !== 'overall') {
          initialVotes[category] = 1;
          if (shortCategory !== category) {
            initialVotes[shortCategory] = 1;
          }
        }
        transaction.set(
          pandalDocRef,
          {
            id: pandal_id,
            name: pandal_id,
            total_votes: 1,
            votes: initialVotes,
            created_at: serverTime,
          },
          { merge: true }
        );
      }

      // Write 4: Atomically synchronize matching committees document if present
      if (committeeDoc.exists) {
        transaction.update(committeeDocRef, updatePayload);
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
