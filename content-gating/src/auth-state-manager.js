/**
 * Authentication State Manager (Standalone Version)
 * Handles secure authentication state without storing sensitive tokens
 * Works alongside the core Niko PIM Authentication System
 */

class AuthStateManager {
    constructor() {
        this.coreAuthSystem = null;
        this.authState = {
            isAuthenticated: false,
            userType: null,
            lastVerified: null
        };
        this.verificationInterval = null;
        this.VERIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.SESSION_KEY = 'niko_content_gating_state';
    }

    async init(coreAuthSystem) {
        this.coreAuthSystem = coreAuthSystem;
        
        // Load cached auth state
        this.loadAuthState();
        
        // Verify current authentication via core system
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
            console.warn('Failed to load cached content gating state:', error);
        }
        
        this.clearAuthState();
        return false;
    }

    async verifyAuthState() {
        try {
            // Use core auth system to check current state
            const currentUser = this.coreAuthSystem.getCurrentUser();
            const userRole = this.coreAuthSystem.getUserRole();
            
            if (!currentUser) {
                this.clearAuthState();
                return false;
            }

            // Update auth state with verified information
            this.authState = {
                isAuthenticated: true,
                userType: userRole || 'Customer',
                userId: currentUser.id,
                email: currentUser.email,
                lastVerified: Date.now()
            };

            this.cacheAuthState();
            return true;

        } catch (error) {
            console.error('Content gating auth verification failed:', error);
            this.clearAuthState();
            return false;
        }
    }

    cacheAuthState() {
        try {
            // Only cache non-sensitive authentication status
            const cacheData = {
                isAuthenticated: this.authState.isAuthenticated,
                userType: this.authState.userType,
                lastVerified: this.authState.lastVerified
            };
            
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache content gating state:', error);
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
            console.warn('Failed to clear content gating session storage:', error);
        }

        this.stopPeriodicVerification();
    }

    startPeriodicVerification() {
        this.stopPeriodicVerification();
        
        this.verificationInterval = setInterval(async () => {
            const isValid = await this.verifyAuthState();
            if (!isValid) {
                // Auth state changed - trigger re-gating
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

    redirectToLogin(returnUrl = null) {
        // Delegate to core auth system
        if (this.coreAuthSystem && typeof this.coreAuthSystem.redirectToLogin === 'function') {
            this.coreAuthSystem.redirectToLogin(returnUrl);
        } else {
            // Fallback redirect
            const loginUrl = '/dev/app/auth/log-in';
            const currentUrl = returnUrl || window.location.pathname + window.location.search;
            
            if (!currentUrl.includes('/auth/')) {
                window.location.href = `${loginUrl}?return=${encodeURIComponent(currentUrl)}`;
            } else {
                window.location.href = loginUrl;
            }
        }
    }
}

export default AuthStateManager;