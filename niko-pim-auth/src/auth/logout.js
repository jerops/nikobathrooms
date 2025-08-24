import { getSupabase } from '../api/supabase-client.js';

export async function logoutUser() {
    const supabase = getSupabase();
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        const currentDomain = window.location.origin;
        window.location.href = `${currentDomain}/dev/app/auth/log-in`;
        
        return { success: true };
    } catch (error) {
        console.error('Logout failed:', error);
        return { success: false, error: error.message };
    }
}