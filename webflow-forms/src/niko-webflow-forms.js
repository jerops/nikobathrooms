/**
 * Niko Webflow Forms - Main Module
 * Integrates login and signup form handlers with modular auth system
 */

import SignupFormHandler from './signup-handler.js';
import LoginFormHandler from './login-handler.js';

class NikoWebflowForms {
    constructor() {
        this.signupHandler = new SignupFormHandler();
        this.loginHandler = new LoginFormHandler();
        this.isInitialized = false;
    }

    async init() {
        console.log('Initializing Niko Webflow Forms...');
        
        try {
            // Detect page type and initialize appropriate handler
            const currentPath = window.location.pathname;
            
            if (currentPath.includes('/sign-up')) {
                console.log('Signup page detected - initializing signup handler');
                await this.signupHandler.init();
            } else if (currentPath.includes('/log-in')) {
                console.log('Login page detected - initializing login handler');
                await this.loginHandler.init();
            } else {
                // Initialize both handlers for pages that might have both forms
                console.log('General page - initializing all form handlers');
                await Promise.all([
                    this.signupHandler.init(),
                    this.loginHandler.init()
                ]);
            }
            
            this.isInitialized = true;
            console.log('Niko Webflow Forms initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Webflow Forms:', error);
        }
    }

    // Public API methods
    getSignupHandler() {
        return this.signupHandler;
    }

    getLoginHandler() {
        return this.loginHandler;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    const webflowForms = new NikoWebflowForms();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            webflowForms.init();
        });
    } else {
        // DOM already ready
        webflowForms.init();
    }
    
    // Expose global API
    window.NikoWebflowForms = {
        // Status
        isReady: () => webflowForms.isReady(),
        
        // Handler access
        getSignupHandler: () => webflowForms.getSignupHandler(),
        getLoginHandler: () => webflowForms.getLoginHandler(),
        
        // Manual initialization (if needed)
        init: () => webflowForms.init()
    };
}

export default NikoWebflowForms;