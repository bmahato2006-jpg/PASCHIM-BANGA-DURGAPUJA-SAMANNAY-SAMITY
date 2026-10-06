export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isSuperAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, message: 'Firebase Admin Firestore is not initialized on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { committeeId, adminEmail } = body;

    // 1. Authorize: Verify admin authority with designated Super Admin check
    if (!adminEmail || !isSuperAdmin(adminEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি মুছে ফেলতে পারেন। (Unauthorized: Super Admin access required)',
        },
        { status: 403 }
      );
    }

    // 2. Validate input
    if (!committeeId || typeof committeeId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'কমিটি আইডি প্রদান করা আবশ্যক। (Committee ID is required)',
        },
        { status: 400 }
      );
    }

    const cleanId = committeeId.trim();

    // 3. Delete from committees collection
    await adminDb.collection('committees').doc(cleanId).delete();

    // 4. Also delete matching pandal entry from pandals collection if present
    try {
      await adminDb.collection('pandals').doc(cleanId).delete();
    } catch (pandalErr) {
      console.warn('Notice deleting pandal document:', pandalErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `কমিটি "${cleanId}" সফলভাবে ডাটাবেস থেকে মুছে ফেলা হয়েছে। (Committee deleted successfully)`,
        data: { committeeId: cleanId },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API /api/admin/delete exception:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'কমিটি মুছে ফেলার সময় ত্রুটি ঘটেছে। (An error occurred while deleting the committee)',
      },
      { status: 500 }
    );
  }
}
