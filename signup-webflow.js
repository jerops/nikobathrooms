// SIGNUP HANDLER - Fixed for your actual Webflow form with password toggles
console.log('📝 Loading signup handler with password toggles...');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Setting up signup with Webflow tabs and password toggles...');
    
    // Wait for auth core
    while (!window.NikoAuthCore || !window.NikoAuthCore.isInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Auth core ready');
    
    // Setup password visibility toggles
    function setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
        toggleButtons.forEach(button => {
            const showIcon = button.querySelector('[wized="icon_show_password"]');
            const hideIcon = button.querySelector('[wized="icon_hide_password"]');
            const passwordInput = button.closest('.form_field-wrapper')?.querySelector('input[type="password"], input[type="text"]');
            
            if (passwordInput && showIcon && hideIcon) {
                // Initially hide the "hide" icon
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
        console.log('👁️ Password toggles setup complete');
    }
    
    // Show error message
    function showError(message) {
        // Look for error element in active tab
        const activeTab = document.querySelector('.w--tab-active') || document.querySelector('.w-tab-content');
        const errorElement = activeTab?.querySelector('.error-text') || document.querySelector('.error-text');
        
        if (errorElement) {
            errorElement.textContent = message;
            const wrapper = errorElement.closest('.form_message-error-wrapper');
            if (wrapper) {
                wrapper.style.display = 'block';
            }
        }
        console.error('❌ Error:', message);
    }
    
    // Hide error messages
    function hideErrors() {
        const errorWrappers = document.querySelectorAll('.form_message-error-wrapper');
        errorWrappers.forEach(wrapper => {
            wrapper.style.display = 'none';
        });
    }
    
    // Show success modal
    function showSuccessModal(email, userType) {
        hideErrors(); // Hide any existing errors
        
        const modal = document.querySelector('[niko-data]') || 
                     document.querySelector('.main-confirmation-modal_component') ||
                     document.querySelector('[class*="modal"]');
        
        if (modal) {
            const title = modal.querySelector('h2') || modal.querySelector('h1');
            const description = modal.querySelector('p');
            
            if (title) {
                title.textContent = 'Account Created Successfully!';
            }
            
            if (description) {
                description.innerHTML = `
                    Welcome to <strong>Niko Bathrooms</strong>!<br><br>
                    We've sent a confirmation email to:<br>
                    <strong>${email}</strong><br><br>
                    Please check your email and click the confirmation link to activate your ${userType.toLowerCase()} account.<br><br>
                    <small style="color: #666;">Didn't receive it? Check your spam folder.</small>
                `;
            }
            
            modal.style.display = 'flex';
            modal.style.opacity = '1';
            
            // Setup close functionality
            const closeButton = modal.querySelector('.main-confirmation-modal_close-button') ||
                              modal.querySelector('[class*="close"]');
            const overlay = modal.querySelector('.main-confirmation-modal_background-overlay') ||
                          modal.querySelector('[class*="overlay"]');
            
            const closeModal = () => {
                modal.style.display = 'none';
                modal.style.opacity = '0';
                // Redirect to login page
                setTimeout(() => {
                    const loginUrl = window.location.origin + '/dev/app/auth/log-in';
                    window.location.href = loginUrl;
                }, 1000);
            };
            
            if (closeButton) {
                closeButton.addEventListener('click', closeModal);
            }
            
            if (overlay) {
                overlay.addEventListener('click', closeModal);
            }
            
            // Auto close after 8 seconds
            setTimeout(closeModal, 8000);
        } else {
            // Fallback if no modal found
            alert(`Account created! Check your email (${email}) for confirmation link.`);
            window.location.href = '/dev/app/auth/log-in';
        }
    }
    
    // Get current user type from active tab
    function getCurrentUserType() {
        const customerTab = document.querySelector('[data-w-tab="Customer"]');
        const retailerTab = document.querySelector('[data-w-tab="Retailer"]');
        
        // Check which tab is active
        if (customerTab && customerTab.classList.contains('w--current')) {
            return 'Customer';
        } else if (retailerTab && retailerTab.classList.contains('w--current')) {
            return 'Retailer';
        }
        
        // Fallback: check tab content
        const activeTabPane = document.querySelector('.w--tab-active');
        if (activeTabPane) {
            if (activeTabPane.id === 'w-tabs-0-data-w-pane-0' || activeTabPane.querySelector('[id*="customer"]')) {
                return 'Customer';
            } else {
                return 'Retailer';
            }
        }
        
        // Default fallback
        return 'Customer';
    }
    
    // Get form inputs based on user type
    function getFormInputs(userType) {
        const prefix = userType.toLowerCase();
        
        // Try with IDs first
        let nameInput = document.getElementById(`${prefix}-name-input`);
        let emailInput = document.getElementById(`${prefix}-email-input`);
        let passwordInput = document.getElementById(`${prefix}-password-input`);
        let confirmPasswordInput = document.getElementById(`${prefix}-confirm-password-input`);
        let submitBtn = document.getElementById(`${prefix}-signup-btn`);
        
        // Fallback: find in active tab
        if (!nameInput) {
            const activeTab = document.querySelector('.w--tab-active');
            if (activeTab) {
                nameInput = activeTab.querySelector('input[name*="name"], input[placeholder*="name"], input[placeholder*="Name"]');
                emailInput = activeTab.querySelector('input[type="email"], input[name*="email"]');
                passwordInput = activeTab.querySelector('input[type="password"]:first-of-type');
                confirmPasswordInput = activeTab.querySelector('input[type="password"]:last-of-type');
                submitBtn = activeTab.querySelector('button[type="submit"], input[type="submit"], .button');
            }
        }
        
        return {
            nameInput,
            emailInput, 
            passwordInput,
            confirmPasswordInput,
            submitBtn
        };
    }
    
    // Main signup function
    async function handleSignup() {
        console.log('🎯 Signup attempt started...');
        hideErrors();
        
        const userType = getCurrentUserType();
        console.log('📋 User type:', userType);
        
        const {
            nameInput,
            emailInput,
            passwordInput,
            confirmPasswordInput,
            submitBtn
        } = getFormInputs(userType);
        
        if (!nameInput || !emailInput || !passwordInput || !submitBtn) {
            console.error('❌ Missing form elements:', {
                name: !!nameInput,
                email: !!emailInput,
                password: !!passwordInput,
                submit: !!submitBtn
            });
            showError('Form elements not found. Please check the page.');
            return;
        }
        
        const name = nameInput.value?.trim();
        const email = emailInput.value?.trim();
        const password = passwordInput.value?.trim();
        const confirmPassword = confirmPasswordInput?.value?.trim();
        
        // Validation
        if (!name) {
            showError('Please enter your name');
            nameInput.focus();
            return;
        }
        
        if (!email) {
            showError('Please enter your email');
            emailInput.focus();
            return;
        }
        
        if (!email.includes('@')) {
            showError('Please enter a valid email address');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please enter a password');
            passwordInput.focus();
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            passwordInput.focus();
            return;
        }
        
        if (confirmPasswordInput && confirmPassword !== password) {
            showError('Passwords do not match');
            confirmPasswordInput.focus();
            return;
        }
        
        // Show loading state
        const originalText = submitBtn.textContent || submitBtn.value;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;
        
        try {
            console.log(`🚀 Creating ${userType} account for:`, email);
            
            const result = await window.NikoAuthCore.register(email, password, name, userType);
            
            if (result.success) {
                console.log('✅ Signup successful!');
                showSuccessModal(email, userType);
            } else {
                console.error('❌ Signup failed:', result.error);
                showError(result.error || 'Registration failed. Please try again.');
            }
            
        } catch (error) {
            console.error('💥 Signup error:', error);
            showError('Registration failed. Please try again.');
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Setup form submission
    function setupFormSubmission() {
        // Try to find the form
        const form = document.querySelector('form') || document.querySelector('[class*="form"]');
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleSignup();
            });
        }
        
        // Also setup click handlers for submit buttons
        const submitButtons = document.querySelectorAll(
            'button[type="submit"], input[type="submit"], .button, [class*="signup"], [class*="sign-up"]'
        );
        
        submitButtons.forEach(button => {
            if (button.textContent?.toLowerCase().includes('sign') || 
                button.value?.toLowerCase().includes('sign')) {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await handleSignup();
                });
            }
        });
        
        console.log(`✅ Form submission setup complete (${submitButtons.length} buttons found)`);
    }
    
    // Initialize everything
    setupPasswordToggles();
    setupFormSubmission();
    
    console.log('🎉 Signup handler fully initialized');
    
    // Debug: Log form structure
    console.log('🔍 Form structure detected:');
    console.log('- Tabs:', document.querySelectorAll('[data-w-tab]').length);
    console.log('- Forms:', document.querySelectorAll('form').length);
    console.log('- Inputs:', document.querySelectorAll('input').length);
    console.log('- Buttons:', document.querySelectorAll('button').length);
});