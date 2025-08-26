/**
 * Finsweet Attributes Integration
 * Handles content filtering based on authentication state
 */

class FinsweetIntegration {
    constructor() {
        this.isInitialized = false;
        this.filterInstances = [];
    }

    async init() {
        // Wait for Finsweet Attributes to load
        await this.waitForFinsweet();
        this.setupFilters();
        this.isInitialized = true;
    }

    waitForFinsweet() {
        return new Promise((resolve) => {
            if (window.fsAttributes) {
                resolve();
                return;
            }

            // Wait for Finsweet to load
            const checkFinsweet = setInterval(() => {
                if (window.fsAttributes) {
                    clearInterval(checkFinsweet);
                    resolve();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkFinsweet);
                console.warn('Finsweet Attributes not loaded');
                resolve();
            }, 10000);
        });
    }

    setupFilters() {
        if (!window.fsAttributes) {
            console.warn('Finsweet Attributes not available');
            return;
        }

        window.fsAttributes.push(['listfilter', (listInstances) => {
            this.filterInstances = listInstances;
            console.log('Finsweet list filters initialized:', listInstances.length);
        }]);
    }

    applyContentGating(isAuthenticated, userType) {
        if (!this.isInitialized || this.filterInstances.length === 0) {
            // Fallback to CSS-based gating
            this.applyCSSGating(isAuthenticated, userType);
            return;
        }

        this.filterInstances.forEach(listInstance => {
            try {
                if (isAuthenticated) {
                    // Show authenticated content
                    this.showAuthenticatedContent(listInstance, userType);
                } else {
                    // Show guest content only
                    this.showGuestContent(listInstance);
                }
            } catch (error) {
                console.error('Filter application error:', error);
                // Fallback to CSS gating
                this.applyCSSGating(isAuthenticated, userType);
            }
        });
    }

    showAuthenticatedContent(listInstance, userType) {
        // Hide guest-only elements
        const guestElements = document.querySelectorAll('[niko-data*="guest-only"]');
        guestElements.forEach(el => el.style.display = 'none');

        // Show authenticated elements
        const authElements = document.querySelectorAll('[niko-data*="authenticated-only"]');
        authElements.forEach(el => el.style.display = '');

        // Show role-specific content
        if (userType) {
            const roleElements = document.querySelectorAll(`[niko-data*="${userType.toLowerCase()}"]`);
            roleElements.forEach(el => el.style.display = '');
        }

        console.log(`Content gated for authenticated ${userType}`);
    }

    showGuestContent(listInstance) {
        // Show guest-only elements
        const guestElements = document.querySelectorAll('[niko-data*="guest-only"]');
        guestElements.forEach(el => el.style.display = '');

        // Hide authenticated elements
        const authElements = document.querySelectorAll('[niko-data*="authenticated-only"]');
        authElements.forEach(el => el.style.display = 'none');

        // Hide role-specific content
        const roleElements = document.querySelectorAll('[niko-data*="customer"], [niko-data*="retailer"]');
        roleElements.forEach(el => el.style.display = 'none');

        console.log('Content gated for guests');
    }

    applyCSSGating(isAuthenticated, userType) {
        // Fallback CSS-based content gating
        const style = document.getElementById('niko-content-gating') || document.createElement('style');
        style.id = 'niko-content-gating';

        if (isAuthenticated) {
            style.textContent = `
                [niko-data*="guest-only"] { display: none !important; }
                [niko-data*="authenticated-only"] { display: initial !important; }
                [niko-data*="${userType?.toLowerCase()}"] { display: initial !important; }
            `;
        } else {
            style.textContent = `
                [niko-data*="guest-only"] { display: initial !important; }
                [niko-data*="authenticated-only"] { display: none !important; }
                [niko-data*="customer"] { display: none !important; }
                [niko-data*="retailer"] { display: none !important; }
            `;
        }

        if (!document.head.contains(style)) {
            document.head.appendChild(style);
        }
    }

    // Method to refresh filters when auth state changes
    refreshGating(isAuthenticated, userType) {
        this.applyContentGating(isAuthenticated, userType);
    }
}

export default FinsweetIntegration;