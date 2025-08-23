import { getSupabase } from '../api/supabase-client.js';
import { USER_ROLES } from '../config/constants.js';

export async function registerUser(supabaseClient, email, password, name, userType) {
  // Support both old and new calling patterns for backward compatibility
  const supabase = supabaseClient || getSupabase();
  
  try {
    // Input validation
    if (!email || !password || !name || !userType) {
      throw new Error('All fields are required');
    }

    if (!Object.values(USER_ROLES).includes(userType)) {
      throw new Error(`Invalid user type. Must be ${Object.values(USER_ROLES).join(' or ')}`);
    }

    // Step 1: Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          user_type: userType,
          role: userType // Add role for easier access
        }
      }
    });

    if (authError) throw authError;

    console.log('User registered with Supabase:', authData.user?.email);

    // Step 2: Call Edge Function to create Webflow CMS entry
    try {
      const { data, error } = await supabase.functions.invoke('create-webflow-user', {
        body: {
          user_id: authData.user.id,
          email,
          name,
          user_type: userType
        }
      });

      console.log('Edge function response:', data, error);
      
      if (error) {
        console.warn('Webflow CMS creation failed:', error);
        // Don't fail the entire registration if Webflow sync fails
      } else {
        console.log('User created in both Supabase and Webflow CMS:', data);
      }
      
    } catch (webflowError) {
      console.warn('Edge function call failed:', webflowError);
      // Don't fail the entire registration if Webflow sync fails
    }

    return { 
      success: true, 
      user: authData.user,
      message: 'Registration successful'
    };
    
  } catch (error) {
    console.error('Registration failed:', error);
    return { 
      success: false, 
      error: error.message || 'Registration failed'
    };
  }
}

// Backward compatibility: export function that doesn't require supabase parameter
export async function registerUserLegacy(email, password, name, userType) {
  return await registerUser(null, email, password, name, userType);
}