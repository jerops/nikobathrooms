/**
 * Signup Form Handler - Fixed Version
 * Handles customer and retailer registration forms
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Loading fixed signup form handler...');
    
    // Wait for NikoPIM to be available
    function waitForNikoPIM() {
        if (typeof window.nikoPIM !== 'undefined' && window.nikoPIM.auth) {
            initializeSignupForms();
        } else {
            console.log('⏳ Waiting for NikoPIM to load...');
            setTimeout(waitForNikoPIM, 100);
        }
    }
    
    function initializeSignupForms() {
        console.log('✅ NikoPIM loaded, initializing signup forms...');
        
        // Find all forms that might be signup forms
        const signupForms = document.querySelectorAll('form[data-name*="signup"], form[data-name*="sign-up"], form[data-name*="register"]');
        
        if (signupForms.length === 0) {
            console.log('⚠️ No signup forms found by data-name, trying alternative selectors...');
            // Try to find forms with signup-related IDs or classes
            const alternativeForms = document.querySelectorAll('#signup-form, .signup-form, form');
            alternativeForms.forEach(form => {
                if (form.querySelector('input[type="email"]') && form.querySelector('input[type="password"]')) {
                    console.log('📝 Found potential signup form:', form);
                    setupSignupForm(form);
                }
            });
        } else {
            signupForms.forEach(form => {
                console.log('📝 Found signup form:', form.getAttribute('data-name'));
                setupSignupForm(form);
            });
        }
    }
    
    function setupSignupForm(form) {
        // Prevent default form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📤 Form submission intercepted');
            
            try {
                // Get form data
                const formData = new FormData(form);
                const email = formData.get('email') || form.querySelector('input[type="email"]')?.value;
                const password = formData.get('password') || form.querySelector('input[type="password"]')?.value;
                const name = formData.get('name') || form.querySelector('input[name*="name"]')?.value;
                
                // Determine user type (customer vs retailer)
                const userType = determineUserType(form);
                
                console.log('📋 Form data collected:', { email, name, userType });
                
                if (!email || !password) {
                    throw new Error('Email and password are required');
                }
                
                // Call the registration function
                const result = await window.nikoPIM.auth.register({
                    email: email,
                    password: password,
                    name: name,
                    userType: userType
                });
                
                console.log('✅ Registration successful:', result);
                
                // Redirect to dashboard
                const dashboardUrl = userType === 'retailer' ? '/dev/app/retailer-dashboard' : '/dev/app/customer-dashboard';
                window.location.href = dashboardUrl;
                
            } catch (error) {
                console.error('❌ Registration failed:', error);
                alert('Registration failed: ' + error.message);
            }
        });
    }
    
    function determineUserType(form) {
        // Check for active tabs or radio buttons to determine user type
        const retailerTab = document.querySelector('.tab-retailer.w--current, .tab-retailer.active');
        const customerTab = document.querySelector('.tab-customer.w--current, .tab-customer.active');
        
        if (retailerTab) {
            return 'retailer';
        } else if (customerTab) {
            return 'customer';
        }
        
        // Check for radio buttons or hidden inputs
        const userTypeInput = form.querySelector('input[name="user-type"], input[name="userType"]');
        if (userTypeInput) {
            return userTypeInput.value;
        }
        
        // Default to customer if we can't determine
        console.log('⚠️ Could not determine user type, defaulting to customer');
        return 'customer';
    }
    
    // Start the initialization
    waitForNikoPIM();
});
