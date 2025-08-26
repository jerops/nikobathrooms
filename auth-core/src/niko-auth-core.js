import { createClient } from '@supabase/supabase-js';

class NikoAuthCore {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userRole = null;
        this.isInitialized = false;
        this._ready = false;
    }
    
    async init() {
        console.log('Initializing Niko Auth Core...');
        try {
            // Initialize Supabase client
            this.supabase = createClient(
                'https://bzjoxjqfpmjhbfijthpp.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.ry3Xbso3Yr6HORiYZv3Bae1txMu1n7h4Ib3adKX1Qqs'
            );
            
            await this.checkAuthState();
            this.setupEventListeners();
            this.isInitialized = true;
            this._ready = true;
            
            console.log('✅ Niko Auth Core initialized successfully');
            
            // Fire ready event after everything is set up
            window.dispatchEvent(new CustomEvent("NikoAuthCore:ready"));
            console.log('✅ NikoAuthCore:ready event fired');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize auth core:', error);
            throw error;
        }
    }
    
    async checkAuthState() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.userRole = user.user_metadata?.user_type || 'Customer';
                console.log('User authenticated:', user.email, 'Role:', this.userRole);
                
                // Redirect to dashboard if on login/signup pages
                if (window.location.pathname.includes('/auth/')) {
                    this.redirectToDashboard();
                }
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
        }
    }
    
    setupEventListeners() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            await this.handleAuthStateChange(event, session);
        });
    }
    
    async handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = session.user;
                this.userRole = session.user.user_metadata?.user_type || 'Customer';
                this.redirectToDashboard();
                break;
            case 'SIGNED_OUT':
                this.currentUser = null;
                this.userRole = null;
                break;
        }
    }
    
    // Core Authentication Methods
    async register(email, password, name, userType) {
        try {
            console.log('Registering user:', { email, name, userType });
            
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        user_type: userType
                    }
                }
            });
            
            if (error) {
                console.error('Registration error:', error);
                return { success: false, error: error.message };
            }
            
            console.log('User registered successfully:', data.user);
            return { 
                success: true, 
                user: data.user,
                message: 'Registration successful! Please check your email for verification.'
            };
            
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async login(email, password) {
        try {
            console.log('Logging in user:', email);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Login error:', error);
                return { success: false, error: error.message };
            }
            
            this.currentUser = data.user;
            this.userRole = data.user.user_metadata?.user_type || 'Customer';
            
            console.log('User logged in successfully:', data.user.email);
            return { 
                success: true, 
                user: data.user,
                redirectUrl: this.getDashboardUrl()
            };
            
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                console.error('Logout error:', error);
                return { success: false, error: error.message };
            }
            
            this.currentUser = null;
            this.userRole = null;
            
            console.log('User logged out successfully');
            
            // Redirect to login page
            this.redirectToLogin();
            
            return { success: true };
            
        } catch (error) {
            console.error('Logout failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Domain Detection and Redirects
    getCurrentDomain() {
        return window.location.hostname;
    }
    
    getBaseUrl() {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        if (hostname.includes('webflow.io')) {
            return `${protocol}//${hostname}`;
        }
        
        return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }
    
    getDashboardUrl() {
        const baseUrl = this.getBaseUrl();
        const role = this.userRole?.toLowerCase() || 'customer';
        return `${baseUrl}/dev/app/${role}/dashboard`;
    }
    
    getLoginUrl() {
        const baseUrl = this.getBaseUrl();
        return `${baseUrl}/dev/app/auth/log-in`;
    }
    
    redirectToDashboard() {
        const dashboardUrl = this.getDashboardUrl();
        console.log('Redirecting to dashboard:', dashboardUrl);
        window.location.href = dashboardUrl;
    }
    
    redirectToLogin(returnUrl = null) {
        const loginUrl = this.getLoginUrl();
        const currentUrl = returnUrl || window.location.pathname + window.location.search;
        
        if (!currentUrl.includes('/auth/')) {
            window.location.href = `${loginUrl}?return=${encodeURIComponent(currentUrl)}`;
        } else {
            window.location.href = loginUrl;
        }
    }
    
    // Utility Methods
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserRole() {
        return this.userRole;
    }
    
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    // Compatibility methods for CMS integration
    getIsInitialized() {
        return this.isInitialized;
    }
    
    getSupabaseClient() {
        return this.supabase;
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    const authCore = new NikoAuthCore();
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await authCore.init();
        });
    } else {
        authCore.init();
    }
    
    // Expose global API with ALL methods properly bound
    window.NikoAuthCore = {
        // Auth methods
        register: async (email, password, name, userType) => {
            console.log('NikoAuthCore.register called with:', { email, name, userType });
            return await authCore.register(email, password, name, userType);
        },
        login: async (email, password) => {
            console.log('NikoAuthCore.login called with:', email);
            return await authCore.login(email, password);
        },
        logout: async () => {
            console.log('NikoAuthCore.logout called');
            return await authCore.logout();
        },
        
        // State methods
        getCurrentUser: () => authCore.getCurrentUser(),
        getUserRole: () => authCore.getUserRole(),
        isAuthenticated: () => authCore.isAuthenticated(),
        
        // Compatibility methods for CMS integration
        isInitialized: () => authCore.getIsInitialized(),
        
        // Utility methods
        redirectToLogin: (returnUrl) => authCore.redirectToLogin(returnUrl),
        redirectToDashboard: () => authCore.redirectToDashboard(),
        
        // Advanced access
        getSupabaseClient: () => authCore.getSupabaseClient(),
        
        // Internal access for debugging
        _authCore: authCore,
        _ready: true
    };
    
    console.log('✅ NikoAuthCore API exposed with methods:', Object.keys(window.NikoAuthCore));
}

export default NikoAuthCore;