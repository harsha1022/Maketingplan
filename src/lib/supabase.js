import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here';

// Create a client; if not configured, operations will fail gracefully
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Safe Supabase call — returns { data, error } and handles unconfigured state.
 */
export async function safeQuery(fn) {
  if (!supabase) {
    return {
      data: null,
      error: { message: 'Supabase is not configured. See .env.example.' },
    };
  }
  try {
    return await fn(supabase);
  } catch (err) {
    return { data: null, error: { message: err.message || 'Unknown error' } };
  }
}
