/* 
 * STANDALONE WEBFLOW LOGIN SCRIPT
 * Place this in your login page's custom code section
 * No bundling required - works directly in Webflow
 */

console.log('🔐 Standalone Webflow Login Script Loading...');

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
        console.log('🚀 Initializing Webflow Login...');
        
        loadSupabase().then(() => {
            const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client ready');
            
            setupLoginHandlers(supabaseClient);
        });
    }
    
    function setupLoginHandlers(supabaseClient) {
        console.log('🔧 Setting up login handlers...');
        
        // Customer login button
        const customerBtn = document.getElementById('customer-login-btn');
        if (customerBtn) {
            console.log('✅ Found customer login button');
            customerBtn.addEventListener('click', (e) => handleLogin(e, supabaseClient, 'customer'));
        }
        
        // Retailer login button
        const retailerBtn = document.getElementById('retailer-login-btn');
        if (retailerBtn) {
            console.log('✅ Found retailer login button');
            retailerBtn.addEventListener('click', (e) => handleLogin(e, supabaseClient, 'retailer'));
        }
        
        // Generic form submission
        const loginForms = document.querySelectorAll('form[data-name*=\"Login\"], .login-form, form.login-form');
        loginForms.forEach(form => {
            console.log('✅ Found login form');
            form.addEventListener('submit', (e) => handleFormLogin(e, supabaseClient));
        });
        
        // Setup password toggles
        setupPasswordToggles();
    }
    
    async function handleLogin(e, supabaseClient, userType) {
        e.preventDefault();
        console.log(`🔐 ${userType} login triggered`);
        
        const emailInput = document.getElementById(`${userType}-email-input`);
        const passwordInput = document.getElementById(`${userType}-password-input`);
        
        if (!emailInput || !passwordInput) {
            console.error('❌ Login inputs not found');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        showLoading(e.target, true);
        hideError();
        
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            console.log('✅ Login successful:', data.user.email);
            
            // Get user role
            const userRole = data.user?.user_metadata?.user_type || data.user?.user_metadata?.role || 'Customer';
            
            // Redirect to appropriate dashboard
            const redirectUrl = getRedirectUrl(userRole);
            console.log('🔄 Redirecting to:', redirectUrl);
            
            window.location.href = redirectUrl;
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            showError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            showLoading(e.target, false);
        }
    }
    
    async function handleFormLogin(e, supabaseClient) {
        e.preventDefault();
        console.log('📝 Form login triggered');
        
        const form = e.target;
        const email = form.querySelector('input[type=\"email\"]')?.value?.trim();
        const password = form.querySelector('input[type=\"password\"]')?.value;
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        const submitBtn = form.querySelector('button[type=\"submit\"], input[type=\"submit\"]');
        showLoading(submitBtn, true);
        hideError();
        
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            console.log('✅ Form login successful:', data.user.email);
            
            const userRole = data.user?.user_metadata?.user_type || data.user?.user_metadata?.role || 'Customer';
            const redirectUrl = getRedirectUrl(userRole);
            
            window.location.href = redirectUrl;
            
        } catch (error) {
            console.error('❌ Form login failed:', error);
            showError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            showLoading(submitBtn, false);
        }
    }
    
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
        
        toggleButtons.forEach(button => {
            const showIcon = button.querySelector('[wized=\"icon_show_password\"]');
            const hideIcon = button.querySelector('[wized=\"icon_hide_password\"]');
            const wrapper = button.closest('.form_field-wrapper');
            const passwordInput = wrapper?.querySelector('input[type=\"password\"], input[type=\"text\"]');
            
            if (passwordInput && showIcon && hideIcon) {
                hideIcon.style.display = 'none';
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        showIcon.style.display = 'none';
                        hideIcon.style.display = 'block';
                    } else {
                        passwordInput.type = 'password';
                        showIcon.style.display = 'block';
                        hideIcon.style.display = 'none';
                    }
                });
                
                console.log('✅ Password toggle setup');
            }
        });
    }
    
    function getRedirectUrl(userRole) {
        const currentDomain = window.location.origin;
        const basePath = '/dev/app';
        
        if (userRole === 'Retailer' || userRole === 'retailer') {
            return `${currentDomain}${basePath}/retailer/dashboard`;
        } else {
            return `${currentDomain}${basePath}/customer/dashboard`;
        }
    }
    
    function showLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = 'Signing in...';
            button.disabled = true;
            button.style.opacity = '0.7';
        } else {
            button.textContent = button.dataset.originalText || 'Log in';
            button.disabled = false;
            button.style.opacity = '1';
        }
    }
    
    function showError(message) {
        console.log('⚠️ Showing error:', message);
        
        // Try to find error message element
        const errorElement = document.querySelector('.w--tab-active .error-text') ||
                            document.querySelector('.error-message') ||
                            document.querySelector('.form-error') ||
                            document.querySelector('.w-form-fail');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            const container = errorElement.closest('.error-container, .w-form-fail');
            if (container) {
                container.style.display = 'block';
            }
        } else {
            // Fallback to alert
            alert(message);
        }
    }
    
    function hideError() {
        const errorElements = document.querySelectorAll('.error-text, .error-message, .form-error, .w-form-fail');
        errorElements.forEach(element => {
            element.style.display = 'none';
            const container = element.closest('.error-container');
            if (container) {
                container.style.display = 'none';
            }
        });
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('✅ Webflow Login Script Loaded');
    
})();