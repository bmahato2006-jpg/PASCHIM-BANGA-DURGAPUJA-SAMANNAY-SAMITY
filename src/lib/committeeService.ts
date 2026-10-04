import { supabase } from '@/lib/supabaseClient';

export interface CommitteeRecord {
  id: string;
  user_id: string;
  committee_name: string;
  slug: string;
  ward?: string;
  secretary_name?: string;
  contact_number?: string;
  email?: string;
  theme?: string;
  budget?: string;
  logo_url?: string;
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
 * Fetch the registered committee record matching user.id or email
 */
export async function getCommitteeByUser(
  userId?: string | null,
  email?: string | null
): Promise<{
  committee: CommitteeRecord | null;
  error?: any;
  tableMissing?: boolean;
}> {
  if (!userId && !email) return { committee: null };

  try {
    let query = supabase.from('committees').select('*');

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},email.eq.${email}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (error.code === 'PGRST205') {
        console.warn(
          "[committeeService] 'public.committees' table not found in Supabase. Please run supabase/schema.sql in your Supabase SQL editor."
        );
        return { committee: null, tableMissing: true, error };
      }
      return { committee: null, error };
    }

    return { committee: data as CommitteeRecord | null };
  } catch (err: any) {
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
 * Check if a committee with the given name or slug already exists in the database.
 */
export async function checkCommitteeExists(
  committeeName: string,
  slug?: string
): Promise<{ exists: boolean; conflictingName?: string; error?: any }> {
  const cleanName = committeeName.trim();
  const cleanSlug = slug || slugifyCommitteeName(cleanName);

  if (!cleanName) return { exists: false };

  try {
    // 1. Check exact or case-insensitive name match
    const { data: byName, error: nameError } = await supabase
      .from('committees')
      .select('id, committee_name, slug')
      .ilike('committee_name', cleanName)
      .maybeSingle();

    if (nameError && nameError.code !== 'PGRST116' && nameError.code !== 'PGRST205') {
      console.warn('Error checking committee name:', nameError);
    }

    if (byName) {
      return { exists: true, conflictingName: byName.committee_name };
    }

    // 2. Check slug match
    const { data: bySlug, error: slugError } = await supabase
      .from('committees')
      .select('id, committee_name, slug')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (slugError && slugError.code !== 'PGRST116' && slugError.code !== 'PGRST205') {
      console.warn('Error checking committee slug:', slugError);
    }

    if (bySlug) {
      return { exists: true, conflictingName: bySlug.committee_name };
    }

    return { exists: false };
  } catch (err: any) {
    console.error('checkCommitteeExists exception:', err);
    return { exists: false, error: err };
  }
}

/**
 * Insert a new committee record ensuring 100% uniqueness.
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
    const payload: Record<string, any> = {
      user_id: input.userId,
      committee_name: cleanName,
      slug: cleanSlug,
      ward: input.ward?.trim() || 'Ward 1',
      secretary_name: input.secretaryName?.trim() || 'Secretary',
      phone: input.contactNumber?.trim() || '',
      contact_number: input.contactNumber?.trim() || '',
      email: input.email?.trim() || '',
      theme: input.theme?.trim() || 'Traditional Sharodotsav',
      budget: '₹35 Lakhs',
    };

    let currentPayload = { ...payload };
    let data: any = null;
    let error: any = null;

    // Retry loop: If a column does not exist in the database table, remove it and retry
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await supabase
        .from('committees')
        .insert(currentPayload)
        .select()
        .single();

      data = res.data;
      error = res.error;

      if (!error) break;

      // Extract missing column name from PostgREST error
      const match =
        error.message?.match(/Could not find the '([^']+)' column/i) ||
        error.message?.match(/column "([^"]+)" of relation "committees" does not exist/i);

      if (match && match[1] && match[1] in currentPayload) {
        console.warn(
          `[committeeService] Column '${match[1]}' does not exist in Supabase 'committees' table. Retrying insert without it...`
        );
        delete currentPayload[match[1]];
        continue;
      }

      break;
    }

    if (error) {
      // Postgres error 23505 = unique_violation
      if (
        error.code === '23505' ||
        error.message?.toLowerCase().includes('unique') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        return {
          success: false,
          error: 'This Committee is already registered by another account.',
        };
      }
      return { success: false, error: error.message || 'Failed to create committee record.' };
    }

    return { success: true, committee: data as CommitteeRecord };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database error occurred during registration.' };
  }
}
