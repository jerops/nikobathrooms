/**
 * Standalone Login Handler
 * Direct integration with auth-core, preserves existing working logic
 */

setTimeout(() => {
    console.log('Setting up login handlers with email confirmation check...');
    
    // Wait for auth core
    const waitForAuthCore = async () => {
        while (!window.NikoAuthCore) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    };
    
    waitForAuthCore().then(() => {
        // Domain-aware redirect function (unchanged)
        function getRedirectUrl(userType) {
            const isStaging = window.location.hostname.includes('webflow.io');
            const baseUrl = isStaging 
                ? 'https://nikobathrooms.webflow.io'
                : 'https://www.nikobathrooms.ie';
                
            console.log('Current domain:', window.location.hostname);
            console.log('Environment:', isStaging ? 'STAGING' : 'PRODUCTION');
            console.log('Base URL:', baseUrl);
            
            return userType === 'Customer' 
                ? `${baseUrl}/dev/app/customer/dashboard`
                : `${baseUrl}/dev/app/retailer/dashboard`;
        }
        
        // Error message function (unchanged)
        function showErrorMessage(message) {
            const errorElement = document.querySelector('.w--tab-active .error-text');
            if (errorElement) {
                if (message.includes('Email not confirmed')) {
                    errorElement.innerHTML = `
                        Email not confirmed<br>
                        Please check your email and click the confirmation link before logging in.<br>
                        <small>Didn't receive the email? Check your spam folder.</small>
                    `;
                } else {
                    errorElement.textContent = message;
                }
                errorElement.parentElement.parentElement.style.display = 'block';
            }
        }
        
        // Password toggle setup (unchanged)
        const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
        toggleButtons.forEach(button => {
            const showIcon = button.querySelector('[wized="icon_show_password"]');
            const hideIcon = button.querySelector('[wized="icon_hide_password"]');
            const passwordInput = button.closest('.form_field-wrapper').querySelector('input[type="password"], input[type="text"]');
            
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
        
        // Customer login (changed to use NikoAuthCore)
        const customerLoginBtn = document.getElementById('customer-login-btn');
        if (customerLoginBtn) {
            customerLoginBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                console.log('Customer login attempt...');
                
                const email = document.getElementById('customer-email-input').value;
                const password = document.getElementById('customer-password-input').value;
                
                try {
                    const result = await window.NikoAuthCore.login(email, password);
                    console.log('Login result:', result);
                    
                    if (result.success) {
                        const redirectUrl = getRedirectUrl('Customer');
                        console.log('Redirecting to:', redirectUrl);
                        window.location.href = redirectUrl;
                    } else {
                        console.error('Login failed:', result.error);
                        showErrorMessage(result.error);
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showErrorMessage('Login failed. Please try again.');
                }
            });
        }
        
        // Retailer login (changed to use NikoAuthCore)
        const retailerLoginBtn = document.getElementById('retailer-login-btn');
        if (retailerLoginBtn) {
            retailerLoginBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                console.log('Retailer login attempt...');
                
                const email = document.getElementById('retailer-email-input').value;
                const password = document.getElementById('retailer-password-input').value;
                
                try {
                    const result = await window.NikoAuthCore.login(email, password);
                    console.log('Login result:', result);
                    
                    if (result.success) {
                        const redirectUrl = getRedirectUrl('Retailer');
                        console.log('Redirecting to:', redirectUrl);
                        window.location.href = redirectUrl;
                    } else {
                        console.error('Login failed:', result.error);
                        showErrorMessage(result.error);
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showErrorMessage('Login failed. Please try again.');
                }
            });
        }
        
        console.log('Domain-aware login handlers with email confirmation check ready');
    });
    
}, 3000);