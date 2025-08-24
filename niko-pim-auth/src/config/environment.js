// Public configuration only - no sensitive data
export const PUBLIC_CONFIG = {
    ROUTES: {
        CUSTOMER_DASHBOARD: '/dev/app/customer/dashboard',
        RETAILER_DASHBOARD: '/dev/app/retailer/dashboard',
        LOGIN: '/dev/app/auth/log-in',
        SIGNUP: '/dev/app/auth/sign-up'
    },
    API_ENDPOINTS: {
        SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co'
    }
};

export const USER_ROLES = {
    CUSTOMER: 'Customer',
    RETAILER: 'Retailer'
};