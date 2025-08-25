import { getSupabase } from './supabase-client.js';

/**
 * Webflow Edge Functions Client
 * Handles all interactions with Webflow CMS via Supabase Edge Functions
 */

class WebflowEdgeFunctionsClient {
    constructor() {
        this.supabase = null;
        this.baseUrl = null;
    }

    initialize() {
        this.supabase = getSupabase();
        this.baseUrl = `${process.env.SUPABASE_URL}/functions/v1`;
    }

    async callEdgeFunction(functionName, data) {
        if (!this.supabase) {
            this.initialize();
        }

        try {
            const response = await fetch(`${this.baseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Edge function call failed');
            }

            return result;

        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            throw error;
        }
    }

    /**
     * Create a new user record in Webflow CMS
     */
    async createWebflowUserRecord(userData) {
        return await this.callEdgeFunction('create-webflow-user', {
            user_id: userData.supabaseUserId,
            email: userData.email,
            name: userData.name,
            user_type: userData.userType
        });
    }

    /**
     * Get user data from Webflow CMS by Firebase UID
     */
    async getWebflowUserByFirebaseUID(firebaseUID, userType) {
        return await this.callEdgeFunction('get-webflow-user-by-firebase-uid', {
            firebase_uid: firebaseUID,
            user_type: userType
        });
    }

    /**
     * Update user's wishlist in Webflow CMS
     */
    async updateWebflowUserWishlist(firebaseUID, userType, wishlistProducts) {
        return await this.callEdgeFunction('update-webflow-user-wishlist', {
            firebase_uid: firebaseUID,
            user_type: userType,
            wishlist_products: wishlistProducts
        });
    }

    /**
     * Check if user exists in Webflow CMS
     */
    async checkUserExists(firebaseUID, userType) {
        try {
            const result = await this.getWebflowUserByFirebaseUID(firebaseUID, userType);
            return { exists: true, user: result.user };
        } catch (error) {
            if (error.message.includes('User not found')) {
                return { exists: false, user: null };
            }
            throw error;
        }
    }
}

// Create and export singleton instance
const webflowClient = new WebflowEdgeFunctionsClient();

export default webflowClient;