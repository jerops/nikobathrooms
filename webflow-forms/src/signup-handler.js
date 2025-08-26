/**
 * Signup Form Handler - Integrated with Auth Core
 * Preserves existing working logic while integrating with modular system
 */

class SignupFormHandler {
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
            this.setupSignupButtons();
            this.isInitialized = true;
            console.log('Domain-aware signup handlers with Webflow modal ready');
        }, 3000);
    }

    async waitForAuthCore() {
        // Check if already available
        if (window.NikoAuthCore && window.NikoAuthCore._ready) {
            console.log('Auth core already ready');
            return;
        }
        
        // Wait for ready event
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.NikoAuthCore && window.NikoAuthCore._ready) {
                    console.log('Auth core is ready');
                    resolve();
                    return;
                }
                setTimeout(checkReady, 50);
            };
            
            // Listen for ready event
            window.addEventListener('NikoAuthCoreReady', () => {
                console.log('Auth core ready event received');
                resolve();
            }, { once: true });
            
            // Start checking immediately
            checkReady();
            
            // Fallback timeout
            setTimeout(() => {
                console.warn('Auth core ready timeout - proceeding anyway');
                resolve();
            }, 5000);
        });
    }

    setupPasswordToggles() {
        console.log('Setting up password toggles...');
        
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

    setupSignupButtons() {
        console.log('Setting up signup handlers with Webflow modal...');

        // Customer signup
        const customerSignupBtn = document.getElementById('customer-signup-btn');
        if (customerSignupBtn) {
            customerSignupBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Customer signup attempt...');
                
                const name = document.getElementById('customer-name-input').value;
                const email = document.getElementById('customer-email-input').value;
                const password = document.getElementById('customer-password-input').value;
                
                await this.handleSignup(email, password, name, 'Customer');
            });
        }

        // Retailer signup
        const retailerSignupBtn = document.getElementById('retailer-signup-btn');
        if (retailerSignupBtn) {
            retailerSignupBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                console.log('Retailer signup attempt...');
                
                const name = document.getElementById('retailer-name-input').value;
                const email = document.getElementById('retailer-email-input').value;
                const password = document.getElementById('retailer-password-input').value;
                
                await this.handleSignup(email, password, name, 'Retailer');
            });
        }
    }

    async handleSignup(email, password, name, userType) {
        try {
            const result = await this.authCore.register(email, password, name, userType);
            console.log('Signup result:', result);
            
            if (result.success) {
                this.showWebflowConfirmationModal(email, userType);
            } else {
                this.showErrorMessage(result.error);
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showErrorMessage('Registration failed. Please try again.');
        }
    }

    showWebflowConfirmationModal(email, userType) {
        // Find your modal component
        const modal = document.querySelector('[niko-data], .main-confirmation-modal_component');
        
        if (modal) {
            // Update modal content to show success message instead of contact form
            const titleElement = modal.querySelector('h2');
            const descriptionElement = modal.querySelector('p');
            const formWrapper = modal.querySelector('.main-confirmation-modal_form_component');
            
            if (titleElement) {
                titleElement.textContent = 'Account Created Successfully!';
            }
            
            if (descriptionElement) {
                descriptionElement.innerHTML = `Welcome to <strong>Niko Bathrooms</strong>!<br>We've sent a confirmation email to <strong>${email}</strong><br><br>Please check your email and click the confirmation link to activate your ${userType.toLowerCase()} account.`;
            }
            
            // Hide the form and show success content
            if (formWrapper) {
                formWrapper.style.display = 'none';
            }
            
            // Show the modal
            modal.style.display = 'flex';
            modal.style.opacity = '1';
            
            // Add close functionality
            const closeButton = modal.querySelector('.main-confirmation-modal_close-button');
            const overlay = modal.querySelector('.main-confirmation-modal_background-overlay');
            
            const closeModal = () => {
                modal.style.display = 'none';
                modal.style.opacity = '0';
                // Reset form visibility for next time
                if (formWrapper) formWrapper.style.display = 'block';
            };
            
            if (closeButton) {
                closeButton.addEventListener('click', closeModal);
            }
            
            if (overlay) {
                overlay.addEventListener('click', closeModal);
            }
        }
    }

    showErrorMessage(message) {
        const errorElement = document.querySelector('.w--tab-active .error-text');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.parentElement.parentElement.style.display = 'block';
        }
    }
}

export default SignupFormHandler;