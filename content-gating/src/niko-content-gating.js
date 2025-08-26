/**
 * Niko Content Gating System
 * Standalone module for role-based content visibility
 * Integrates with Niko PIM Authentication System
 */

import AuthStateManager from './auth-state-manager.js';
import FinsweetIntegration from './finsweet-integration.js';
import ContentGatingController from './content-gating-controller.js';

class NikoContentGatingSystem {
    constructor() {
        this.controller = new ContentGatingController();
        this.isInitialized = false;
        this.coreAuthSystem = null;
    }

    async init() {
        try {
            console.log('Initializing Niko Content Gating System...');

            // Check if core auth system is available
            if (!window.NikoPIM) {
                console.warn('Core Niko PIM Authentication System not found. Content gating requires the core authentication system to be loaded first.');
                throw new Error('Missing core authentication system');
            }

            this.coreAuthSystem = window.NikoPIM;

            // Wait for core system to be ready
            await this.waitForCoreSystem();

            // Get Supabase client from core system
            const supabaseClient = this.coreAuthSystem.supabase;
            if (!supabaseClient) {
                throw new Error('Supabase client not available from core system');
            }

            // Initialize content gating controller
            await this.controller.init(supabaseClient);

            this.isInitialized = true;
            console.log('Niko Content Gating System initialized successfully');

            // Expose public API
            this.exposePublicAPI();

            return true;

        } catch (error) {
            console.error('Failed to initialize Content Gating System:', error);
            // Apply safe defaults (guest mode)
            this.applyFallbackGating();
            return false;
        }
    }

    async waitForCoreSystem() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        while (attempts < maxAttempts) {
            if (this.coreAuthSystem.isInitialized) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Core authentication system not ready');
    }

    applyFallbackGating() {
        // Apply basic CSS-based gating as fallback
        const style = document.createElement('style');
        style.id = 'niko-content-gating-fallback';
        style.textContent = `
            [niko-data*="customer"] { display: none !important; }
            [niko-data*="retailer"] { display: none !important; }
        `;
        
        if (!document.head.contains(style)) {
            document.head.appendChild(style);
        }

        console.log('Applied fallback content gating (guest-only mode)');
    }

    exposePublicAPI() {
        // Create global namespace
        window.NikoContentGating = {
            // System info
            version: '1.0.0',
            isInitialized: () => this.isInitialized,

            // Auth state methods
            getAuthState: () => this.controller.getAuthState(),
            refreshAuthState: async () => await this.controller.refreshAuthState(),

            // Content gating methods
            gateElement: (element, authRequired, userTypeRequired) => {
                return this.controller.gateElement(element, authRequired, userTypeRequired);
            },

            addLoginPrompt: (element, message) => {
                return this.controller.addLoginPrompt(element, message);
            },

            // Utility methods
            redirectToLogin: (returnUrl) => {
                this.controller.redirectToLogin(returnUrl);
            },

            // Manual gating refresh (useful for AJAX content)
            refreshGating: async () => {
                return await this.controller.refreshAuthState();
            },

            // Debug methods
            debug: {
                getController: () => this.controller,
                getCoreSystem: () => this.coreAuthSystem,
                applyTestGating: (isAuthenticated, userType) => {
                    this.controller.applyContentGating(isAuthenticated, userType);
                }
            }
        };

        // Also expose on main namespace for convenience
        if (window.NikoPIM) {
            window.NikoPIM.ContentGating = window.NikoContentGating;
        }
    }

    // Method to handle page transitions (SPA support)
    refreshPageGating() {
        if (!this.isInitialized) return;
        
        setTimeout(async () => {
            await this.controller.refreshAuthState();
        }, 100);
    }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    const contentGatingSystem = new NikoContentGatingSystem();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            contentGatingSystem.init();
        });
    } else {
        // DOM already ready
        contentGatingSystem.init();
    }

    // Handle page navigation (for SPAs)
    window.addEventListener('popstate', () => {
        contentGatingSystem.refreshPageGating();
    });

    // Expose for manual initialization if needed
    window.NikoContentGatingSystem = contentGatingSystem;
}

export default NikoContentGatingSystem;