import { getSupabase } from '../api/supabase-client.js';
import { CONFIG, USER_ROLES } from '../config/constants.js';

export async function loginUser(email, password) {
  const supabase = getSupabase();
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // Determine user role and redirect appropriately
    const userRole = await getUserRole(authData.user);
    const redirectUrl = getRedirectUrl(userRole);
    
    console.log('Login successful:', email, 'Role:', userRole);
    
    return { 
      success: true, 
      user: authData.user, 
      role: userRole,
      redirectUrl 
    };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: error.message };
  }
}

async function getUserRole(user) {
  // Check user metadata first
  if (user.user_metadata?.user_type) {
    return user.user_metadata.user_type;
  }
  
  // TODO: Query Webflow CMS to determine role
  // For now, default to customer
  return USER_ROLES.CUSTOMER;
}

function getRedirectUrl(userRole) {
  switch (userRole) {
    case USER_ROLES.RETAILER:
      return CONFIG.ROUTES.RETAILER_DASHBOARD;
    case USER_ROLES.CUSTOMER:
      return CONFIG.ROUTES.CUSTOMER_DASHBOARD;
    default:
      return CONFIG.ROUTES.ONBOARDING;
  }
}