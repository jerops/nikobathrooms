// Direct authentication without NikoPIM wrapper - works immediately
// This bypasses the initialization issues and provides working auth

document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct auth system loading...');
    
    // Initialize Supabase directly
    const supabaseUrl = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk';
    
    // Wait for Supabase to load from CDN
    function waitForSupabase() {
        if (window.supabase) {
            const client = window.supabase.createClient(supabaseUrl, supabaseKey);
            setupDirectAuth(client);
            console.log('Direct auth ready');
        } else {
            setTimeout(waitForSupabase, 100);
        }
    }
    
    function setupDirectAuth(supabase) {
        // Domain-aware redirect function
        function getRedirectUrl(userType) {
            const hostname = window.location.hostname;
            let baseUrl = hostname === 'nikobathrooms.ie' ? 'https://nikobathrooms.ie' : 
                         hostname === 'nikobathrooms.webflow.io' ? 'https://nikobathrooms.webflow.io' : 
                         window.location.origin;
            
            return userType === 'Customer' ? 
                `${baseUrl}/dev/app/customer/dashboard` : 
                `${baseUrl}/dev/app/retailer/dashboard`;
        }
        
        function getLoginUrl() {
            const hostname = window.location.hostname;
            let baseUrl = hostname === 'nikobathrooms.ie' ? 'https://nikobathrooms.ie' : 
                         hostname === 'nikobathrooms.webflow.io' ? 'https://nikobathrooms.webflow.io' : 
                         window.location.origin;
            return `${baseUrl}/dev/app/auth/log-in`;
        }
        
        // SIGNUP HANDLERS
        const customerSignup = document.getElementById('customer-signup-btn');
        if (customerSignup && !customerSignup.hasAttribute('data-handled')) {
            customerSignup.setAttribute('data-handled', 'true');
            customerSignup.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('customer-name-input')?.value;
                const email = document.getElementById('customer-email-input')?.value;
                const password = document.getElementById('customer-password-input')?.value;
                
                if (!name || !email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                customerSignup.textContent = 'Creating account...';
                customerSignup.disabled = true;
                
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email, password,
                        options: { data: { name, user_type: 'Customer' } }
                    });
                    
                    if (error) throw error;
                    alert('Registration successful!');
                    window.location.href = getRedirectUrl('Customer');
                } catch (error) {
                    alert('Registration failed: ' + error.message);
                    customerSignup.textContent = 'Sign Up';
                    customerSignup.disabled = false;
                }
            });
        }
        
        const retailerSignup = document.getElementById('retailer-signup-btn');
        if (retailerSignup && !retailerSignup.hasAttribute('data-handled')) {
            retailerSignup.setAttribute('data-handled', 'true');
            retailerSignup.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const name = document.getElementById('retailer-name-input')?.value;
                const email = document.getElementById('retailer-email-input')?.value;
                const password = document.getElementById('retailer-password-input')?.value;
                
                if (!name || !email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                retailerSignup.textContent = 'Creating account...';
                retailerSignup.disabled = true;
                
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email, password,
                        options: { data: { name, user_type: 'Retailer' } }
                    });
                    
                    if (error) throw error;
                    alert('Registration successful!');
                    window.location.href = getRedirectUrl('Retailer');
                } catch (error) {
                    alert('Registration failed: ' + error.message);
                    retailerSignup.textContent = 'Sign Up';
                    retailerSignup.disabled = false;
                }
            });
        }
        
        // LOGIN HANDLERS
        const customerLogin = document.getElementById('customer-login-btn');
        if (customerLogin && !customerLogin.hasAttribute('data-handled')) {
            customerLogin.setAttribute('data-handled', 'true');
            customerLogin.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('customer-email-input')?.value;
                const password = document.getElementById('customer-password-input')?.value;
                
                if (!email || !password) {
                    alert('Please enter email and password');
                    return;
                }
                
                customerLogin.textContent = 'Logging in...';
                customerLogin.disabled = true;
                
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    
                    if (error) throw error;
                    const userType = data.user?.user_metadata?.user_type || 'Customer';
                    window.location.href = getRedirectUrl(userType);
                } catch (error) {
                    alert('Login failed: ' + error.message);
                    customerLogin.textContent = 'Log In';
                    customerLogin.disabled = false;
                }
            });
        }
        
        const retailerLogin = document.getElementById('retailer-login-btn');
        if (retailerLogin && !retailerLogin.hasAttribute('data-handled')) {
            retailerLogin.setAttribute('data-handled', 'true');
            retailerLogin.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('retailer-email-input')?.value;
                const password = document.getElementById('retailer-password-input')?.value;
                
                if (!email || !password) {
                    alert('Please enter email and password');
                    return;
                }
                
                retailerLogin.textContent = 'Logging in...';
                retailerLogin.disabled = true;
                
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    
                    if (error) throw error;
                    const userType = data.user?.user_metadata?.user_type || 'Customer';
                    window.location.href = getRedirectUrl(userType);
                } catch (error) {
                    alert('Login failed: ' + error.message);
                    retailerLogin.textContent = 'Log In';
                    retailerLogin.disabled = false;
                }
            });
        }
        
        // LOGOUT HANDLERS
        const logoutElements = document.querySelectorAll('a, button');
        logoutElements.forEach(element => {
            const text = (element.textContent || '').toLowerCase();
            if ((text.includes('logout') || text.includes('log out') || text.includes('sign out')) && 
                !element.hasAttribute('data-handled')) {
                
                element.setAttribute('data-handled', 'true');
                element.addEventListener('click', async (e) => {
                    e.preventDefault();
                    
                    try {
                        await supabase.auth.signOut();
                    } catch (error) {
                        console.log('Logout error:', error);
                    }
                    
                    window.location.href = getLoginUrl();
                });
            }
        });
    }
    
    waitForSupabase();
});