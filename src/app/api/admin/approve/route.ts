export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
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
          message: 'অননুমোদিত প্রবেশাধিকার! শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন কমিটি অনুমোদন করতে পারেন। (Unauthorized: Super Admin access required)',
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

    // 3. Fetch committee document from Firestore
    const committeeDocRef = adminDb.collection('committees').doc(cleanId);
    const committeeDoc = await committeeDocRef.get();

    if (!committeeDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: `কমিটি খুঁজে পাওয়া যায়নি (Committee "${cleanId}" not found).`,
        },
        { status: 404 }
      );
    }

    const committeeData = committeeDoc.data() || {};
    const committeeName =
      committeeData.committee_name ||
      committeeData.name ||
      committeeData.clubName ||
      'Durga Puja Committee';

    // Extract registered phone number
    const phoneNumber =
      committeeData.contact_number ||
      committeeData.phone ||
      committeeData.contactNumber ||
      committeeData.phoneNumber ||
      '';

    const serverTime = FieldValue.serverTimestamp();

    // 4. Securely update committee's status to 'approved'
    await committeeDocRef.update({
      status: 'approved',
      approved_at: serverTime,
      approved_by: adminEmail.trim().toLowerCase(),
      updated_at: serverTime,
    });

    // Also synchronize status in the pandals collection if the document exists
    try {
      const pandalDocRef = adminDb.collection('pandals').doc(cleanId);
      const pandalDoc = await pandalDocRef.get();
      if (pandalDoc.exists) {
        await pandalDocRef.update({
          status: 'approved',
          approved_at: serverTime,
        });
      }
    } catch (pandalErr) {
      console.warn('Syncing status to pandals collection notice:', pandalErr);
    }

    // =========================================================================
    // 5. SMS NOTIFICATION SERVICE (Fast2SMS / Twilio Integration Setup)
    // =========================================================================
    // Approved Durga Puja Notification SMS message:
    const smsMessage = `Congratulations! Your Durga Puja Committee ${committeeName} has been approved. You can now log in to view your Live Voting QR Code.`;

    let smsSent = false;
    let smsProvider = 'none';

    // -------------------------------------------------------------------------
    // OPTION A: Fast2SMS API Integration (India SMS Gateway)
    // To enable live cellular SMS delivery, set FAST2SMS_API_KEY in .env.local:
    // -------------------------------------------------------------------------
    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || ''; // <-- PASTE YOUR FAST2SMS API KEY HERE OR IN .env.local

    // -------------------------------------------------------------------------
    // OPTION B: Twilio API Integration (Global SMS Gateway)
    // Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local:
    // -------------------------------------------------------------------------
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

    if (phoneNumber) {
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      const tenDigitPhone = digitsOnly.slice(-10);

      if (FAST2SMS_API_KEY) {
        try {
          const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
              authorization: FAST2SMS_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              route: 'q',
              message: smsMessage,
              language: 'english',
              flash: 0,
              numbers: tenDigitPhone,
            }),
          });
          const fast2smsData = await fast2smsRes.json().catch(() => ({}));
          smsSent = fast2smsRes.ok;
          smsProvider = 'fast2sms';
          console.log('Fast2SMS dispatch response:', fast2smsData);
        } catch (smsErr) {
          console.error('Fast2SMS dispatch error:', smsErr);
        }
      } else if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
        try {
          const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
          const basicAuth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
          const twilioParams = new URLSearchParams({
            To: phoneNumber.startsWith('+') ? phoneNumber : `+91${tenDigitPhone}`,
            From: TWILIO_PHONE_NUMBER,
            Body: smsMessage,
          });

          const twilioRes = await fetch(twilioEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: twilioParams.toString(),
          });
          smsSent = twilioRes.ok;
          smsProvider = 'twilio';
        } catch (smsErr) {
          console.error('Twilio dispatch error:', smsErr);
        }
      } else {
        // Safe development placeholder logging
        console.log(`[SMS NOTIFICATION DISPATCH]`);
        console.log(`  To Phone: ${phoneNumber} (${tenDigitPhone})`);
        console.log(`  Committee: ${committeeName}`);
        console.log(`  Message: "${smsMessage}"`);
        console.log(`  Configuration Note: Add FAST2SMS_API_KEY or Twilio credentials in .env.local to send live cellular messages.`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `কমিটি "${committeeName}" সফলভাবে অনুমোদিত হয়েছে এবং এসএমএস বিজ্ঞপ্তি প্রস্তুত করা হয়েছে। (Committee "${committeeName}" successfully approved!)`,
        data: {
          committeeId: cleanId,
          status: 'approved',
          phone: phoneNumber || null,
          smsSent,
          smsProvider,
          notificationMessage: smsMessage,
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
