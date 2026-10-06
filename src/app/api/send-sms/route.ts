import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { phone, committeeName } = await request.json();
    
    if (!phone) {
      return NextResponse.json(
        { 
          success: false, 
          result: { message: 'Phone number is required' } 
        },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10) || String(phone).trim();
    const cleanName = committeeName ? String(committeeName).trim() : 'Committee';

    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.warn('FAST2SMS_API_KEY is not defined in environment variables.');
      return NextResponse.json({
        success: false,
        result: { message: 'FAST2SMS_API_KEY is not defined in environment variables on Vercel' },
      });
    }

    const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: `Congrats! ${cleanName} is approved for Paschim Banga Durgapuja. Login to view your QR.`,
        language: 'english',
        flash: 0,
        numbers: String(cleanPhone).trim(),
      }),
    });

    const smsResult = await smsResponse.json().catch((err) => ({ 
      return: false, 
      message: err?.message || 'Invalid JSON response from Fast2SMS' 
    }));
    console.log('Fast2SMS Result:', smsResult);

    return NextResponse.json({
      success: smsResponse.ok && smsResult.return === true,
      result: smsResult,
    });
  } catch (error: any) {
    console.error('Fast2SMS error:', error);
    return NextResponse.json(
      { 
        success: false, 
        result: { message: error?.message || 'SMS Failed' } 
      },
      { status: 500 }
    );
  }
}
