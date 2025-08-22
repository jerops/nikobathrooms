import { getSupabase } from '../api/supabase-client.js';
import { webflowClient } from '../api/webflow-client.js';
import { CONFIG, USER_ROLES } from '../config/constants.js';

export async function registerUser(email, password, name, userType) {
  const supabase = getSupabase();
  
  try {
    // Step 1: Validate retailer email if needed
    if (userType === USER_ROLES.RETAILER) {
      const isValidRetailer = await webflowClient.validateRetailerEmail(email);
      if (!isValidRetailer) {
        throw new Error('Email not found in authorized retailers list');
      }
    }

    // Step 2: Register with Supabase Auth
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

    // Step 3: Create corresponding Webflow CMS entry
    try {
      const userData = {
        name,
        email,
        supabaseId: authData.user.id
      };

      if (userType === USER_ROLES.CUSTOMER) {
        await webflowClient.createCustomer(userData);
      } else {
        await webflowClient.createRetailer(userData);
      }
      
      console.log('User created in both Supabase and Webflow CMS');
    } catch (webflowError) {
      console.error('Webflow CMS creation failed:', webflowError);
      // Continue anyway - user exists in Supabase
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: error.message };
  }
}