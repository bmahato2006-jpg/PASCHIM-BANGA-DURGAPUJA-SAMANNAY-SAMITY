export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = body.phone || body.contact_number || body.contactNumber || '';
    const committeeName = body.committeeName || body.committee_name || 'Durga Puja Committee';

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    // Clean phone number: Extract 10-digit mobile number or fallback to trimmed input
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10) || String(phone).trim();

    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.warn('FAST2SMS_API_KEY is not defined in environment variables.');
      return NextResponse.json({
        success: false,
        message: 'FAST2SMS_API_KEY is not configured in .env.local',
      });
    }

    const messageText = `Congratulations! Your Durga Puja Committee ${committeeName} has been approved. You can now login to view your Live Voting QR Code.`;

    // Construct urlencoded body according to Fast2SMS API requirements
    const postBody = `route=v3&sender_id=FTWSMS&message=${encodeURIComponent(messageText)}&language=english&flash=0&numbers=${encodeURIComponent(cleanPhone)}`;

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postBody,
    });

    const data = await response.json().catch(() => ({}));
    console.log('Fast2SMS API response:', data);

    if (response.ok && (data.return === true || data.status_code === 200)) {
      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully!',
        data,
      });
    } else {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Fast2SMS dispatch failed.';

      return NextResponse.json({
        success: false,
        message: errorMsg,
        data,
      });
    }
  } catch (error: any) {
    console.error('Error sending SMS via Fast2SMS API:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
