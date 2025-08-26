// Fixed Login Handler - Improved timing and error handling
console.log('🔐 Loading improved login handler...');

// Better wait function with timeout
async function waitForAuthCore(timeout = 10000) {
    const start = Date.now();
    while (!window.NikoAuthCore || !window.NikoAuthCore.isInitialized()) {
        if (Date.now() - start > timeout) {
            throw new Error('Auth core failed to load within timeout');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return window.NikoAuthCore;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Waiting for auth core...');
        const authCore = await waitForAuthCore();
        console.log('✅ Auth core ready!');
        
        // Domain-aware redirect function
        function getRedirectUrl(userType) {
            const isStaging = window.location.hostname.includes('webflow.io');
            const baseUrl = isStaging 
                ? 'https://nikobathrooms.webflow.io'
                : 'https://www.nikobathrooms.ie';
                
            console.log('🌐 Environment:', isStaging ? 'STAGING' : 'PRODUCTION');
            console.log('🔗 Base URL:', baseUrl);
            
            return userType === 'Customer' 
                ? `${baseUrl}/dev/app/customer/dashboard`
                : `${baseUrl}/dev/app/retailer/dashboard`;
        }
        
        // Improved error message function
        function showErrorMessage(message) {
            console.log('❌ Showing error:', message);
            const errorElement = document.querySelector('.w--tab-active .error-text') || 
                                 document.querySelector('.error-text');
            
            if (errorElement) {
                if (message.includes('Email not confirmed')) {
                    errorElement.innerHTML = `
                        <strong>Email not confirmed</strong><br>
                        Please check your email and click the confirmation link before logging in.<br>
                        <small>Didn't receive the email? Check your spam folder.</small>
                    `;
                } else if (message.includes('Invalid login credentials')) {
                    errorElement.innerHTML = `
                        <strong>Login failed</strong><br>
                        Please check your email and password and try again.
                    `;
                } else {
                    errorElement.textContent = message;
                }
                
                const errorWrapper = errorElement.closest('.form_message-error-wrapper');
                if (errorWrapper) {
                    errorWrapper.style.display = 'block';
                } else if (errorElement.parentElement) {
                    errorElement.parentElement.style.display = 'block';
                }
            }
        }
        
        // Password toggle setup
        function setupPasswordToggles() {
            const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
            toggleButtons.forEach(button => {
                const showIcon = button.querySelector('[wized="icon_show_password"]');
                const hideIcon = button.querySelector('[wized="icon_hide_password"]');
                const passwordInput = button.closest('.form_field-wrapper')?.querySelector('input[type="password"], input[type="text"]');
                
                if (passwordInput && showIcon && hideIcon) {
                    hideIcon.style.display = 'none';
                    
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
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
                }
            });
        }
        
        // Generic login function
        async function handleLogin(userType) {
            const prefix = userType.toLowerCase();
            const emailInput = document.getElementById(`${prefix}-email-input`);
            const passwordInput = document.getElementById(`${prefix}-password-input`);
            const submitBtn = document.getElementById(`${prefix}-login-btn`);
            
            if (!emailInput || !passwordInput) {
                console.error(`❌ Login inputs not found for ${userType}`);
                return;
            }
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!email || !password) {
                showErrorMessage('Please enter both email and password');
                return;
            }
            
            // Show loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                console.log(`🔐 ${userType} login attempt for:`, email);
                const result = await authCore.login(email, password);
                console.log('📊 Login result:', result);
                
                if (result.success) {
                    console.log('✅ Login successful!');
                    const redirectUrl = getRedirectUrl(userType);
                    console.log('🎯 Redirecting to:', redirectUrl);
                    window.location.href = redirectUrl;
                } else {
                    console.error('❌ Login failed:', result.error);
                    showErrorMessage(result.error);
                }
            } catch (error) {
                console.error('💥 Login error:', error);
                showErrorMessage('Login failed. Please try again.');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
        
        // Setup password toggles
        setupPasswordToggles();
        
        // Customer login
        const customerLoginBtn = document.getElementById('customer-login-btn');
        if (customerLoginBtn) {
            customerLoginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await handleLogin('Customer');
            });
            console.log('✅ Customer login handler ready');
        }
        
        // Retailer login
        const retailerLoginBtn = document.getElementById('retailer-login-btn');
        if (retailerLoginBtn) {
            retailerLoginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await handleLogin('Retailer');
            });
            console.log('✅ Retailer login handler ready');
        }
        
        console.log('🎉 Login handlers fully initialized');
        
    } catch (error) {
        console.error('💥 Failed to initialize login handlers:', error);
        // Show error to user
        const errorElements = document.querySelectorAll('.error-text');
        errorElements.forEach(el => {
            el.textContent = 'System initialization failed. Please refresh the page.';
            const wrapper = el.closest('.form_message-error-wrapper');
            if (wrapper) wrapper.style.display = 'block';
        });
    }
});
