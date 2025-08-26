import { PUBLIC_CONFIG, USER_ROLES } from './config/environment.js';
import { initializeSupabase } from './api/supabase-client.js';
import { registerUser } from './auth/supabase-signup-with-webflow-integration.js';
import { loginUser } from './auth/login.js';
import { logoutUser } from './auth/logout.js';
import webflowClient from './api/webflow-edge-functions-client.js';
import ContentGatingController from './content-gating/content-gating-controller.js';

class NikoPIMAuthenticationSystem {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userRole = null;
        this.webflowUser = null;
        this.contentGating = new ContentGatingController();
        this.isInitialized = false;
    }
    
    async init() {
        console.log('Initializing Niko PIM Authentication System with Content Gating...');
        try {
            this.supabase = initializeSupabase();
            webflowClient.initialize();
            
            // Initialize content gating system first
            const authState = await this.contentGating.init(this.supabase);
            
            // Use auth state from content gating controller
            if (authState.isAuthenticated) {
                this.currentUser = { 
                    id: authState.userId, 
                    email: authState.email,
                    user_metadata: { user_type: authState.userType }
                };
                this.userRole = authState.userType;
                
                // Load Webflow user data
                await this.loadWebflowUserData();
            }
            
            await this.checkAuthState();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Niko PIM Authentication System with Content Gating initialized successfully');
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
                
                // Load Webflow user data if not already loaded
                if (!this.webflowUser) {
                    await this.loadWebflowUserData();
                }
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
                // Refresh content gating
                await this.contentGating.refreshAuthState();
                break;
            case 'SIGNED_OUT':
                this.currentUser = null;
                this.userRole = null;
                this.webflowUser = null;
                // Clear content gating
                await this.contentGating.refreshAuthState();
                break;
        }
    }
    
    // Public API methods
    async register(email, password, name, userType) {
        const result = await registerUser(email, password, name, userType);
        
        if (result.success && result.webflowRecord) {
            console.log('User registered with Webflow CMS integration:', result.webflowRecord);
            // Refresh content gating after successful registration
            setTimeout(async () => {
                await this.contentGating.refreshAuthState();
            }, 1000);
        }
        
        return result;
    }
    
    async login(email, password) {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Refresh content gating after successful login
            setTimeout(async () => {
                await this.contentGating.refreshAuthState();
            }, 1000);
        }
        
        return result;
    }
    
    async logout() {
        const result = await logoutUser();
        
        // Use content gating logout method for proper cleanup
        await this.contentGating.logout();
        
        return result;
    }
    
    // Content gating methods
    async refreshContentGating() {
        return await this.contentGating.refreshAuthState();
    }
    
    getContentGatingState() {
        return this.contentGating.getAuthState();
    }
    
    gateElement(element, authRequired = true, userTypeRequired = null) {
        return this.contentGating.gateElement(element, authRequired, userTypeRequired);
    }
    
    addLoginPrompt(element, message) {
        return this.contentGating.addLoginPrompt(element, message);
    }
    
    redirectToLogin(returnUrl) {
        this.contentGating.redirectToLogin(returnUrl);
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
        
        // Expose wishlist methods
        window.NikoPIM.getWishlist = () => authSystem.getWishlist();
        window.NikoPIM.addToWishlist = async (productId) => {
            return await authSystem.addToWishlist(productId);
        };
        window.NikoPIM.removeFromWishlist = async (productId) => {
            return await authSystem.removeFromWishlist(productId);
        };
        
        // Expose content gating methods
        window.NikoPIM.refreshContentGating = async () => {
            return await authSystem.refreshContentGating();
        };
        
        window.NikoPIM.getContentGatingState = () => {
            return authSystem.getContentGatingState();
        };
        
        window.NikoPIM.gateElement = (element, authRequired, userTypeRequired) => {
            return authSystem.gateElement(element, authRequired, userTypeRequired);
        };
        
        window.NikoPIM.addLoginPrompt = (element, message) => {
            return authSystem.addLoginPrompt(element, message);
        };
        
        window.NikoPIM.redirectToLogin = (returnUrl) => {
            return authSystem.redirectToLogin(returnUrl);
        };
        
        console.log('Niko PIM Authentication System ready with Content Gating');
    }).catch(error => {
        console.error('Failed to initialize Niko PIM Authentication System:', error);
    });
}