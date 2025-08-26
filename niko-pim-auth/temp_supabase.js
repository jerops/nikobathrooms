import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export function initializeSupabase() {
    if (!supabaseClient) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase configuration missing. Check environment variables.');
        }
        
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseClient;
}

export function getSupabase() {
    if (!supabaseClient) {
        throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
    }
    return supabaseClient;
}