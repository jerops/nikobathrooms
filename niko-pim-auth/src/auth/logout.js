import { getSupabase } from '../api/supabase-client.js';
import { CONFIG } from '../config/constants.js';

export async function logoutUser(supabaseClient) {
  // Support both old and new calling patterns for backward compatibility
  const supabase = supabaseClient || getSupabase();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    console.log('User logged out successfully');
    
    return { 
      success: true,
      message: 'Logout successful'
    };
    
  } catch (error) {
    console.error('Logout failed:', error);
    return { 
      success: false, 
      error: error.message || 'Logout failed'
    };
  }
}

// Backward compatibility: export function that doesn't require supabase parameter
export async function logoutUserLegacy() {
  return await logoutUser(null);
}