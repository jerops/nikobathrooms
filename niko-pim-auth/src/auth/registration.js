import { getSupabase } from '../api/supabase-client.js';
import { USER_ROLES } from '../config/constants.js';

export async function registerUser(email, password, name, userType) {
  const supabase = getSupabase();
  
  try {
    // Step 1: Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          user_type: userType
        }
      }
    });

    if (authError) throw authError;

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
        console.error('Webflow CMS creation failed:', error);
      } else {
        console.log('User created in both Supabase and Webflow CMS:', data);
      }

      // Add delay to see logs before redirect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (webflowError) {
      console.error('Edge function call failed:', webflowError);
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: error.message };
  }
}