
export const CONFIG = {
  SUPABASE: {
    URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'
  },
  WEBFLOW: {
    SITE_ID: '67378d122c9df01858dd36f6',
    COLLECTIONS: {
      RETAILERS: '6738c46e5f48be10cf90c694',
      CUSTOMERS: '68a6dc21ddfb81569ba773a4',
      PRODUCTS: '67378d122c9df01858dd3747'
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