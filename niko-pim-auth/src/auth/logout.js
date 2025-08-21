import { getSupabase } from '../api/supabase-client.js';
import { CONFIG } from '../config/constants.js';

export async function logoutUser() {
  const supabase = getSupabase();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    console.log('User logged out successfully');
    
    // Redirect to login page
    window.location.href = CONFIG.ROUTES.LOGIN;
    
    return { success: true };
  } catch (error) {
    console.error('Logout failed:', error);
    return { success: false, error: error.message };
  }
}