import { getSupabase } from '../api/supabase-client.js';
import { CONFIG, USER_ROLES } from '../config/constants.js';

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

    // Step 2: If retailer, validate against existing retailers
    if (userType === USER_ROLES.RETAILER) {
      const isValidRetailer = await validateRetailer(email);
      if (!isValidRetailer) {
        throw new Error('Email not found in authorized retailers list');
      }
    }

    // Step 3: Create corresponding Webflow CMS entry
    await createWebflowUser(authData.user, name, userType);

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: error.message };
  }
}

async function validateRetailer(email) {
  // TODO: Implement Webflow API call to check retailers collection
  // For now, return true (we'll implement this in the next step)
  return true;
}

async function createWebflowUser(user, name, userType) {
  // TODO: Implement Webflow API call to create CMS item
  // This will be implemented when we add the Webflow client
  console.log('Creating Webflow user:', { user: user.id, name, userType });
}