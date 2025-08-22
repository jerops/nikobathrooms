import { getSupabase } from '../api/supabase-client.js';
import { USER_ROLES } from '../config/constants.js';

export async function loginUser(email, password) {
  const supabase = getSupabase();
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    const userRole = authData.user.user_metadata?.user_type || USER_ROLES.CUSTOMER;
    
    return { 
      success: true, 
      user: authData.user, 
      role: userRole
    };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: error.message };
  }
}