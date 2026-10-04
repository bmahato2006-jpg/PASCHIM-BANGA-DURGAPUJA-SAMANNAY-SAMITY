-- ==============================================================================
-- Paschim Banga DurgaPuja Samannay Samity
-- Schema: public.committees
-- Complete, final schema matching all fields sent by the application
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  committee_name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  secretary_name TEXT NOT NULL,
  ward TEXT NOT NULL,
  phone TEXT NOT NULL,
  contact_number TEXT,
  email TEXT,
  theme TEXT,
  budget TEXT DEFAULT '₹35 Lakhs',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- In case the table already existed with missing columns, add them safely:
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS contact_number TEXT;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS budget TEXT DEFAULT '₹35 Lakhs';
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Indexes for lightning-fast queries and case-insensitive uniqueness checks
CREATE UNIQUE INDEX IF NOT EXISTS committees_committee_name_lower_idx ON public.committees (LOWER(TRIM(committee_name)));
CREATE UNIQUE INDEX IF NOT EXISTS committees_slug_lower_idx ON public.committees (LOWER(TRIM(slug)));
CREATE INDEX IF NOT EXISTS committees_user_id_idx ON public.committees (user_id);
CREATE INDEX IF NOT EXISTS committees_email_idx ON public.committees (email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to committees" ON public.committees;
  DROP POLICY IF EXISTS "Allow authenticated users to insert their committee" ON public.committees;
  DROP POLICY IF EXISTS "Allow organizers to update their own committee" ON public.committees;
  DROP POLICY IF EXISTS "Allow organizers to delete their own committee" ON public.committees;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- 1. Anyone (public devotees & voters) can read verified committees
CREATE POLICY "Allow public read access to committees"
  ON public.committees
  FOR SELECT
  USING (true);

-- 2. Authenticated users can insert their own committee record
CREATE POLICY "Allow authenticated users to insert their committee"
  ON public.committees
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Organizers can update their own committee record
CREATE POLICY "Allow organizers to update their own committee"
  ON public.committees
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Organizers can delete their own committee record
CREATE POLICY "Allow organizers to delete their own committee"
  ON public.committees
  FOR DELETE
  USING (auth.uid() = user_id);
