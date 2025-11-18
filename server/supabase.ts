// Server-side Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qvgciezihmcprqoybhdx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z2NpZXppaG1jcHJxb3liaGR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM5OTkyNCwiZXhwIjoyMDc4OTc1OTI0fQ.IFOsZvR8pPl9L6GhbfHS2JtIrq7cPbgYEP_iv_PjQmg';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z2NpZXppaG1jcHJxb3liaGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTk5MjQsImV4cCI6MjA3ODk3NTkyNH0.FCpXstSalud7d8Qy2nj6xL9qvn6QI0J7jto8t1nw7gI';

// Using fallback values if env vars not set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ Using fallback Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment for production.');
}

// Server-side client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client for user operations (uses anon key if available)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
