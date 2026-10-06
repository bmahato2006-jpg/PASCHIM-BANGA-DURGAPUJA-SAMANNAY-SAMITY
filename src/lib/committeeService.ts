import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where,
  serverTimestamp 
} from '@/lib/firebase';

export interface CommitteeRecord {
  id: string;
  user_id: string;
  userId?: string;
  uid?: string;
  committee_name: string;
  slug: string;
  ward?: string;
  secretary_name?: string;
  contact_number?: string;
  email?: string;
  theme?: string;
  budget?: string;
  logo_url?: string;
  status?: 'pending' | 'approved' | string;
  total_votes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterCommitteeInput {
  userId: string;
  committeeName: string;
  slug?: string;
  ward?: string;
  secretaryName?: string;
  contactNumber?: string;
  email?: string;
  theme?: string;
}

// Helper to convert any committee name into a clean, normalized slug
export function slugifyCommitteeName(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Fetch the registered committee record strictly matching user UID from Firestore
 */
export async function getCommitteeByUser(
  userId?: string | null,
  email?: string | null
): Promise<{
  committee: CommitteeRecord | null;
  error?: any;
  tableMissing?: boolean;
}> {
  if (!userId) return { committee: null };

  try {
    const committeesRef = collection(db, 'committees');

    // 1. Strict query on user_id (primary field enforcing 1-to-1 mapping)
    const q1 = query(committeesRef, where('user_id', '==', userId));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const d = snap1.docs[0];
      return {
        committee: {
          id: d.id,
          ...d.data(),
        } as CommitteeRecord,
      };
    }

    // 2. Query on userId (alias)
    const q2 = query(committeesRef, where('userId', '==', userId));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const d = snap2.docs[0];
      return {
        committee: {
          id: d.id,
          ...d.data(),
        } as CommitteeRecord,
      };
    }

    // 3. Query on uid (alias)
    const q3 = query(committeesRef, where('uid', '==', userId));
    const snap3 = await getDocs(q3);
    if (!snap3.empty) {
      const d = snap3.docs[0];
      return {
        committee: {
          id: d.id,
          ...d.data(),
        } as CommitteeRecord,
      };
    }

    // 4. Direct document ID lookup if doc was created with ID == userId
    const directDoc = await getDoc(doc(db, 'committees', userId));
    if (directDoc.exists()) {
      const data = directDoc.data();
      if (!data.user_id || data.user_id === userId || data.userId === userId || data.uid === userId) {
        return {
          committee: {
            id: directDoc.id,
            ...data,
          } as CommitteeRecord,
        };
      }
    }

    return { committee: null };
  } catch (err: any) {
    console.warn('getCommitteeByUser notice:', err?.message || err);
    return { committee: null, error: err };
  }
}

/**
 * Fetch the registered committee record matching user.id
 */
export async function getCommitteeByUserId(userId: string): Promise<{
  committee: CommitteeRecord | null;
  error?: any;
  tableMissing?: boolean;
}> {
  return getCommitteeByUser(userId);
}

/**
 * Check if a committee with the given name or slug already exists in Firestore.
 */
export async function checkCommitteeExists(
  committeeName: string,
  slug?: string
): Promise<{ exists: boolean; conflictingName?: string; error?: any }> {
  const cleanName = committeeName.trim();
  const cleanSlug = slug || slugifyCommitteeName(cleanName);

  if (!cleanName) return { exists: false };

  try {
    const slugDoc = await getDoc(doc(db, 'committees', cleanSlug));
    if (slugDoc.exists()) {
      return { exists: true, conflictingName: slugDoc.data().committee_name };
    }

    const committeesRef = collection(db, 'committees');
    const snapshot = await getDocs(committeesRef);
    for (const d of snapshot.docs) {
      const data = d.data();
      if (
        data.committee_name?.toLowerCase().trim() === cleanName.toLowerCase() ||
        data.slug === cleanSlug
      ) {
        return { exists: true, conflictingName: data.committee_name };
      }
    }

    return { exists: false };
  } catch (err: any) {
    console.error('checkCommitteeExists exception:', err);
    return { exists: false, error: err };
  }
}

/**
 * Insert a new committee record in Firestore and synchronize with the pandals collection.
 */
export async function registerCommittee(input: RegisterCommitteeInput): Promise<{
  success: boolean;
  committee?: CommitteeRecord;
  error?: string;
}> {
  const cleanName = input.committeeName.trim();
  const cleanSlug = input.slug || slugifyCommitteeName(cleanName);

  if (!cleanName) {
    return { success: false, error: 'Committee name is required.' };
  }

  // Pre-insert verification
  const check = await checkCommitteeExists(cleanName, cleanSlug);
  if (check.exists) {
    return {
      success: false,
      error: 'This Committee is already registered by another account.',
    };
  }

  try {
    const committeeDocRef = doc(db, 'committees', cleanSlug);
    const pandalDocRef = doc(db, 'pandals', cleanSlug);

    const record: CommitteeRecord = {
      id: cleanSlug,
      user_id: input.userId,
      committee_name: cleanName,
      slug: cleanSlug,
      ward: input.ward?.trim() || 'Ward 1',
      secretary_name: input.secretaryName?.trim() || 'Secretary',
      contact_number: input.contactNumber?.trim() || '',
      email: input.email?.trim() || '',
      theme: input.theme?.trim() || 'Traditional Durga Puja',
      budget: '₹35 Lakhs',
      status: 'pending',
      total_votes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save in committees collection with user_id, userId, and uid for strict querying compatibility
    await setDoc(committeeDocRef, {
      ...record,
      status: 'pending',
      userId: input.userId,
      uid: input.userId,
      server_created_at: serverTimestamp(),
    });

    // Also seed into pandals collection (total_votes: 0) for discoverability and live leaderboard
    await setDoc(pandalDocRef, {
      id: cleanSlug,
      name: cleanName,
      clubName: cleanName,
      ward: record.ward,
      theme: record.theme,
      status: 'pending',
      total_votes: 0,
      votes: { idol: 0, theme: 0, lighting: 0, eco: 0 },
      server_created_at: serverTimestamp(),
    }, { merge: true });

    return { success: true, committee: record };
  } catch (err: any) {
    console.error('registerCommittee error:', err);
    return { success: false, error: err?.message || 'Database error occurred during registration.' };
  }
}
