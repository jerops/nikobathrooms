// Environment configuration with secure fallbacks
export const CONFIG = {
  SUPABASE: {
    URL: process.env.SUPABASE_URL || (typeof window !== 'undefined' && window.ENV_SUPABASE_URL) || '',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || (typeof window !== 'undefined' && window.ENV_SUPABASE_ANON_KEY) || ''
  },
  WEBFLOW: {
    SITE_ID: process.env.WEBFLOW_SITE_ID || (typeof window !== 'undefined' && window.ENV_WEBFLOW_SITE_ID) || '',
    COLLECTIONS: {
      RETAILERS: process.env.WEBFLOW_RETAILERS_ID || (typeof window !== 'undefined' && window.ENV_WEBFLOW_RETAILERS_ID) || '',
      CUSTOMERS: process.env.WEBFLOW_CUSTOMERS_ID || (typeof window !== 'undefined' && window.ENV_WEBFLOW_CUSTOMERS_ID) || '',
      PRODUCTS: process.env.WEBFLOW_PRODUCTS_ID || (typeof window !== 'undefined' && window.ENV_WEBFLOW_PRODUCTS_ID) || ''
    }
  },
  ROUTES: {
    LOGIN: '/dev/app/auth/log-in',
    SIGNUP: '/dev/app/auth/sign-up',
    CUSTOMER_DASHBOARD: '/dev/app/customer/dashboard',
    RETAILER_DASHBOARD: '/dev/app/retailer/dashboard',
    CUSTOMER_WISHLIST: '/dev/app/customer/wishlist',
    RETAILER_WISHLIST: '/dev/app/retailer/wishlist',
    ONBOARDING: '/dev/app/onboarding'
  }
};

export const USER_ROLES = {
  CUSTOMER: 'Customer',
  RETAILER: 'Retailer'
};

// Environment validation
export function validateEnvironment() {
  const required = [
    { key: 'SUPABASE_URL', value: CONFIG.SUPABASE.URL },
    { key: 'SUPABASE_ANON_KEY', value: CONFIG.SUPABASE.ANON_KEY }
  ];
  
  const missing = required.filter(item => !item.value);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.map(item => item.key));
    throw new Error(`Missing required environment variables: ${missing.map(item => item.key).join(', ')}`);
  }
  
  console.log('✅ Environment validation passed');
}