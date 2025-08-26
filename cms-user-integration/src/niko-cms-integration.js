class NikoCMSIntegration {
    constructor() {
        this.authCore = null;
        this.isInitialized = false;
        this.webflowUser = null;
    }
    
    async init() {
        console.log('Initializing Niko CMS Integration...');
        
        // Wait for auth core to be available
        if (!window.NikoAuthCore) {
            console.error('NikoAuthCore not found. Make sure auth-core module is loaded first.');
            throw new Error('Auth core dependency missing');
        }
        
        this.authCore = window.NikoAuthCore;
        
        // Wait for auth core to be initialized
        await this.waitForAuthCore();
        
        // Listen for auth state changes
        this.setupAuthStateListener();
        
        // Load user data if authenticated
        if (this.authCore.isAuthenticated()) {
            await this.loadWebflowUserData();
        }
        
        this.isInitialized = true;
        console.log('Niko CMS Integration initialized successfully');
    }
    
    async waitForAuthCore() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (attempts < maxAttempts) {
            if (this.authCore.isInitialized()) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        throw new Error('Auth core not ready within timeout');
    }
    
    setupAuthStateListener() {
        // Listen for auth state changes from core auth
        const originalOnAuthStateChange = this.authCore.getSupabaseClient().auth.onAuthStateChange;
        
        this.authCore.getSupabaseClient().auth.onAuthStateChange(async (event, session) => {
            console.log('CMS Integration detected auth state change:', event);
            
            if (event === 'SIGNED_IN') {
                await this.handleUserSignIn(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.handleUserSignOut();
            }
        });
    }
    
    async handleUserSignIn(user) {
        try {
            console.log('CMS Integration handling user sign in:', user.email);
            
            // Load or create Webflow user data
            await this.loadWebflowUserData();
            
            // If no Webflow user exists, create one
            if (!this.webflowUser) {
                await this.createWebflowUserRecord(user);
            }
            
        } catch (error) {
            console.error('Error handling user sign in for CMS:', error);
        }
    }
    
    handleUserSignOut() {
        console.log('CMS Integration handling user sign out');
        this.webflowUser = null;
    }
    
    async loadWebflowUserData() {
        const currentUser = this.authCore.getCurrentUser();
        const userRole = this.authCore.getUserRole();
        
        if (!currentUser) {
            console.log('No authenticated user for CMS integration');
            return;
        }
        
        try {
            console.log('Loading Webflow user data for:', currentUser.email);
            
            const result = await this.getWebflowUserByFirebaseUID(currentUser.id, userRole);
            this.webflowUser = result.user;
            
            console.log('Webflow user data loaded:', this.webflowUser);
            
        } catch (error) {
            console.warn('Failed to load Webflow user data:', error);
            this.webflowUser = null;
        }
    }
    
    async createWebflowUserRecord(user) {
        try {
            console.log('Creating Webflow CMS record for:', user.email);
            
            const userData = {
                name: user.user_metadata?.name || user.email.split('@')[0],
                email: user.email,
                firebaseUid: user.id,
                userType: user.user_metadata?.user_type || 'Customer',
                isActive: true,
                registrationDate: new Date().toISOString()
            };
            
            // Call Edge Function to create Webflow record
            const result = await this.callEdgeFunction('create-webflow-user', userData);
            
            if (result.success) {
                this.webflowUser = result.webflowRecord;
                console.log('Webflow CMS record created successfully:', this.webflowUser);
            } else {
                console.error('Failed to create Webflow CMS record:', result.error);
            }
            
        } catch (error) {
            console.error('Error creating Webflow CMS record:', error);
        }
    }
    
    async getWebflowUserByFirebaseUID(firebaseUid, userType) {
        try {
            const result = await this.callEdgeFunction('get-webflow-user', {
                firebaseUid,
                userType
            });
            
            if (result.success) {
                return { user: result.webflowUser };
            } else {
                throw new Error(result.error || 'Failed to get Webflow user');
            }
            
        } catch (error) {
            console.error('Error getting Webflow user:', error);
            throw error;
        }
    }
    
    async updateWebflowUserWishlist(firebaseUid, userType, wishlistProducts) {
        try {
            const result = await this.callEdgeFunction('update-webflow-user-wishlist', {
                firebaseUid,
                userType,
                wishlistProducts
            });
            
            if (result.success) {
                // Update local data
                if (this.webflowUser) {
                    this.webflowUser.wishlistProducts = wishlistProducts;
                }
                return result;
            } else {
                throw new Error(result.error || 'Failed to update wishlist');
            }
            
        } catch (error) {
            console.error('Error updating Webflow user wishlist:', error);
            throw error;
        }
    }
    
    async callEdgeFunction(functionName, data) {
        try {
            const supabase = this.authCore.getSupabaseClient();
            
            console.log(`Calling Edge Function: ${functionName}`, data);
            
            const { data: result, error } = await supabase.functions.invoke(functionName, {
                body: data
            });
            
            if (error) {
                console.error(`Edge Function ${functionName} error:`, error);
                throw error;
            }
            
            console.log(`Edge Function ${functionName} result:`, result);
            return result;
            
        } catch (error) {
            console.error(`Failed to call Edge Function ${functionName}:`, error);
            throw error;
        }
    }
    
    // Public API Methods
    getWebflowUser() {
        return this.webflowUser;
    }
    
    getWishlist() {
        return this.webflowUser?.wishlistProducts || [];
    }
    
    async addToWishlist(productId) {
        if (!this.authCore.isAuthenticated() || !this.webflowUser) {
            throw new Error('User not authenticated or Webflow data not loaded');
        }
        
        const currentWishlist = this.webflowUser.wishlistProducts || [];
        if (currentWishlist.includes(productId)) {
            return { success: true, message: 'Product already in wishlist' };
        }
        
        const updatedWishlist = [...currentWishlist, productId];
        
        try {
            await this.updateWebflowUserWishlist(
                this.authCore.getCurrentUser().id,
                this.authCore.getUserRole(),
                updatedWishlist
            );
            
            return { success: true, message: 'Product added to wishlist' };
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            return { success: false, error: error.message };
        }
    }
    
    async removeFromWishlist(productId) {
        if (!this.authCore.isAuthenticated() || !this.webflowUser) {
            throw new Error('User not authenticated or Webflow data not loaded');
        }
        
        const currentWishlist = this.webflowUser.wishlistProducts || [];
        const updatedWishlist = currentWishlist.filter(id => id !== productId);
        
        try {
            await this.updateWebflowUserWishlist(
                this.authCore.getCurrentUser().id,
                this.authCore.getUserRole(),
                updatedWishlist
            );
            
            return { success: true, message: 'Product removed from wishlist' };
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    const cmsIntegration = new NikoCMSIntegration();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cmsIntegration.init().catch(console.error);
        });
    } else {
        // DOM already ready, but wait a bit for auth core to load
        setTimeout(() => {
            cmsIntegration.init().catch(console.error);
        }, 100);
    }
    
    // Expose global API
    window.NikoCMSIntegration = {
        // User data methods
        getWebflowUser: () => cmsIntegration.getWebflowUser(),
        getWishlist: () => cmsIntegration.getWishlist(),
        
        // Wishlist methods
        addToWishlist: async (productId) => {
            return await cmsIntegration.addToWishlist(productId);
        },
        removeFromWishlist: async (productId) => {
            return await cmsIntegration.removeFromWishlist(productId);
        },
        
        // Utility methods
        isInitialized: () => cmsIntegration.isInitialized,
        
        // Advanced access
        callEdgeFunction: async (functionName, data) => {
            return await cmsIntegration.callEdgeFunction(functionName, data);
        }
    };
}

export default NikoCMSIntegration;