export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { isSuperAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { committeeId, phone, committeeName, adminEmail } = body;

    // 1. Authorize: If adminEmail is provided, verify Super Admin privileges
    if (adminEmail && !isSuperAdmin(adminEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি অনুমোদন করতে পারেন। (Unauthorized: Super Admin access required)',
        },
        { status: 403 }
      );
    }

    // 2. Validate committeeId
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

    // 3. Resolve committee details and phone number
    let resolvedName = committeeName ? String(committeeName).trim() : '';
    let resolvedPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';

    // If phone or name missing, look up from Firestore
    if ((!resolvedPhone || !resolvedName) && adminDb) {
      try {
        const committeeDoc = await adminDb.collection('committees').doc(cleanId).get();
        if (committeeDoc.exists) {
          const docData = committeeDoc.data() || {};
          if (!resolvedName) {
            resolvedName =
              docData.committee_name ||
              docData.name ||
              docData.clubName ||
              cleanId;
          }
          if (!resolvedPhone) {
            const raw =
              docData.phone ||
              docData.contact_number ||
              docData.contactNumber ||
              docData.phoneNumber ||
              '';
            resolvedPhone = String(raw).replace(/\D/g, '').slice(-10);
          }
        }
      } catch (lookupErr) {
        console.warn('Notice querying committee document details:', lookupErr);
      }
    }

    if (!resolvedName) {
      resolvedName = 'Durga Puja Committee';
    }

    // 4. Update committee status to 'approved' using Firebase Admin SDK (with client SDK fallback)
    let dbUpdated = false;

    if (adminDb) {
      try {
        const serverTime = FieldValue.serverTimestamp();
        await adminDb.collection('committees').doc(cleanId).update({
          status: 'approved',
          approved_at: serverTime,
          approved_by: adminEmail ? String(adminEmail).trim().toLowerCase() : 'super-admin',
          updated_at: serverTime,
        });

        // Also synchronize status in the pandals collection if document exists
        try {
          const pandalRef = adminDb.collection('pandals').doc(cleanId);
          const pandalDoc = await pandalRef.get();
          if (pandalDoc.exists) {
            await pandalRef.update({
              status: 'approved',
              approved_at: serverTime,
            });
          }
        } catch (pandalErr) {
          console.warn('Syncing status to pandals collection notice:', pandalErr);
        }

        dbUpdated = true;
      } catch (adminErr) {
        console.warn('Admin SDK updateDoc notice, trying client SDK fallback:', adminErr);
      }
    }

    if (!dbUpdated) {
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'committees', cleanId), {
          status: 'approved',
        });
        try {
          await updateDoc(doc(db, 'pandals', cleanId), {
            status: 'approved',
          });
        } catch {}
        dbUpdated = true;
      } catch (clientErr: any) {
        console.error('Failed to update committee in database:', clientErr);
        return NextResponse.json(
          {
            success: false,
            message: clientErr?.message || 'ডাটাবেসে কমিটি অনুমোদন আপডেট করতে ব্যর্থ হয়েছে। (Database update failed)',
          },
          { status: 500 }
        );
      }
    }

    // 5. Trigger Fast2SMS API using JSON and the 'q' (Quick) Route
    const apiKey = process.env.FAST2SMS_API_KEY || '';
    let smsSent = false;
    let smsData: any = null;
    const phoneToSend = resolvedPhone || String(phone || '').trim();
    const nameToSend = resolvedName || committeeName || 'Committee';

    if (apiKey && phoneToSend) {
      try {
        const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: `Congrats! ${nameToSend} is approved for Paschim Banga Durgapuja.`,
            language: 'english',
            flash: 0,
            numbers: String(phoneToSend).trim(),
          }),
        });

        const smsResult = await smsResponse.json().catch(() => ({}));
        console.log('Fast2SMS Response:', smsResult);
        smsData = smsResult;

        if (smsResponse.ok && (smsResult.return === true || smsResult.status_code === 200)) {
          smsSent = true;
        }
      } catch (smsErr) {
        console.error('Fast2SMS dispatch error:', smsErr);
      }
    } else {
      console.warn('Fast2SMS skipped. API Key present?', !!apiKey, 'Phone present?', !!phoneToSend);
    }

    return NextResponse.json(
      {
        success: true,
        message: smsSent
          ? 'Approved & SMS Sent!'
          : 'Approved successfully!',
        data: {
          committeeId: cleanId,
          committeeName: resolvedName,
          phone: resolvedPhone || null,
          status: 'approved',
          smsSent,
          smsData,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API /api/admin/approve exception:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'কমিটি অনুমোদন করার সময় ত্রুটি ঘটেছে। (An error occurred while approving the committee)',
      },
      { status: 500 }
    );
  }
}
