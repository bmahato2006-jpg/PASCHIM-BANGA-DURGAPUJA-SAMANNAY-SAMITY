import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to normalize category name matching postgres check constraint ('best_idol', 'best_theme', 'best_lighting', 'best_eco')
function normalizeCategory(category: string): string {
  const c = category.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (c === 'idol' || c === 'best_idol') return 'best_idol';
  if (c === 'theme' || c === 'best_theme') return 'best_theme';
  if (c === 'lighting' || c === 'best_lighting') return 'best_lighting';
  if (c === 'eco' || c === 'best_eco' || c === 'eco_friendly' || c === 'best_eco_friendly') return 'best_eco';
  return c;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_SUPABASE_URL
        : 'https://ejpuaelbkmdsqrzwsfzj.supabase.co';

    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase configuration: SUPABASE_SERVICE_ROLE_KEY is required.');
      return NextResponse.json(
        { success: false, message: 'Server configuration error: missing Supabase credentials' },
        { status: 500 }
      );
    }

    // Initialize the Supabase client using service_role key to safely bypass RLS from the server side
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const body = await request.json();
    const { deviceId, voterUid, pandalId, category } = body;
    const targetDeviceId = deviceId || voterUid;

    if (!targetDeviceId || !pandalId || !category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: deviceId, pandalId, and category are required.',
        },
        { status: 400 }
      );
    }

    const normalizedCategory = normalizeCategory(category);

    // Attempt to insert these values into the 'votes' table
    const { data, error } = await supabase.from('votes').insert({
      device_id: targetDeviceId,
      pandal_id: pandalId,
      category: normalizedCategory,
    });

    if (error) {
      // Catch specific Postgres unique constraint violation error (code '23505')
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            message: 'You have already voted for this pandal or used this category token.',
          },
          { status: 409 }
        );
      }

      console.error('Supabase vote insertion error:', error);
      return NextResponse.json(
        {
          success: false,
          message: error.message || 'Database error occurred while recording vote.',
        },
        { status: 500 }
      );
    }

    // On success, return a 200 OK JSON response
    return NextResponse.json(
      {
        success: true,
        message: 'Vote cast successfully!',
        data,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API /api/vote error:', err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
