// RESTORED LOGIN FORM HANDLER
// Fixed version with improved error handling and timing

console.log('🔐 Login form handler loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, setting up login forms...');
    
    // Wait for NikoPIM to be available
    function waitForNikoPIM() {
        if (window.NikoPIM && typeof window.NikoPIM.login === 'function') {
            console.log('✅ NikoPIM available, setting up login forms');
            setupLoginForms();
            setupPasswordToggle();
        } else {
            console.log('⏳ Waiting for NikoPIM...');
            setTimeout(waitForNikoPIM, 100);
        }
    }
    
    // Also listen for the custom ready event
    window.addEventListener('NikoPIMReady', function() {
        console.log('🚀 NikoPIMReady event received');
        setupLoginForms();
        setupPasswordToggle();
    });
    
    function getRedirectUrl(userRole) {
        const currentDomain = window.location.origin;
        const basePath = '/dev/app';
        
        // Normalize role comparison
        const role = (userRole || '').toLowerCase();
        
        if (role === 'customer' || role === 'Customer') {
            return `${currentDomain}${basePath}/customer/dashboard`;
        } else if (role === 'retailer' || role === 'Retailer') {
            return `${currentDomain}${basePath}/retailer/dashboard`;
        } else {
            // Default to customer dashboard if role is unclear
            return `${currentDomain}${basePath}/customer/dashboard`;
        }
    }
    
    function setupLoginForms() {
        console.log('🔧 Setting up login forms...');
        
        // Customer login
        const customerLoginBtn = document.getElementById('customer-login-btn');
        if (customerLoginBtn) {
            console.log('✅ Found customer login button');
            customerLoginBtn.addEventListener('click', handleCustomerLogin);
        } else {
            console.log('⚠️ Customer login button not found');
        }
        
        // Retailer login
        const retailerLoginBtn = document.getElementById('retailer-login-btn');
        if (retailerLoginBtn) {
            console.log('✅ Found retailer login button');
            retailerLoginBtn.addEventListener('click', handleRetailerLogin);
        } else {
            console.log('⚠️ Retailer login button not found');
        }
        
        // Generic login form (if using form submit)
        const loginForms = document.querySelectorAll('form[data-name=\"Login-Form\"], .login-form');
        loginForms.forEach((form, index) => {
            console.log(`✅ Found login form ${index + 1}`);
            form.addEventListener('submit', handleGenericLogin);
        });
    }
    
    function setupPasswordToggle() {
        console.log('👁️ Setting up password visibility toggles...');
        
        const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
        toggleButtons.forEach((button, index) => {
            console.log(`🔧 Setting up toggle button ${index + 1}`);
            
            const showIcon = button.querySelector('[wized=\"icon_show_password\"]');
            const hideIcon = button.querySelector('[wized=\"icon_hide_password\"]');
            const passwordInput = button.closest('.form_field-wrapper')?.querySelector('input[type=\"password\"], input[type=\"text\"]');
            
            if (passwordInput && showIcon && hideIcon) {
                // Initially hide the "hide" icon
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
                
                console.log(`✅ Password toggle ${index + 1} set up successfully`);
            } else {
                console.log(`⚠️ Password toggle ${index + 1} missing required elements`);
            }
        });\n    }\n    \n    async function handleCustomerLogin(e) {\n        console.log('👤 Customer login triggered');\n        e.preventDefault();\n        \n        try {\n            showLoading('customer', true);\n            hideError('customer');\n            \n            const email = document.getElementById('customer-email-input')?.value?.trim();\n            const password = document.getElementById('customer-password-input')?.value;\n            \n            if (!email || !password) {\n                throw new Error('Please enter both email and password');\n            }\n            \n            console.log('📧 Customer login attempt:', email);\n            const result = await window.NikoPIM.login(email, password);\n            \n            if (result.success) {\n                console.log('✅ Customer login successful');\n                const redirectUrl = getRedirectUrl(result.role);\n                console.log('🔄 Redirecting to:', redirectUrl);\n                window.location.href = redirectUrl;\n            } else {\n                throw new Error(result.error || 'Login failed');\n            }\n        } catch (error) {\n            console.error('❌ Customer login error:', error);\n            showError('customer', error.message);\n        } finally {\n            showLoading('customer', false);\n        }\n    }\n    \n    async function handleRetailerLogin(e) {\n        console.log('🏪 Retailer login triggered');\n        e.preventDefault();\n        \n        try {\n            showLoading('retailer', true);\n            hideError('retailer');\n            \n            const email = document.getElementById('retailer-email-input')?.value?.trim();\n            const password = document.getElementById('retailer-password-input')?.value;\n            \n            if (!email || !password) {\n                throw new Error('Please enter both email and password');\n            }\n            \n            console.log('📧 Retailer login attempt:', email);\n            const result = await window.NikoPIM.login(email, password);\n            \n            if (result.success) {\n                console.log('✅ Retailer login successful');\n                const redirectUrl = getRedirectUrl(result.role);\n                console.log('🔄 Redirecting to:', redirectUrl);\n                window.location.href = redirectUrl;\n            } else {\n                throw new Error(result.error || 'Login failed');\n            }\n        } catch (error) {\n            console.error('❌ Retailer login error:', error);\n            showError('retailer', error.message);\n        } finally {\n            showLoading('retailer', false);\n        }\n    }\n    \n    async function handleGenericLogin(e) {\n        console.log('📝 Generic form login triggered');\n        e.preventDefault();\n        \n        try {\n            const form = e.target;\n            const email = form.querySelector('input[type=\"email\"], input[name*=\"email\"]')?.value?.trim();\n            const password = form.querySelector('input[type=\"password\"], input[name*=\"password\"]')?.value;\n            \n            if (!email || !password) {\n                throw new Error('Please enter both email and password');\n            }\n            \n            console.log('📧 Generic login attempt:', email);\n            const result = await window.NikoPIM.login(email, password);\n            \n            if (result.success) {\n                console.log('✅ Generic login successful');\n                const redirectUrl = getRedirectUrl(result.role);\n                console.log('🔄 Redirecting to:', redirectUrl);\n                window.location.href = redirectUrl;\n            } else {\n                throw new Error(result.error || 'Login failed');\n            }\n        } catch (error) {\n            console.error('❌ Generic login error:', error);\n            showError('form', error.message);\n        }\n    }\n    \n    function showLoading(userType, isLoading) {\n        const button = document.getElementById(`${userType}-login-btn`);\n        if (button) {\n            if (isLoading) {\n                button.textContent = 'Signing in...';\n                button.disabled = true;\n                button.style.opacity = '0.7';\n            } else {\n                button.textContent = 'Log in';\n                button.disabled = false;\n                button.style.opacity = '1';\n            }\n        }\n    }\n    \n    function showError(userType, message) {\n        console.log(`⚠️ Showing error for ${userType}:`, message);\n        \n        // Try multiple error selectors\n        const errorSelectors = [\n            '.w--tab-active .error-text',\n            `.${userType}-error`,\n            '.error-message',\n            '.form-error',\n            '[data-error=\"true\"]'\n        ];\n        \n        let errorElement = null;\n        for (const selector of errorSelectors) {\n            errorElement = document.querySelector(selector);\n            if (errorElement) break;\n        }\n        \n        if (errorElement) {\n            errorElement.textContent = message;\n            const errorContainer = errorElement.closest('.error-container, .error-wrapper') || errorElement.parentElement;\n            if (errorContainer) {\n                errorContainer.style.display = 'block';\n            }\n            errorElement.style.display = 'block';\n            console.log('✅ Error message displayed');\n        } else {\n            console.log('⚠️ No error element found, using alert');\n            alert(message);\n        }\n    }\n    \n    function hideError(userType) {\n        const errorElements = document.querySelectorAll('.error-text, .error-message, .form-error, [data-error=\"true\"]');\n        errorElements.forEach(element => {\n            element.style.display = 'none';\n            const container = element.closest('.error-container, .error-wrapper');\n            if (container) {\n                container.style.display = 'none';\n            }\n        });\n    }\n    \n    // Start the initialization\n    console.log('🚀 Starting login form initialization...');\n    waitForNikoPIM();\n});\n\nconsole.log('✅ Login form handler loaded');