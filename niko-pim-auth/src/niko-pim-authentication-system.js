import { PUBLIC_CONFIG, USER_ROLES } from './config/environment.js';
import { initializeSupabase } from './api/supabase-client.js';
import { registerUser } from './auth/supabase-signup-with-webflow-integration.js';
import { loginUser } from './auth/login.js';
import { logoutUser } from './auth/logout.js';
import webflowClient from './api/webflow-edge-functions-client.js';

class NikoPIMAuthenticationSystem {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userRole = null;
        this.webflowUser = null;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('Initializing Niko PIM Authentication System...');
        try {
            this.supabase = initializeSupabase();
            webflowClient.initialize();
            
            await this.checkAuthState();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Niko PIM Authentication System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize authentication system:', error);
            throw error;
        }
    }
    
    async checkAuthState() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.userRole = user.user_metadata?.user_type || USER_ROLES.CUSTOMER;
                console.log('User authenticated:', user.email, 'Role:', this.userRole);
                
                // Load Webflow user data
                await this.loadWebflowUserData();
            } else {
                console.log('No authenticated user');
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
        }
    }
    
    async loadWebflowUserData() {
        if (!this.currentUser) return;
        
        try {
            const result = await webflowClient.getWebflowUserByFirebaseUID(
                this.currentUser.id, 
                this.userRole
            );
            this.webflowUser = result.user;
            console.log('Webflow user data loaded:', this.webflowUser);
        } catch (error) {
            console.warn('Failed to load Webflow user data:', error);
            this.webflowUser = null;
        }
    }
    
    setupEventListeners() {
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            await this.handleAuthStateChange(event, session);
        });
    }
    
    async handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = session.user;
                this.userRole = session.user.user_metadata?.user_type || USER_ROLES.CUSTOMER;
                await this.loadWebflowUserData();
                break;
            case 'SIGNED_OUT':
                this.currentUser = null;
                this.userRole = null;
                this.webflowUser = null;
                break;
        }
    }
    
    // Public API methods
    async register(email, password, name, userType) {
        const result = await registerUser(email, password, name, userType);
        
        if (result.success && result.webflowRecord) {
            console.log('User registered with Webflow CMS integration:', result.webflowRecord);
        }
        
        return result;
    }
    
    async login(email, password) {
        return await loginUser(email, password);
    }
    
    async logout() {
        return await logoutUser();
    }
    
    // Webflow-specific methods
    async addToWishlist(productId) {
        if (!this.currentUser || !this.webflowUser) {
            throw new Error('User not authenticated or Webflow data not loaded');
        }
        
        const currentWishlist = this.webflowUser.wishlistProducts || [];
        if (currentWishlist.includes(productId)) {
            return { success: true, message: 'Product already in wishlist' };
        }
        
        const updatedWishlist = [...currentWishlist, productId];
        
        try {
            await webflowClient.updateWebflowUserWishlist(
                this.currentUser.id,
                this.userRole,
                updatedWishlist
            );
            
            // Update local data
            this.webflowUser.wishlistProducts = updatedWishlist;
            
            return { success: true, message: 'Product added to wishlist' };
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            return { success: false, error: error.message };
        }
    }
    
    async removeFromWishlist(productId) {
        if (!this.currentUser || !this.webflowUser) {
            throw new Error('User not authenticated or Webflow data not loaded');
        }
        
        const currentWishlist = this.webflowUser.wishlistProducts || [];
        const updatedWishlist = currentWishlist.filter(id => id !== productId);
        
        try {
            await webflowClient.updateWebflowUserWishlist(
                this.currentUser.id,
                this.userRole,
                updatedWishlist
            );
            
            // Update local data
            this.webflowUser.wishlistProducts = updatedWishlist;
            
            return { success: true, message: 'Product removed from wishlist' };
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Utility methods
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserRole() {
        return this.userRole;
    }
    
    getWebflowUser() {
        return this.webflowUser;
    }
    
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    getWishlist() {
        return this.webflowUser?.wishlistProducts || [];
    }

    redirectToLogin(returnUrl = null) {
        const loginUrl = '/dev/app/auth/log-in';
        const currentUrl = returnUrl || window.location.pathname + window.location.search;
        
        if (!currentUrl.includes('/auth/')) {
            window.location.href = `${loginUrl}?return=${encodeURIComponent(currentUrl)}`;
        } else {
            window.location.href = loginUrl;
        }
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    const authSystem = new NikoPIMAuthenticationSystem();
    window.NikoPIM = authSystem;
    
    authSystem.init().then(() => {
        // Expose methods for form handlers
        window.NikoPIM.register = async (email, password, name, userType) => {
            return await authSystem.register(email, password, name, userType);
        };
        
        window.NikoPIM.login = async (email, password) => {
            return await authSystem.login(email, password);
        };
        
        window.NikoPIM.logout = async () => {
            return await authSystem.logout();
        };
        
        // Expose utility methods
        window.NikoPIM.getCurrentUser = () => authSystem.getCurrentUser();
        window.NikoPIM.getUserRole = () => authSystem.getUserRole();
        window.NikoPIM.getWebflowUser = () => authSystem.getWebflowUser();
        window.NikoPIM.isAuthenticated = () => authSystem.isAuthenticated();
        window.NikoPIM.redirectToLogin = (returnUrl) => authSystem.redirectToLogin(returnUrl);
        
        // Expose wishlist methods
        window.NikoPIM.getWishlist = () => authSystem.getWishlist();
        window.NikoPIM.addToWishlist = async (productId) => {
            return await authSystem.addToWishlist(productId);
        };
        window.NikoPIM.removeFromWishlist = async (productId) => {
            return await authSystem.removeFromWishlist(productId);
        };
        
        // Expose Supabase client for advanced usage (like content gating)
        window.NikoPIM.supabase = authSystem.supabase;
        
        console.log('Niko PIM Authentication System ready');
    }).catch(error => {
        console.error('Failed to initialize Niko PIM Authentication System:', error);
    });
}