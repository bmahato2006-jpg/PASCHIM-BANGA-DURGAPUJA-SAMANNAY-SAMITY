export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

// Default secure setup token (configurable via ADMIN_SEED_SECRET environment variable)
const SETUP_SECRET = process.env.ADMIN_SEED_SECRET || 'durgapur-puja-seed-2026';

const INITIAL_SEED_PANDALS = [
  {
    id: 'pandal-marxgunj',
    name: 'Marxgunj Sarbojanin Durga Puja',
    clubName: 'Marxgunj Sarbojanin Club',
    zone: 'Benachity Zone',
    ward: 'Ward 24',
    location: 'Benachity, Durgapur',
    nearLandmark: 'Near Benachity Market & Gandhi More',
    budget: '₹48 Lakhs',
    budgetNumber: 48,
    theme: 'Shilpa O Shristi: The Steel Symphony of Durgapur',
    themeDescription:
      'A breathtaking tribute to the industrial heritage of the Steel City. The pandal is intricately sculpted using recycled steel pipes, brass gears, and terracotta motifs.',
    presidentName: 'Subhasish Mukherjee',
    secretaryName: 'Debabrata Banerjee',
    contactNumber: '+91 94340 12891',
    establishedYear: 1968,
    coverImage: 'https://images.unsplash.com/photo-1601655781320-20593452243d?q=80&w=1200&auto=format&fit=crop',
    total_votes: 0,
    totalVotes: 0,
    votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
    visitsToday: 120,
    tags: ['Grand Heritage', 'Top Contender', 'Night Lighting'],
    isEcoFriendly: false,
    organizerEmail: 'marxgunj.puja@gmail.com',
  },
  {
    id: 'pandal-chaturanga',
    name: 'Chaturanga Durga Puja Samiti',
    clubName: 'Chaturanga Cultural Association',
    zone: 'City Centre Zone',
    ward: 'Ward 18',
    location: 'City Centre, Durgapur',
    nearLandmark: 'Adjacent to Junction Mall & City Centre Plaza',
    budget: '₹65 Lakhs',
    budgetNumber: 65,
    theme: 'Aalo O Andharir Rong (Light & Cosmic Shadows)',
    themeDescription:
      'An immersive experiential pavilion created with fiber-optic Chandannagar illumination and reflection pools showcasing the triumph of divine radiance.',
    presidentName: 'Aniruddha Roy Chowdhury',
    secretaryName: 'Suman Kalyan Roy',
    contactNumber: '+91 98321 44520',
    establishedYear: 1982,
    coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    total_votes: 0,
    totalVotes: 0,
    votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
    visitsToday: 210,
    tags: ['City Centre Hub', 'Spectacular Illumination'],
    isEcoFriendly: false,
    organizerEmail: 'chaturanga.puja@gmail.com',
  },
  {
    id: 'pandal-agrani',
    name: 'Agrani Sangha Durga Puja',
    clubName: 'Agrani Sangha',
    zone: 'B-Zone',
    ward: 'Ward 12',
    location: 'B-Zone, Durgapur',
    nearLandmark: 'Opposite B-Zone Kali Bari Ground',
    budget: '₹38 Lakhs',
    budgetNumber: 38,
    theme: 'Sobujer Ahoban: Nature Embraces Divinity',
    themeDescription:
      'A 100% bio-degradable pavilion created from bamboo weave, clay, and terracotta plates to foster environmental awareness.',
    presidentName: 'Sourav Ganguly',
    secretaryName: 'Pranabesh Sen',
    contactNumber: '+91 94341 88921',
    establishedYear: 1974,
    coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop',
    total_votes: 0,
    totalVotes: 0,
    votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
    visitsToday: 95,
    tags: ['100% Eco-Friendly', 'Clay Art', 'Prakriti Bandhob'],
    isEcoFriendly: true,
    organizerEmail: 'agrani.sangha@gmail.com',
  },
];

async function handleSeed(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, message: 'Firebase Admin Firestore is not initialized.' },
        { status: 500 }
      );
    }

    // Security Verification: Require valid secret in header or query parameter
    const providedSecret =
      request.headers.get('x-admin-secret') ||
      request.nextUrl.searchParams.get('secret') ||
      '';

    if (providedSecret !== SETUP_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized: Invalid or missing setup authorization secret.',
        },
        { status: 401 }
      );
    }

    // Batch write to Firestore collection 'pandals'
    const batch = adminDb.batch();
    const serverTime = FieldValue.serverTimestamp();

    for (const pandal of INITIAL_SEED_PANDALS) {
      const docRef = adminDb.collection('pandals').doc(pandal.id);
      batch.set(
        docRef,
        {
          ...pandal,
          created_at: serverTime,
          updated_at: serverTime,
        },
        { merge: true }
      );
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${INITIAL_SEED_PANDALS.length} pandals into Firestore 'pandals' collection.`,
      seededCount: INITIAL_SEED_PANDALS.length,
      pandals: INITIAL_SEED_PANDALS.map((p) => ({
        id: p.id,
        name: p.name,
        zone: p.zone,
        total_votes: p.total_votes,
      })),
    });
  } catch (err: any) {
    console.error('Seed pandals error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to seed pandals.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleSeed(request);
}

export async function GET(request: NextRequest) {
  return handleSeed(request);
}
