// SIMPLE SIGNUP HANDLER - Works with niko-auth-final.js
console.log('📝 Loading simple signup handler...');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Setting up signup handlers...');
    
    // Wait for auth core
    while (!window.NikoAuthCore || !window.NikoAuthCore.isInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Auth core ready for signup');
    
    // Show error message
    function showError(message) {
        const errorElement = document.querySelector('.error-text');
        if (errorElement) {
            errorElement.textContent = message;
            const wrapper = errorElement.closest('.form_message-error-wrapper');
            if (wrapper) wrapper.style.display = 'block';
        }
        console.error('Error:', message);
    }
    
    // Show success modal
    function showSuccessModal(email, userType) {
        const modal = document.querySelector('[niko-data], .main-confirmation-modal_component');
        if (modal) {
            const title = modal.querySelector('h2');
            const description = modal.querySelector('p');
            
            if (title) title.textContent = 'Account Created!';
            if (description) {
                description.innerHTML = `Welcome! We sent a confirmation email to <strong>${email}</strong><br><br>Please check your email and click the confirmation link to activate your ${userType.toLowerCase()} account.`;
            }
            
            modal.style.display = 'flex';
            
            // Auto-close and redirect to login
            setTimeout(() => {
                modal.style.display = 'none';
                window.location.href = '/dev/app/auth/log-in';
            }, 5000);
        }
    }
    
    // Generic signup function
    async function handleSignup(userType) {
        const prefix = userType.toLowerCase();
        
        const nameInput = document.getElementById(`${prefix}-name-input`);
        const emailInput = document.getElementById(`${prefix}-email-input`);
        const passwordInput = document.getElementById(`${prefix}-password-input`);
        const submitBtn = document.getElementById(`${prefix}-signup-btn`);
        
        if (!nameInput || !emailInput || !passwordInput) {
            console.error(`Missing form elements for ${userType}`);
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validation
        if (!name || !email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        
        // Show loading
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;
        
        try {
            console.log(`🎯 ${userType} signup for:`, email);
            
            const result = await window.NikoAuthCore.register(email, password, name, userType);
            
            if (result.success) {
                console.log('✅ Signup successful!');
                showSuccessModal(email, userType);
            } else {
                console.error('❌ Signup failed:', result.error);
                showError(result.error);
            }
            
        } catch (error) {
            console.error('💥 Signup error:', error);
            showError('Registration failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Customer signup
    const customerBtn = document.getElementById('customer-signup-btn');
    if (customerBtn) {
        customerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleSignup('Customer');
        });
        console.log('✅ Customer signup handler ready');
    }
    
    // Retailer signup
    const retailerBtn = document.getElementById('retailer-signup-btn');
    if (retailerBtn) {
        retailerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleSignup('Retailer');
        });
        console.log('✅ Retailer signup handler ready');
    }
    
    console.log('🎉 Signup handlers initialized');
});