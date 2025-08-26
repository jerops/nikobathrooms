// SIMPLE LOGIN HANDLER - Works with niko-auth-final.js
console.log('🔐 Loading simple login handler...');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Setting up login handlers...');
    
    // Wait for auth core
    while (!window.NikoAuthCore || !window.NikoAuthCore.isInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Auth core ready for login');
    
    // Show error message
    function showError(message) {
        const errorElement = document.querySelector('.w--tab-active .error-text') || 
                            document.querySelector('.error-text');
        if (errorElement) {
            errorElement.textContent = message;
            const wrapper = errorElement.closest('.form_message-error-wrapper');
            if (wrapper) wrapper.style.display = 'block';
        }
        console.error('Error:', message);
    }
    
    // Generic login function
    async function handleLogin(userType) {
        const prefix = userType.toLowerCase();
        
        const emailInput = document.getElementById(`${prefix}-email-input`);
        const passwordInput = document.getElementById(`${prefix}-password-input`);
        const submitBtn = document.getElementById(`${prefix}-login-btn`);
        
        if (!emailInput || !passwordInput) {
            console.error(`Missing form elements for ${userType}`);
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validation
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        // Show loading
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        try {
            console.log(`🎯 ${userType} login for:`, email);
            
            const result = await window.NikoAuthCore.login(email, password);
            
            if (result.success) {
                console.log('✅ Login successful!');
                
                // Get user type from result or assume from form
                const userData = result.user;
                const actualUserType = userData?.user_metadata?.user_type || userType;
                
                // Redirect to dashboard
                const dashboardUrl = window.NikoAuthCore.getDashboardUrl(actualUserType);
                console.log('🎯 Redirecting to:', dashboardUrl);
                window.location.href = dashboardUrl;
                
            } else {
                console.error('❌ Login failed:', result.error);
                showError(result.error);
            }
            
        } catch (error) {
            console.error('💥 Login error:', error);
            showError('Login failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // Customer login
    const customerBtn = document.getElementById('customer-login-btn');
    if (customerBtn) {
        customerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogin('Customer');
        });
        console.log('✅ Customer login handler ready');
    }
    
    // Retailer login
    const retailerBtn = document.getElementById('retailer-login-btn');
    if (retailerBtn) {
        retailerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogin('Retailer');
        });
        console.log('✅ Retailer login handler ready');
    }
    
    console.log('🎉 Login handlers initialized');
});