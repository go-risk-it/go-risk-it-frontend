/**
 * Supabase client singleton. Initialized once at module load using public
 * environment variables and shared across the app for authentication
 * and any direct Supabase interactions.
 */
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Pre-configured Supabase client using the project's public anon key.
 * Used primarily for auth (sign-in, sign-up, session management). The anon
 * key is safe to expose client-side as Supabase enforces Row Level Security.
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
