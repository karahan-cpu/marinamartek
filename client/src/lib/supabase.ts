import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
// Vite uses VITE_ prefix for client-side env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvgciezihmcprqoybhdx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z2NpZXppaG1jcHJxb3liaGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTk5MjQsImV4cCI6MjA3ODk3NTkyNH0.FCpXstSalud7d8Qy2nj6xL9qvn6QI0J7jto8t1nw7gI';

// Using fallback values if env vars not set
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment for production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
