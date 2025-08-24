/* 
 * STANDALONE WEBFLOW LOGOUT SCRIPT
 * Place this in your dashboard pages' custom code section
 * No bundling required - works directly in Webflow
 */

console.log('🚪 Standalone Webflow Logout Script Loading...');

(function() {
    'use strict';
    
    // Configuration
    const SUPABASE_URL = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk';
    
    // Load Supabase if not already loaded
    function loadSupabase() {
        return new Promise((resolve) => {
            if (window.supabase) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    
    // Initialize when DOM is ready
    function init() {
        console.log('🚀 Initializing Webflow Logout...');
        
        loadSupabase().then(() => {
            const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client ready');
            
            setupLogoutHandlers(supabaseClient);
            checkAuthState(supabaseClient);
            setupAuthMonitoring(supabaseClient);
        });
    }
    
    function setupLogoutHandlers(supabaseClient) {
        console.log('🔧 Setting up logout handlers...');
        
        // Find logout buttons using multiple selectors
        const logoutSelectors = [
            '[niko-data=\"logout\"]',
            '[data-logout=\"true\"]', 
            '.logout-btn',
            '.logout-button',
            'button[data-action=\"logout\"]',
            'a[href*=\"logout\"]',
            '*[onclick*=\"logout\"]'
        ];
        
        let logoutButtons = [];
        logoutSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                if (!logoutButtons.includes(button)) {
                    logoutButtons.push(button);
                }\n            });\n        });\n        \n        console.log(`🔍 Found ${logoutButtons.length} logout buttons`);\n        \n        logoutButtons.forEach((button, index) => {\n            console.log(`🔧 Setting up logout button ${index + 1}:`, button.tagName, button.textContent?.trim());\n            \n            // Remove existing handlers to avoid duplicates\n            const newButton = button.cloneNode(true);\n            button.parentNode.replaceChild(newButton, button);\n            \n            // Add click handler\n            newButton.addEventListener('click', (e) => handleLogout(e, supabaseClient));\n            \n            console.log(`✅ Logout button ${index + 1} setup complete`);\n        });\n        \n        // Retry setup if no buttons found initially\n        if (logoutButtons.length === 0) {\n            console.log('⚠️ No logout buttons found initially. Retrying in 2 seconds...');\n            setTimeout(() => setupLogoutHandlers(supabaseClient), 2000);\n        }\n        \n        // Also check for URL-based logout\n        checkLogoutUrl(supabaseClient);\n    }\n    \n    async function handleLogout(e, supabaseClient) {\n        e.preventDefault();\n        e.stopPropagation();\n        \n        console.log('🚪 Logout triggered');\n        \n        const button = e.target;\n        const originalText = button.textContent;\n        \n        try {\n            // Show loading state\n            button.textContent = 'Logging out...';\n            button.disabled = true;\n            button.style.opacity = '0.7';\n            \n            console.log('📤 Calling Supabase signOut...');\n            const { error } = await supabaseClient.auth.signOut();\n            \n            if (error) {\n                console.error('❌ Logout error:', error);\n                throw error;\n            }\n            \n            console.log('✅ Logout successful');\n            \n            // Clear browser storage\n            try {\n                localStorage.clear();\n                sessionStorage.clear();\n                console.log('🧹 Browser storage cleared');\n            } catch (clearError) {\n                console.log('⚠️ Could not clear storage:', clearError);\n            }\n            \n            // Redirect to login page\n            const loginUrl = getLoginUrl();\n            console.log('🔄 Redirecting to:', loginUrl);\n            \n            // Force redirect to prevent back button issues\n            window.location.replace(loginUrl);\n            \n        } catch (error) {\n            console.error('❌ Logout failed:', error);\n            \n            // Reset button state\n            button.textContent = originalText;\n            button.disabled = false;\n            button.style.opacity = '1';\n            \n            // Show error alert\n            alert('Logout failed: ' + (error.message || 'Unknown error'));\n            \n            // Force redirect anyway for security\n            console.log('🔒 Force redirecting for security...');\n            setTimeout(() => {\n                const loginUrl = getLoginUrl();\n                window.location.replace(loginUrl);\n            }, 2000);\n        }\n    }\n    \n    async function checkAuthState(supabaseClient) {\n        try {\n            const { data: { user }, error } = await supabaseClient.auth.getUser();\n            \n            if (error) {\n                console.error('Auth check error:', error);\n                return;\n            }\n            \n            if (!user) {\n                console.log('👤 No authenticated user found, redirecting to login...');\n                const loginUrl = getLoginUrl();\n                window.location.replace(loginUrl);\n            } else {\n                console.log('👤 User authenticated:', user.email);\n                \n                // Display user info if elements exist\n                displayUserInfo(user);\n            }\n        } catch (error) {\n            console.error('Auth state check failed:', error);\n        }\n    }\n    \n    function displayUserInfo(user) {\n        // Try to populate user info elements\n        const userNameElements = document.querySelectorAll('[data-user=\"name\"], .user-name, #user-name');\n        const userEmailElements = document.querySelectorAll('[data-user=\"email\"], .user-email, #user-email');\n        const userRoleElements = document.querySelectorAll('[data-user=\"role\"], .user-role, #user-role');\n        \n        const userName = user.user_metadata?.name || user.email.split('@')[0];\n        const userRole = user.user_metadata?.user_type || user.user_metadata?.role || 'Customer';\n        \n        userNameElements.forEach(el => el.textContent = userName);\n        userEmailElements.forEach(el => el.textContent = user.email);\n        userRoleElements.forEach(el => el.textContent = userRole);\n        \n        if (userNameElements.length > 0 || userEmailElements.length > 0) {\n            console.log('✅ User info displayed');\n        }\n    }\n    \n    function setupAuthMonitoring(supabaseClient) {\n        console.log('🔍 Setting up auth monitoring...');\n        \n        // Listen for auth state changes\n        supabaseClient.auth.onAuthStateChange((event, session) => {\n            console.log('🔄 Auth state changed:', event);\n            \n            if (event === 'SIGNED_OUT' || !session) {\n                console.log('🔒 User signed out, redirecting...');\n                const loginUrl = getLoginUrl();\n                window.location.replace(loginUrl);\n            }\n        });\n        \n        // Periodic auth check (every 30 seconds)\n        setInterval(async () => {\n            try {\n                const { data: { user } } = await supabaseClient.auth.getUser();\n                if (!user) {\n                    console.log('🔍 Periodic check: User no longer authenticated');\n                    const loginUrl = getLoginUrl();\n                    window.location.replace(loginUrl);\n                }\n            } catch (error) {\n                console.log('⚠️ Periodic auth check failed:', error);\n            }\n        }, 30000);\n    }\n    \n    function checkLogoutUrl(supabaseClient) {\n        const urlParams = new URLSearchParams(window.location.search);\n        if (urlParams.get('action') === 'logout' || urlParams.get('logout') === 'true') {\n            console.log('🔗 Logout requested via URL parameter');\n            handleLogout({ \n                preventDefault: () => {}, \n                stopPropagation: () => {}, \n                target: { textContent: 'Logout', disabled: false, style: {} } \n            }, supabaseClient);\n        }\n    }\n    \n    function getLoginUrl() {\n        const currentDomain = window.location.origin;\n        const basePath = '/dev/app/auth';\n        return `${currentDomain}${basePath}/log-in`;\n    }\n    \n    // Global logout function for direct calls\n    window.nikoPIMLogout = async function() {\n        console.log('🔧 Direct logout call triggered');\n        \n        if (!window.supabase) {\n            console.error('❌ Supabase not loaded');\n            return;\n        }\n        \n        try {\n            const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);\n            await supabaseClient.auth.signOut();\n            \n            localStorage.clear();\n            sessionStorage.clear();\n            \n            const loginUrl = getLoginUrl();\n            window.location.replace(loginUrl);\n        } catch (error) {\n            console.error('Direct logout failed:', error);\n            // Force redirect anyway\n            const loginUrl = getLoginUrl();\n            window.location.replace(loginUrl);\n        }\n    };\n    \n    // Start initialization\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', init);\n    } else {\n        init();\n    }\n    \n    console.log('✅ Webflow Logout Script Loaded');\n    \n})();