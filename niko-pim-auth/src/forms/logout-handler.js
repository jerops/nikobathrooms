// Browser-compatible logout handler
// This file provides logout functionality that works directly in browsers

document.addEventListener('DOMContentLoaded', function() {
    function waitForNikoPIM() {
        if (window.NikoPIM && window.NikoPIM.logout) {
            setupLogoutHandlers();
            console.log('✅ Logout handlers ready');
        } else {
            setTimeout(waitForNikoPIM, 100);
        }
    }
    
    function getLoginUrl() {
        const hostname = window.location.hostname;
        let baseUrl;
        
        // Domain-specific redirects
        if (hostname === 'nikobathrooms.ie') {
            // Production
            baseUrl = 'https://nikobathrooms.ie';
        } else if (hostname === 'nikobathrooms.webflow.io') {
            // Staging
            baseUrl = 'https://nikobathrooms.webflow.io';
        } else {
            // Fallback for preview/other domains
            baseUrl = window.location.origin;
        }
        
        return `${baseUrl}/dev/app/auth/log-in`;
    }
    
    function setupLogoutHandlers() {
        // Find logout buttons and links
        const logoutElements = document.querySelectorAll('a, button, [data-logout], .logout-btn');
        
        logoutElements.forEach(element => {
            const text = (element.textContent || element.innerText || '').toLowerCase();
            const dataAction = element.getAttribute('data-action') || '';
            
            // Check if this element is a logout trigger
            if (text.includes('logout') || 
                text.includes('log out') || 
                text.includes('sign out') ||
                dataAction.includes('logout') ||
                element.hasAttribute('data-logout')) {
                
                element.addEventListener('click', handleLogout);
            }
        });
        
        // Also check for specific logout button IDs
        const logoutById = document.getElementById('logout-btn');
        if (logoutById) {
            logoutById.addEventListener('click', handleLogout);
        }
    }
    
    async function handleLogout(e) {
        e.preventDefault();
        
        const element = e.target;
        const originalText = element.textContent || element.innerText;
        
        // Show loading state
        if (element.textContent !== undefined) {
            element.textContent = 'Logging out...';
        }
        element.disabled = true;
        
        try {
            console.log('🔄 Attempting logout...');
            
            const result = await window.NikoPIM.logout();
            
            if (result && result.success) {
                console.log('✅ Logout successful');
            } else {
                console.log('⚠️ Logout completed (with potential issues)');
            }
            
            // Always redirect to login page after logout attempt
            const loginUrl = getLoginUrl();
            console.log('Redirecting to login:', loginUrl);
            window.location.href = loginUrl;
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            
            // Still redirect to login page even if logout had issues
            const loginUrl = getLoginUrl();
            console.log('Redirecting to login after error:', loginUrl);
            window.location.href = loginUrl;
        }
    }
    
    waitForNikoPIM();
});