import { getSupabase } from '../api/supabase-client.js';
import { USER_ROLES } from '../config/constants.js';

export async function loginUser(supabaseClient, email, password) {
  // Support both old and new calling patterns for backward compatibility
  const supabase = supabaseClient || getSupabase();
  
  try {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // Get user role from metadata
    const userRole = authData.user.user_metadata?.user_type || 
                    authData.user.user_metadata?.role || 
                    USER_ROLES.CUSTOMER;
    
    console.log('User logged in:', authData.user.email, 'Role:', userRole);
    
    return { 
      success: true, 
      user: authData.user, 
      role: userRole,
      message: 'Login successful'
    };
    
  } catch (error) {
    console.error('Login failed:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed'
    };
  }
}

// Backward compatibility: export function that doesn't require supabase parameter
export async function loginUserLegacy(email, password) {
  return await loginUser(null, email, password);
}