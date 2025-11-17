import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL && !import.meta.env.PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ Supabase URL and Anon Key must be set in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  console.warn('⚠️ Authentication will not work until Supabase is configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

