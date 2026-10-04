/**
 * Supabase Database Automated Setup Script
 * Paschim Banga DurgaPuja Samannay Samity
 *
 * Automates the creation of the public.committees table directly
 * using the postgres client without requiring the Supabase SQL Editor.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Helper to load environment variables from .env.local or .env if not set in process.env
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      // Remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Attempt to load .env.local and .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');
loadEnvFile(envLocalPath);
loadEnvFile(envPath);

async function setupDatabase() {
  console.log('Database setup initiated...');

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('\n========================================================================');
    console.error('⚠️  REMINDER: DATABASE_URL is missing in your environment!');
    console.error('------------------------------------------------------------------------');
    console.error('Please ensure your DATABASE_URL is present in your .env.local file:');
    console.error('');
    console.error('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres');
    console.error('');
    console.error('You can find this connection string in your Supabase Dashboard:');
    console.error('Project Settings -> Database -> Connection string -> URI (Transaction / Session)');
    console.error('========================================================================\n');
    process.exit(1);
  }

  // Configure Postgres connection with SSL support for Supabase
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // SQL execution logic to create public.committees table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.committees (
         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
         user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
         committee_name TEXT NOT NULL,
         slug TEXT NOT NULL UNIQUE,
         secretary_name TEXT NOT NULL,
         ward TEXT NOT NULL,
         phone TEXT NOT NULL,
         theme TEXT,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Supplementary columns to support full application profile features
      ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS contact_number TEXT;
      ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS email TEXT;
      ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS budget TEXT DEFAULT '₹35 Lakhs';
      ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS logo_url TEXT;
      ALTER TABLE public.committees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

      -- Indexes for performance & case-insensitive matching
      CREATE UNIQUE INDEX IF NOT EXISTS committees_committee_name_lower_idx ON public.committees (LOWER(TRIM(committee_name)));
      CREATE UNIQUE INDEX IF NOT EXISTS committees_slug_lower_idx ON public.committees (LOWER(TRIM(slug)));
      CREATE INDEX IF NOT EXISTS committees_user_id_idx ON public.committees (user_id);

      -- Enable Row Level Security (RLS)
      ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

      -- Idempotent RLS Policies for Supabase Client Access
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'committees' AND policyname = 'Allow public read access to committees'
        ) THEN
          CREATE POLICY "Allow public read access to committees" ON public.committees FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'committees' AND policyname = 'Allow authenticated users to insert their committee'
        ) THEN
          CREATE POLICY "Allow authenticated users to insert their committee" ON public.committees FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'committees' AND policyname = 'Allow organizers to update their own committee'
        ) THEN
          CREATE POLICY "Allow organizers to update their own committee" ON public.committees FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        END IF;
      END $$;
    `;

    console.log('Executing schema query...');
    await client.query(createTableQuery);

    console.log('Table created successfully!');
    console.log('\n✅ Supabase "committees" table is ready for production use.');
    console.log('ℹ️  Reminder: Ensure your DATABASE_URL is present in your .env.local file across all environments.\n');
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    if (err.message.includes('password authentication failed') || err.message.includes('Tenant or user not found')) {
      console.error('👉 Tip: Check your database password and project ref in DATABASE_URL.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
