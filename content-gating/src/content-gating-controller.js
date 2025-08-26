/**
 * Content Gating Controller (Standalone Version)
 * Orchestrates authentication state and content filtering
 * Works with the core Niko PIM Authentication System
 */

import AuthStateManager from './auth-state-manager.js';
import FinsweetIntegration from './finsweet-integration.js';

class ContentGatingController {
    constructor() {
        this.authManager = new AuthStateManager();
        this.finsweetManager = new FinsweetIntegration();
        this.isInitialized = false;
        this.coreAuthSystem = null;
    }

    async init(coreAuthSystem) {
        try {
            console.log('Initializing content gating controller...');

            this.coreAuthSystem = coreAuthSystem;

            // Initialize authentication state manager with core system
            const authState = await this.authManager.init(coreAuthSystem);

            // Initialize Finsweet integration
            await this.finsweetManager.init();

            // Set up auth state change callback
            this.authManager.setAuthStateChangeCallback((isAuthenticated, userType) => {
                this.handleAuthStateChange(isAuthenticated, userType);
            });

            // Apply initial content gating
            this.applyContentGating(authState.isAuthenticated, authState.userType);

            this.isInitialized = true;
            console.log('Content gating controller initialized');

            return authState;

        } catch (error) {
            console.error('Content gating controller initialization failed:', error);
            // Apply safe defaults (guest mode)
            this.finsweetManager.applyCSSGating(false, null);
            throw error;
        }
    }

    handleAuthStateChange(isAuthenticated, userType) {
        console.log('Content gating detected auth state change:', { isAuthenticated, userType });
        
        if (!isAuthenticated) {
            // Just update content gating - don't redirect (let core system handle that)
            this.applyContentGating(false, null);
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
                // Remove other role class
                const otherRole = userType.toLowerCase() === 'customer' ? 'retailer' : 'customer';
                document.body.classList.remove(`niko-${otherRole}`);
            } else {
                document.body.classList.remove('niko-customer', 'niko-retailer');
            }

            console.log(`Content gating applied: ${isAuthenticated ? `${userType} authenticated` : 'guest'}`);

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
        
        if (userTypeRequired && authState.userType?.toLowerCase() !== userTypeRequired.toLowerCase()) {
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
            // Check if prompt already exists
            const existingPrompt = element.parentNode?.querySelector('.niko-login-prompt');
            if (existingPrompt) return;

            const loginPrompt = document.createElement('div');
            loginPrompt.className = 'niko-login-prompt';
            loginPrompt.innerHTML = `
                <p>${message}</p>
                <a href="/dev/app/auth/log-in?return=${encodeURIComponent(window.location.pathname)}" class="niko-login-link">
                    Login
                </a>
            `;
            
            // Add some basic styling
            loginPrompt.style.cssText = `
                padding: 1rem;
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 0.375rem;
                text-align: center;
                margin: 0.5rem 0;
            `;

            const loginLink = loginPrompt.querySelector('.niko-login-link');
            if (loginLink) {
                loginLink.style.cssText = `
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 0.25rem;
                    margin-top: 0.5rem;
                `;
            }
            
            element.style.display = 'none';
            element.parentNode.insertBefore(loginPrompt, element.nextSibling);
        }
    }

    // Method to handle dynamic content loading (e.g., AJAX)
    async refreshPageContent() {
        if (!this.isInitialized) return;

        // Re-verify auth state
        await this.refreshAuthState();
        
        // Re-initialize Finsweet if needed
        if (this.finsweetManager.isInitialized) {
            await this.finsweetManager.init();
        }
    }
}

export default ContentGatingController;