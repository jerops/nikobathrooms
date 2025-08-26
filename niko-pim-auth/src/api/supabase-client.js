import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export function initializeSupabase() {
    if (!supabaseClient) {
        const supabaseUrl = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk';
        
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
