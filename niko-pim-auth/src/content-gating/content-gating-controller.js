/**
 * Content Gating Controller
 * Orchestrates authentication state and content filtering
 */

import AuthStateManager from './auth-state-manager.js';
import FinsweetIntegration from './finsweet-integration.js';

class ContentGatingController {
    constructor() {
        this.authManager = new AuthStateManager();
        this.finsweetManager = new FinsweetIntegration();
        this.isInitialized = false;
    }

    async init(supabaseClient) {
        try {
            console.log('Initializing content gating system...');

            // Initialize authentication state manager
            const authState = await this.authManager.init(supabaseClient);

            // Initialize Finsweet integration
            await this.finsweetManager.init();

            // Set up auth state change callback
            this.authManager.setAuthStateChangeCallback((isAuthenticated, userType) => {
                this.handleAuthStateChange(isAuthenticated, userType);
            });

            // Apply initial content gating
            this.applyContentGating(authState.isAuthenticated, authState.userType);

            this.isInitialized = true;
            console.log('Content gating system initialized');

            return authState;

        } catch (error) {
            console.error('Content gating initialization failed:', error);
            // Apply safe defaults (guest mode)
            this.finsweetManager.applyCSSGating(false, null);
            throw error;
        }
    }

    handleAuthStateChange(isAuthenticated, userType) {
        console.log('Auth state changed:', { isAuthenticated, userType });
        
        if (!isAuthenticated) {
            // Redirect to login if authentication was lost
            this.authManager.redirectToLogin();
        } else {
            // Update content gating for new auth state
            this.applyContentGating(isAuthenticated, userType);
        }
    }

    applyContentGating(isAuthenticated, userType) {
        try {
            this.finsweetManager.applyContentGating(isAuthenticated, userType);
            
            // Add body classes for additional CSS targeting
            document.body.classList.toggle('niko-authenticated', isAuthenticated);
            document.body.classList.toggle('niko-guest', !isAuthenticated);
            
            if (isAuthenticated && userType) {
                document.body.classList.add(`niko-${userType.toLowerCase()}`);
                document.body.classList.remove(`niko-${userType === 'Customer' ? 'retailer' : 'customer'}`);
            } else {
                document.body.classList.remove('niko-customer', 'niko-retailer');
            }

        } catch (error) {
            console.error('Content gating application failed:', error);
        }
    }

    // Public methods for manual control
    async refreshAuthState() {
        if (!this.isInitialized) return false;

        const isValid = await this.authManager.verifyAuthState();
        const authState = this.authManager.getAuthState();
        
        this.applyContentGating(authState.isAuthenticated, authState.userType);
        return isValid;
    }

    getAuthState() {
        return this.authManager.getAuthState();
    }

    async logout() {
        await this.authManager.logout();
    }

    redirectToLogin(returnUrl) {
        this.authManager.redirectToLogin(returnUrl);
    }

    // Method to manually gate specific elements
    gateElement(element, authRequired = true, userTypeRequired = null) {
        const authState = this.authManager.getAuthState();
        
        let shouldShow = true;
        
        if (authRequired && !authState.isAuthenticated) {
            shouldShow = false;
        }
        
        if (userTypeRequired && authState.userType !== userTypeRequired) {
            shouldShow = false;
        }
        
        if (element) {
            element.style.display = shouldShow ? '' : 'none';
            element.setAttribute('data-gated', shouldShow ? 'false' : 'true');
        }
        
        return shouldShow;
    }

    // Method to add login prompts to elements
    addLoginPrompt(element, message = 'Please log in to access this feature') {
        if (!element) return;
        
        const authState = this.authManager.getAuthState();
        
        if (!authState.isAuthenticated) {
            const loginPrompt = document.createElement('div');
            loginPrompt.className = 'niko-login-prompt';
            loginPrompt.innerHTML = `
                <p>${message}</p>
                <a href="/dev/app/auth/log-in?return=${encodeURIComponent(window.location.pathname)}">
                    Login
                </a>
            `;
            
            element.style.display = 'none';
            element.parentNode.insertBefore(loginPrompt, element.nextSibling);
        }
    }
}

export default ContentGatingController;