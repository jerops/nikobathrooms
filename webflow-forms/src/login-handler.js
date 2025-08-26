/**
 * Login Form Handler - Integrated with Auth Core
 * Preserves existing working logic while integrating with modular system
 */

class LoginFormHandler {
    constructor() {
        this.authCore = null;
        this.isInitialized = false;
    }

    async init() {
        // Wait for auth core to be available
        await this.waitForAuthCore();
        this.authCore = window.NikoAuthCore;
        
        // Setup handlers with delay for Webflow
        setTimeout(() => {
            this.setupPasswordToggles();
            this.setupLoginButtons();
            this.isInitialized = true;
            console.log('Domain-aware login handlers with email confirmation check ready');
        }, 3000);
    }

    async waitForAuthCore() {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait

        while (attempts < maxAttempts) {
            if (window.NikoAuthCore) {
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.error('Auth core not found. Make sure auth-core module is loaded first.');
    }

    setupPasswordToggles() {
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
    }

    setupLoginButtons() {
        console.log('Setting up login handlers with email confirmation check...');

        // Customer login
        const customerLoginBtn = document.getElementById('customer-login-btn');
        if (customerLoginBtn) {
            customerLoginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Customer login attempt...');
                
                const email = document.getElementById('customer-email-input').value;
                const password = document.getElementById('customer-password-input').value;
                
                await this.handleLogin(email, password, 'Customer');
            });
        }

        // Retailer login
        const retailerLoginBtn = document.getElementById('retailer-login-btn');
        if (retailerLoginBtn) {
            retailerLoginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Retailer login attempt...');
                
                const email = document.getElementById('retailer-email-input').value;
                const password = document.getElementById('retailer-password-input').value;
                
                await this.handleLogin(email, password, 'Retailer');
            });
        }
    }

    async handleLogin(email, password, userType) {
        try {
            const result = await this.authCore.login(email, password);
            console.log('Login result:', result);
            
            if (result.success) {
                // Only redirect if user is confirmed
                const redirectUrl = this.getRedirectUrl(userType);
                console.log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            } else {
                console.error('Login failed:', result.error);
                this.showErrorMessage(result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showErrorMessage('Login failed. Please try again.');
        }
    }

    getRedirectUrl(userType) {
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

    showErrorMessage(message) {
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
}

export default LoginFormHandler;