/* 
 * STANDALONE WEBFLOW SIGNUP SCRIPT
 * Place this in your signup page's custom code section
 * No bundling required - works directly in Webflow
 */

console.log('📝 Standalone Webflow Signup Script Loading...');

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
        console.log('🚀 Initializing Webflow Signup...');
        
        loadSupabase().then(() => {
            const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client ready');
            
            setupSignupHandlers(supabaseClient);
        });
    }
    
    function setupSignupHandlers(supabaseClient) {
        console.log('🔧 Setting up signup handlers...');
        
        // Customer signup button
        const customerBtn = document.getElementById('customer-signup-btn');
        if (customerBtn) {
            console.log('✅ Found customer signup button');
            customerBtn.addEventListener('click', (e) => handleSignup(e, supabaseClient, 'customer', 'Customer'));
        }
        
        // Retailer signup button
        const retailerBtn = document.getElementById('retailer-signup-btn');
        if (retailerBtn) {
            console.log('✅ Found retailer signup button');
            retailerBtn.addEventListener('click', (e) => handleSignup(e, supabaseClient, 'retailer', 'Retailer'));
        }
        
        // Generic form submission
        const signupForms = document.querySelectorAll('form[data-name*=\"Signup\"], .signup-form, form.signup-form');
        signupForms.forEach(form => {
            console.log('✅ Found signup form');
            form.addEventListener('submit', (e) => handleFormSignup(e, supabaseClient));
        });
        
        // Setup password validation and toggles
        setupPasswordValidation();
        setupPasswordToggles();
    }
    
    async function handleSignup(e, supabaseClient, userType, userRole) {
        e.preventDefault();
        console.log(`📝 ${userType} signup triggered`);
        
        const nameInput = document.getElementById(`${userType}-name-input`);
        const emailInput = document.getElementById(`${userType}-email-input`);
        const passwordInput = document.getElementById(`${userType}-password-input`);
        const confirmInput = document.getElementById(`${userType}-confirm-password-input`);
        
        if (!nameInput || !emailInput || !passwordInput) {
            console.error('❌ Signup inputs not found');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmInput?.value || '';
        
        // Validation
        if (!name || !email || !password) {
            showError('Please fill in all required fields');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        if (confirmInput && password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        showLoading(e.target, true);
        hideError();
        
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        user_type: userRole,
                        role: userRole
                    }
                }
            });
            
            if (error) throw error;
            
            console.log('✅ Signup successful:', data.user?.email);
            
            // Show success message
            showSuccess('Registration successful! Please check your email to confirm your account.');
            
            // Redirect after delay
            setTimeout(() => {
                const redirectUrl = getRedirectUrl(userRole);
                console.log('🔄 Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Signup failed:', error);
            showError(error.message || 'Registration failed. Please try again.');
        } finally {
            showLoading(e.target, false);
        }
    }
    
    async function handleFormSignup(e, supabaseClient) {
        e.preventDefault();
        console.log('📝 Form signup triggered');
        
        const form = e.target;
        const name = form.querySelector('input[name*=\"name\"], input[placeholder*=\"name\" i]')?.value?.trim();
        const email = form.querySelector('input[type=\"email\"]')?.value?.trim();
        const password = form.querySelector('input[type=\"password\"]:not([name*=\"confirm\"])')?.value;
        const confirmPassword = form.querySelector('input[type=\"password\"][name*=\"confirm\"], input[type=\"password\"][placeholder*=\"confirm\" i]')?.value;
        
        // Determine user type
        const userType = form.dataset.userType || form.getAttribute('data-user-type') || 'Customer';
        
        // Validation
        if (!name || !email || !password) {
            showError('Please fill in all required fields');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        if (confirmPassword && password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        const submitBtn = form.querySelector('button[type=\"submit\"], input[type=\"submit\"]');
        showLoading(submitBtn, true);
        hideError();
        
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        user_type: userType,
                        role: userType
                    }
                }
            });
            
            if (error) throw error;
            
            console.log('✅ Form signup successful:', data.user?.email);
            
            showSuccess('Registration successful! Please check your email to confirm your account.');
            
            setTimeout(() => {
                const redirectUrl = getRedirectUrl(userType);
                window.location.href = redirectUrl;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Form signup failed:', error);
            showError(error.message || 'Registration failed. Please try again.');
        } finally {
            showLoading(submitBtn, false);
        }
    }
    
    function setupPasswordValidation() {
        console.log('🔒 Setting up password validation...');
        
        // Customer password validation
        const customerConfirm = document.getElementById('customer-confirm-password-input');
        if (customerConfirm) {
            customerConfirm.addEventListener('input', () => validatePasswordMatch('customer'));
            customerConfirm.addEventListener('blur', () => validatePasswordMatch('customer'));
        }
        
        // Retailer password validation
        const retailerConfirm = document.getElementById('retailer-confirm-password-input');
        if (retailerConfirm) {
            retailerConfirm.addEventListener('input', () => validatePasswordMatch('retailer'));
            retailerConfirm.addEventListener('blur', () => validatePasswordMatch('retailer'));
        }
        
        // Password strength indicators
        const passwordInputs = document.querySelectorAll('input[type=\"password\"]:not([id*=\"confirm\"])');\n        passwordInputs.forEach(input => {\n            input.addEventListener('input', function(e) {\n                const password = e.target.value;\n                \n                // Reset styling\n                e.target.style.borderColor = '';\n                \n                if (password.length > 0) {\n                    if (password.length < 6) {\n                        e.target.style.borderColor = '#ff6b6b';\n                    } else if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(password)) {\n                        e.target.style.borderColor = '#51cf66';\n                    } else {\n                        e.target.style.borderColor = '#ffd43b';\n                    }\n                }\n            });\n        });\n    }\n    \n    function validatePasswordMatch(userType) {\n        const password = document.getElementById(`${userType}-password-input`)?.value;\n        const confirmPassword = document.getElementById(`${userType}-confirm-password-input`)?.value;\n        const confirmInput = document.getElementById(`${userType}-confirm-password-input`);\n        \n        if (!password || !confirmPassword || !confirmInput) {\n            return true;\n        }\n        \n        if (password !== confirmPassword) {\n            confirmInput.style.borderColor = '#ff6b6b';\n            return false;\n        } else {\n            confirmInput.style.borderColor = '#51cf66';\n            return true;\n        }\n    }\n    \n    function setupPasswordToggles() {\n        const toggleButtons = document.querySelectorAll('.input-visibility-toggle');\n        \n        toggleButtons.forEach(button => {\n            const showIcon = button.querySelector('[wized=\"icon_show_password\"]');\n            const hideIcon = button.querySelector('[wized=\"icon_hide_password\"]');\n            const wrapper = button.closest('.form_field-wrapper');\n            const passwordInput = wrapper?.querySelector('input[type=\"password\"], input[type=\"text\"]');\n            \n            if (passwordInput && showIcon && hideIcon) {\n                hideIcon.style.display = 'none';\n                \n                button.addEventListener('click', function(e) {\n                    e.preventDefault();\n                    e.stopPropagation();\n                    \n                    if (passwordInput.type === 'password') {\n                        passwordInput.type = 'text';\n                        showIcon.style.display = 'none';\n                        hideIcon.style.display = 'block';\n                    } else {\n                        passwordInput.type = 'password';\n                        showIcon.style.display = 'block';\n                        hideIcon.style.display = 'none';\n                    }\n                });\n                \n                console.log('✅ Password toggle setup');\n            }\n        });\n    }\n    \n    function getRedirectUrl(userRole) {\n        const currentDomain = window.location.origin;\n        const basePath = '/dev/app';\n        \n        if (userRole === 'Retailer' || userRole === 'retailer') {\n            return `${currentDomain}${basePath}/retailer/dashboard`;\n        } else {\n            return `${currentDomain}${basePath}/customer/dashboard`;\n        }\n    }\n    \n    function showLoading(button, isLoading) {\n        if (!button) return;\n        \n        if (isLoading) {\n            button.dataset.originalText = button.textContent;\n            button.textContent = 'Creating account...';\n            button.disabled = true;\n            button.style.opacity = '0.7';\n        } else {\n            button.textContent = button.dataset.originalText || 'Sign up';\n            button.disabled = false;\n            button.style.opacity = '1';\n        }\n    }\n    \n    function showSuccess(message) {\n        console.log('✅ Showing success:', message);\n        \n        const successElement = document.querySelector('.w-form-done') ||\n                              document.querySelector('.success-message') ||\n                              document.querySelector('.form-success');\n        \n        if (successElement) {\n            successElement.textContent = message;\n            successElement.style.display = 'block';\n            \n            // Hide any error messages\n            hideError();\n        } else {\n            alert(message);\n        }\n    }\n    \n    function showError(message) {\n        console.log('⚠️ Showing error:', message);\n        \n        const errorElement = document.querySelector('.w--tab-active .error-text') ||\n                            document.querySelector('.error-message') ||\n                            document.querySelector('.form-error') ||\n                            document.querySelector('.w-form-fail');\n        \n        if (errorElement) {\n            errorElement.textContent = message;\n            errorElement.style.display = 'block';\n            \n            const container = errorElement.closest('.error-container, .w-form-fail');\n            if (container) {\n                container.style.display = 'block';\n            }\n        } else {\n            alert(message);\n        }\n    }\n    \n    function hideError() {\n        const errorElements = document.querySelectorAll('.error-text, .error-message, .form-error, .w-form-fail');\n        errorElements.forEach(element => {\n            element.style.display = 'none';\n            const container = element.closest('.error-container');\n            if (container) {\n                container.style.display = 'none';\n            }\n        });\n    }\n    \n    // Start initialization\n    if (document.readyState === 'loading') {\n        document.addEventListener('DOMContentLoaded', init);\n    } else {\n        init();\n    }\n    \n    console.log('✅ Webflow Signup Script Loaded');\n    \n})();