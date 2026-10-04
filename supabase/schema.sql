-- ==============================================================================
-- Paschim Banga DurgaPuja Samannay Samity
-- Schema: public.committees
-- Enforces strict UNIQUE committee_name, UNIQUE slug, and 1 committee per user.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  committee_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  ward TEXT,
  secretary_name TEXT,
  contact_number TEXT,
  email TEXT,
  theme TEXT,
  budget TEXT DEFAULT '₹35 Lakhs',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Strict Uniqueness Constraints to prevent duplicate committees
  CONSTRAINT committees_committee_name_unique UNIQUE (committee_name),
  CONSTRAINT committees_slug_unique UNIQUE (slug),
  CONSTRAINT committees_user_id_unique UNIQUE (user_id)
);

-- Case-insensitive unique indexes for committee_name and slug
CREATE UNIQUE INDEX IF NOT EXISTS committees_committee_name_lower_idx ON public.committees (LOWER(TRIM(committee_name)));
CREATE UNIQUE INDEX IF NOT EXISTS committees_slug_lower_idx ON public.committees (LOWER(TRIM(slug)));
CREATE INDEX IF NOT EXISTS committees_user_id_idx ON public.committees (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to committees" ON public.committees;
  DROP POLICY IF EXISTS "Allow authenticated users to insert their committee" ON public.committees;
  DROP POLICY IF EXISTS "Allow organizers to update their own committee" ON public.committees;
  DROP POLICY IF EXISTS "Allow organizers to delete their own committee" ON public.committees;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- 1. Anyone (public & voters) can read verified committees
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
