import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config/constants.js';

let supabaseClient = null;

export function initializeSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      CONFIG.SUPABASE.URL,
      CONFIG.SUPABASE.ANON_KEY
    );
  }
  return supabaseClient;
}

export function getSupabase() {
  if (!supabaseClient) {
    throw new Error('Supabase not initialized. Call initializeSupabase() first.');
  }
  return supabaseClient;
}
