/* 
 * STANDALONE WEBFLOW SIGNUP SCRIPT - WEBFLOW CONFLICT FIX
 * Place this in your signup page's custom code section
 * No bundling required - works directly in Webflow
 * 
 * FIXES:
 * - Webflow form validation conflicts
 * - "Passwords cannot be submitted" error
 * - Better Supabase loading with error handling
 * - Multiple button detection methods
 * - Enhanced debugging
 * - Improved element finding
 */

console.log('📝 Webflow Signup Script with Form Conflict Fix Loading...');

(function() {
    'use strict';
    
    // Configuration
    const SUPABASE_URL = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk';
    
    // Fix Webflow form conflicts immediately
    function disableWebflowValidation() {
        console.log('🔧 Disabling Webflow form validation...');
        
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            console.log(`📝 Processing form ${index + 1}`);
            
            // Disable Webflow's native form handling
            form.setAttribute('data-wf-ignore', 'true');
            form.setAttribute('data-wf-form-validation', 'false');
            
            // Remove action to prevent default submission
            if (form.hasAttribute('action') && form.getAttribute('action') !== '#') {
                form.setAttribute('data-original-action', form.getAttribute('action'));
                form.removeAttribute('action');
            }
            
            // Set method to GET to prevent POST conflicts
            form.setAttribute('method', 'get');
            
            // Handle form submission prevention
            form.addEventListener('submit', function(e) {
                console.log('🛑 Preventing form submission');
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            
            // Remove HTML5 validation from inputs
            const inputs = form.querySelectorAll('input');
            inputs.forEach((input, inputIndex) => {
                // Store original required state
                if (input.hasAttribute('required')) {
                    input.setAttribute('data-originally-required', 'true');
                }
                
                // Remove HTML5 validation
                input.removeAttribute('required');
                input.setAttribute('novalidate', 'true');
                
                // Prevent validation popup
                input.addEventListener('invalid', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                });
                
                // Remove any existing validation listeners
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        console.log('🛑 Enter key prevented on input');
                        return false;
                    }
                });
                
                console.log(`  ✅ Input ${inputIndex + 1} validation disabled`);
            });
            
            console.log(`✅ Form ${index + 1} Webflow validation disabled`);
        });
    }
    
    // Load Supabase with better error handling
    function loadSupabase() {
        return new Promise((resolve) => {
            if (window.supabase) {
                console.log('✅ Supabase already available');
                resolve(true);
                return;
            }
            
            console.log('📦 Loading Supabase from CDN...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                console.log('✅ Supabase loaded successfully');
                setTimeout(() => resolve(true), 100);
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load Supabase:', error);
                resolve(false);
            };
            document.head.appendChild(script);
        });
    }
    
    // Initialize when DOM is ready
    async function init() {
        console.log('🚀 Initializing Webflow Signup with Conflict Fix...');
        
        // First, disable Webflow validation immediately
        disableWebflowValidation();
        
        // Load Supabase
        const supabaseLoaded = await loadSupabase();
        if (!supabaseLoaded) {
            console.error('❌ Cannot proceed without Supabase');
            return;
        }
        
        // Wait for DOM to be fully ready
        setTimeout(() => {
            setupSignupHandlers();
        }, 1000);
    }
    
    function setupSignupHandlers() {
        console.log('🔧 Setting up signup handlers...');
        
        // Enhanced element finding with debugging
        debugFormElements();
        
        // Find form elements with multiple fallback methods
        const formElements = findFormElements();
        
        // Set up handlers based on what we found
        if (formElements.customerButton) {
            console.log('✅ Setting up customer signup handler');
            setupCustomerSignup(formElements);
        }
        
        if (formElements.retailerButton) {
            console.log('✅ Setting up retailer signup handler');
            setupRetailerSignup(formElements);
        }
        
        // Generic form fallback
        if (!formElements.customerButton && !formElements.retailerButton) {
            console.log('🔄 Setting up generic form handlers');
            setupGenericForms();
        }
        
        // Setup password features
        setupPasswordValidation(formElements);
        setupPasswordToggles();
        
        // Final check - disable any remaining Webflow validation
        setTimeout(disableWebflowValidation, 2000);
    }
    
    function debugFormElements() {
        console.log('🔍 Debugging form elements...');
        
        // Show all forms
        const allForms = document.querySelectorAll('form');
        console.log(`📋 Found ${allForms.length} forms:`);
        allForms.forEach((form, i) => {
            console.log(`  ${i + 1}. Action: "${form.action}" | Method: "${form.method}" | Class: "${form.className}"`);
        });
        
        // Show all inputs
        const allInputs = document.querySelectorAll('input');
        console.log(`📝 Found ${allInputs.length} inputs:`);
        allInputs.forEach((input, i) => {
            console.log(`  ${i + 1}. ID: "${input.id}" | Type: "${input.type}" | Name: "${input.name}" | Required: ${input.hasAttribute('required')}`);
        });
        
        // Show all buttons
        const allButtons = document.querySelectorAll('button, input[type="submit"], .w-button');
        console.log(`🔘 Found ${allButtons.length} buttons:`);
        allButtons.forEach((button, i) => {
            console.log(`  ${i + 1}. ID: "${button.id}" | Type: "${button.type}" | Text: "${button.textContent?.trim()}" | Class: "${button.className}"`);
        });
    }
    
    function findFormElements() {
        console.log('🎯 Finding form elements...');
        
        const elements = {
            // Customer elements
            customerName: document.getElementById('customer-name-input') || 
                         document.querySelector('input[placeholder*="name" i]') ||
                         document.querySelector('input[type="text"]:first-of-type'),
                         
            customerEmail: document.getElementById('customer-email-input') ||
                          document.querySelector('input[type="email"]:first-of-type'),
                          
            customerPassword: document.getElementById('customer-password-input') ||
                             document.querySelector('input[type="password"]:first-of-type'),
                             
            customerConfirm: document.getElementById('customer-confirm-password-input') ||
                            document.querySelector('input[placeholder*="confirm" i]') ||
                            document.querySelectorAll('input[type="password"]')[1],
                            
            customerButton: document.getElementById('customer-signup-btn') ||
                           findSignupButton('customer'),
            
            // Retailer elements (if separate form)
            retailerName: document.getElementById('retailer-name-input'),
            retailerEmail: document.getElementById('retailer-email-input'),
            retailerPassword: document.getElementById('retailer-password-input'),
            retailerConfirm: document.getElementById('retailer-confirm-password-input'),
            retailerButton: document.getElementById('retailer-signup-btn') ||
                           findSignupButton('retailer')
        };
        
        console.log('📋 Element detection results:');
        Object.entries(elements).forEach(([key, element]) => {
            console.log(`  ${key}: ${element ? '✅ Found' : '❌ Not found'}`);
        });
        
        return elements;
    }
    
    function findSignupButton(userType = '') {
        const selectors = [
            `#${userType}-signup-btn`,
            `button[data-user="${userType}"]`,
            'button[type="submit"]',
            'input[type="submit"]',
            '.w-button',
            'button:contains("Sign up")',
            'button:contains("Sign Up")',
            'button:contains("Register")',
            'button:last-of-type'
        ];
        
        for (const selector of selectors) {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`🎯 Found ${userType} button using selector: ${selector}`);
                    return element;
                }
            } catch (e) {
                // Skip invalid selectors
                continue;
            }
        }
        
        console.log(`⚠️ No ${userType} button found with any selector`);
        return null;
    }
    
    function setupCustomerSignup(elements) {
        if (!elements.customerButton) return;
        
        // Remove existing handlers
        const newButton = elements.customerButton.cloneNode(true);
        elements.customerButton.parentNode.replaceChild(newButton, elements.customerButton);
        
        // Prevent all default behaviors
        newButton.type = 'button'; // Ensure it's not a submit button
        newButton.setAttribute('type', 'button');
        
        newButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('👤 Customer signup triggered');
            await handleSignup(e, 'Customer', {
                name: elements.customerName,
                email: elements.customerEmail,
                password: elements.customerPassword,
                confirm: elements.customerConfirm
            });
            
            return false;
        });
        
        console.log('✅ Customer signup handler attached');
    }
    
    function setupRetailerSignup(elements) {
        if (!elements.retailerButton) return;
        
        const newButton = elements.retailerButton.cloneNode(true);
        elements.retailerButton.parentNode.replaceChild(newButton, elements.retailerButton);
        
        newButton.type = 'button';
        newButton.setAttribute('type', 'button');
        
        newButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('🏪 Retailer signup triggered');
            await handleSignup(e, 'Retailer', {
                name: elements.retailerName,
                email: elements.retailerEmail,
                password: elements.retailerPassword,
                confirm: elements.retailerConfirm
            });
            
            return false;
        });
        
        console.log('✅ Retailer signup handler attached');
    }
    
    function setupGenericForms() {
        const forms = document.querySelectorAll('form, .signup-form');
        
        forms.forEach((form, index) => {
            console.log(`🔧 Setting up generic form ${index + 1}`);
            
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], .w-button, button');
            if (submitBtn) {
                const newButton = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newButton, submitBtn);
                
                newButton.type = 'button';
                newButton.setAttribute('type', 'button');
                
                newButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    console.log(`📝 Generic form ${index + 1} submitted`);
                    
                    const elements = {
                        name: form.querySelector('input[type="text"], input[placeholder*="name" i]'),
                        email: form.querySelector('input[type="email"]'),
                        password: form.querySelector('input[type="password"]:not([placeholder*="confirm" i])'),
                        confirm: form.querySelector('input[placeholder*="confirm" i]') || form.querySelectorAll('input[type="password"]')[1]
                    };
                    
                    const userType = form.dataset.userType || form.getAttribute('data-user-type') || 'Customer';
                    await handleSignup(e, userType, elements);
                    
                    return false;
                });
            }
        });
    }
    
    async function handleSignup(e, userType, elements) {
        console.log(`📝 Processing ${userType} signup...`);
        
        const button = e.target;
        const originalText = button.textContent;
        
        try {
            // Show loading
            button.textContent = 'Creating account...';
            button.disabled = true;
            button.style.opacity = '0.7';
            
            // Get values
            const name = elements.name?.value?.trim();
            const email = elements.email?.value?.trim();
            const password = elements.password?.value;
            const confirmPassword = elements.confirm?.value;
            
            console.log('📋 Form values:', {
                name: name || 'missing',
                email: email || 'missing',
                password: password ? 'provided' : 'missing',
                confirm: confirmPassword ? 'provided' : 'not required'
            });
            
            // Validation
            if (!name || !email || !password) {
                throw new Error('Please fill in all required fields');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            
            if (elements.confirm && password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            // Create Supabase client
            if (!window.supabase) {
                throw new Error('Supabase not available');
            }
            
            const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('🔗 Supabase client created');
            
            // Attempt signup
            console.log(`📤 Attempting ${userType} signup for:`, email);
            
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
            
            if (error) {
                console.error('❌ Signup error:', error);
                throw error;
            }
            
            console.log('✅ Signup successful:', data.user?.email);
            
            // Show success
            showSuccess('Registration successful! Please check your email to confirm your account.');
            
            // Redirect after delay
            setTimeout(() => {
                const redirectUrl = getRedirectUrl(userType);
                console.log('🔄 Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            }, 3000);
            
        } catch (error) {
            console.error('❌ Signup failed:', error);
            showError(error.message || 'Registration failed. Please try again.');
        } finally {
            // Reset button
            button.textContent = originalText;
            button.disabled = false;
            button.style.opacity = '1';
        }
    }
    
    function setupPasswordValidation(elements) {
        console.log('🔒 Setting up password validation...');
        
        const passwordInputs = [elements.customerPassword, elements.retailerPassword].filter(Boolean);
        const confirmInputs = [elements.customerConfirm, elements.retailerConfirm].filter(Boolean);
        
        // Password strength validation
        passwordInputs.forEach((input, index) => {
            if (input) {
                console.log(`🔧 Adding password strength validation ${index + 1}`);
                input.addEventListener('input', function(e) {
                    const password = e.target.value;
                    e.target.style.borderColor = '';
                    
                    if (password.length > 0) {
                        if (password.length < 6) {
                            e.target.style.borderColor = '#ff6b6b';
                        } else if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
                            e.target.style.borderColor = '#51cf66';
                        } else {
                            e.target.style.borderColor = '#ffd43b';
                        }
                    }
                });
            }
        });
        
        // Password match validation
        confirmInputs.forEach((input, index) => {
            if (input) {
                console.log(`🔧 Adding password match validation ${index + 1}`);
                input.addEventListener('input', () => validatePasswordMatch(input, passwordInputs[index]));
                input.addEventListener('blur', () => validatePasswordMatch(input, passwordInputs[index]));
            }
        });
    }
    
    function validatePasswordMatch(confirmInput, passwordInput) {
        if (!confirmInput || !passwordInput) return true;
        
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        
        if (password && confirmPassword) {
            if (password !== confirmPassword) {
                confirmInput.style.borderColor = '#ff6b6b';
                return false;
            } else {
                confirmInput.style.borderColor = '#51cf66';
                return true;
            }
        }
        
        return true;
    }
    
    function setupPasswordToggles() {
        console.log('👁️ Setting up password visibility toggles...');
        
        const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
        
        toggleButtons.forEach((button, index) => {
            console.log(`🔧 Setting up toggle button ${index + 1}`);
            
            const showIcon = button.querySelector('[wized="icon_show_password"]');
            const hideIcon = button.querySelector('[wized="icon_hide_password"]');
            const wrapper = button.closest('.form_field-wrapper');
            const passwordInput = wrapper?.querySelector('input[type="password"], input[type="text"]');
            
            if (passwordInput && showIcon && hideIcon) {
                // Initially hide the "hide" icon
                hideIcon.style.display = 'none';
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('👁️ Password toggle clicked');
                    
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
                
                console.log(`✅ Password toggle ${index + 1} setup complete`);
            } else {
                console.log(`⚠️ Password toggle ${index + 1} missing required elements`);
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
    
    function showSuccess(message) {
        console.log('✅ Showing success:', message);
        
        const successElement = document.querySelector('.w-form-done') ||
                              document.querySelector('.success-message') ||
                              document.querySelector('.form-success');
        
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            hideError();
        } else {
            alert(message);
        }
    }
    
    function showError(message) {
        console.log('⚠️ Showing error:', message);
        
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
    
    // Start initialization - run immediately and on DOM ready
    disableWebflowValidation(); // Run immediately
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also try again after a delay in case of timing issues
    setTimeout(disableWebflowValidation, 1000);
    setTimeout(disableWebflowValidation, 3000);
    
    console.log('✅ Webflow Signup Script with Conflict Fix Loaded');
    
})();