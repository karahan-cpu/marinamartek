import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
// Vite uses VITE_ prefix for client-side env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvgciezihmcprqoybhdx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Warn if using fallback URL (but don't throw - allow app to load)
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('⚠️ VITE_SUPABASE_URL not set, using fallback. Set it in Vercel environment variables.');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is required! Set it in Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
