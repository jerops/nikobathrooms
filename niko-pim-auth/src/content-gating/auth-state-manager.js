/**
 * Authentication State Manager
 * Handles secure authentication state without storing sensitive tokens
 */

class AuthStateManager {
    constructor() {
        this.supabase = null;
        this.authState = {
            isAuthenticated: false,
            userType: null,
            lastVerified: null
        };
        this.verificationInterval = null;
        this.VERIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.SESSION_KEY = 'niko_auth_state';
    }

    async init(supabaseClient) {
        this.supabase = supabaseClient;
        
        // Load cached auth state
        this.loadAuthState();
        
        // Verify current authentication
        const isValid = await this.verifyAuthState();
        
        if (isValid) {
            this.startPeriodicVerification();
        }
        
        return this.authState;
    }

    loadAuthState() {
        try {
            const cached = sessionStorage.getItem(this.SESSION_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                // Only use cached state if it's recent (less than 10 minutes old)
                if (parsed.lastVerified && Date.now() - parsed.lastVerified < 10 * 60 * 1000) {
                    this.authState = parsed;
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load cached auth state:', error);
        }
        
        this.clearAuthState();
        return false;
    }

    async verifyAuthState() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            
            if (error || !user) {
                this.clearAuthState();
                return false;
            }

            this.authState = {
                isAuthenticated: true,
                userType: user.user_metadata?.user_type || 'Customer',
                userId: user.id,
                email: user.email,
                lastVerified: Date.now()
            };

            this.cacheAuthState();
            return true;

        } catch (error) {
            console.error('Auth verification failed:', error);
            this.clearAuthState();
            return false;
        }
    }

    cacheAuthState() {
        try {
            const cacheData = {
                isAuthenticated: this.authState.isAuthenticated,
                userType: this.authState.userType,
                lastVerified: this.authState.lastVerified
            };
            
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache auth state:', error);
        }
    }

    clearAuthState() {
        this.authState = {
            isAuthenticated: false,
            userType: null,
            lastVerified: null
        };
        
        try {
            sessionStorage.removeItem(this.SESSION_KEY);
        } catch (error) {
            console.warn('Failed to clear session storage:', error);
        }

        this.stopPeriodicVerification();
    }

    startPeriodicVerification() {
        this.stopPeriodicVerification();
        
        this.verificationInterval = setInterval(async () => {
            const isValid = await this.verifyAuthState();
            if (!isValid) {
                this.onAuthStateChange?.(false, null);
            }
        }, this.VERIFICATION_INTERVAL);
    }

    stopPeriodicVerification() {
        if (this.verificationInterval) {
            clearInterval(this.verificationInterval);
            this.verificationInterval = null;
        }
    }

    getAuthState() {
        return { ...this.authState };
    }

    isAuthenticated() {
        return this.authState.isAuthenticated;
    }

    getUserType() {
        return this.authState.userType;
    }

    setAuthStateChangeCallback(callback) {
        this.onAuthStateChange = callback;
    }

    async logout() {
        try {
            await this.supabase.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthState();
            this.onAuthStateChange?.(false, null);
        }
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

export default AuthStateManager;