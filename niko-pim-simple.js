// Niko PIM Authentication System - Simple Working Version
// This file provides basic authentication functionality that actually works
// No webpack, no complex builds, just working JavaScript

(function() {
  'use strict';
  
  console.log('🚀 Loading Niko PIM Authentication (Simple Version)...');
  
  // Supabase Configuration
  const SUPABASE_URL = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ';
  
  // Load Supabase if not already loaded
  if (typeof supabase === 'undefined') {
    console.log('📦 Loading Supabase SDK...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = initializeNikoPIM;
    document.head.appendChild(script);
  } else {
    initializeNikoPIM();
  }
  
  function initializeNikoPIM() {
    // Initialize Supabase client
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
    
    // Create simple NikoPIM object
    window.NikoPIM = {
      // Registration function
      async register(email, password, name, userType) {
        console.log('📝 Registering user:', { email, userType });
        
        try {
          const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                name: name,
                user_type: userType,
                role: userType
              }
            }
          });
          
          if (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: error.message };
          }
          
          console.log('✅ Registration successful:', data.user?.email);
          
          // Call Edge Function to create Webflow record
          try {
            const { data: edgeData, error: edgeError } = await supabaseClient.functions.invoke('create-webflow-user', {
              body: {
                user_id: data.user.id,
                email: email,
                name: name,
                user_type: userType
              }
            });
            
            if (edgeError) {
              console.warn('⚠️ Webflow integration error (user still created in Supabase):', edgeError);
            } else {
              console.log('✅ Webflow CMS record created');
            }
          } catch (edgeError) {
            console.warn('⚠️ Edge function error:', edgeError);
          }
          
          return { success: true, user: data.user };
        } catch (error) {
          console.error('❌ Registration failed:', error);
          return { success: false, error: error.message };
        }
      },
      
      // Login function
      async login(email, password) {
        console.log('🔐 Logging in user:', { email });
        
        try {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
          });
          
          if (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: error.message };
          }
          
          console.log('✅ Login successful:', data.user?.email);
          return { success: true, user: data.user };
        } catch (error) {
          console.error('❌ Login failed:', error);
          return { success: false, error: error.message };
        }
      },
      
      // Logout function
      async logout() {
        console.log('🚪 Logging out user...');
        
        try {
          const { error } = await supabaseClient.auth.signOut();
          
          if (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
          }
          
          console.log('✅ Logout successful');
          return { success: true };
        } catch (error) {
          console.error('❌ Logout failed:', error);
          return { success: false, error: error.message };
        }
      },
      
      // Get current user
      async getCurrentUser() {
        try {
          const { data: { user }, error } = await supabaseClient.auth.getUser();
          if (error) throw error;
          return user;
        } catch (error) {
          console.error('❌ Get user failed:', error);
          return null;
        }
      },
      
      // Check if user is authenticated
      async isAuthenticated() {
        const user = await this.getCurrentUser();
        return !!user;
      }
    };
    
    console.log('✅ NikoPIM Simple Authentication loaded successfully');
    
    // Setup form handlers if we're on auth pages
    setupFormHandlers();
  }
  
  function setupFormHandlers() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attachFormHandlers);
    } else {
      attachFormHandlers();
    }
  }
  
  function attachFormHandlers() {
    console.log('🔧 Setting up form handlers...');
    
    // Customer Signup Handler
    const customerSignupBtn = document.getElementById('customer-signup-btn');
    if (customerSignupBtn) {
      customerSignupBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('customer-name-input')?.value;
        const email = document.getElementById('customer-email-input')?.value;
        const password = document.getElementById('customer-password-input')?.value;
        const confirmPassword = document.getElementById('customer-confirm-password-input')?.value;
        
        if (!name || !email || !password) {
          showError('Please fill in all required fields');
          return;
        }
        
        if (password !== confirmPassword) {
          showError('Passwords do not match');
          return;
        }
        
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Creating account...';
        this.disabled = true;
        
        try {
          const result = await window.NikoPIM.register(email, password, name, 'Customer');
          
          if (result.success) {
            showSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
              window.location.href = '/dev/app/customer/dashboard';
            }, 1500);
          } else {
            showError(result.error);
          }
        } catch (error) {
          showError('Registration failed: ' + error.message);
        } finally {
          this.textContent = originalText;
          this.disabled = false;
        }
      });
      console.log('✅ Customer signup handler attached');
    }
    
    // Retailer Signup Handler
    const retailerSignupBtn = document.getElementById('retailer-signup-btn');
    if (retailerSignupBtn) {
      retailerSignupBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('retailer-name-input')?.value;
        const email = document.getElementById('retailer-email-input')?.value;
        const password = document.getElementById('retailer-password-input')?.value;
        const confirmPassword = document.getElementById('retailer-confirm-password-input')?.value;
        
        if (!name || !email || !password) {
          showError('Please fill in all required fields');
          return;
        }
        
        if (password !== confirmPassword) {
          showError('Passwords do not match');
          return;
        }
        
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Creating account...';
        this.disabled = true;
        
        try {
          const result = await window.NikoPIM.register(email, password, name, 'Retailer');
          
          if (result.success) {
            showSuccess('Account created successfully! Redirecting...');
            setTimeout(() => {
              window.location.href = '/dev/app/retailer/dashboard';
            }, 1500);
          } else {
            showError(result.error);
          }
        } catch (error) {
          showError('Registration failed: ' + error.message);
        } finally {
          this.textContent = originalText;
          this.disabled = false;
        }
      });
      console.log('✅ Retailer signup handler attached');
    }
    
    // Login Handlers
    const customerLoginBtn = document.getElementById('customer-login-btn');
    if (customerLoginBtn) {
      customerLoginBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('customer-email-input')?.value;
        const password = document.getElementById('customer-password-input')?.value;
        
        if (!email || !password) {
          showError('Please fill in all fields');
          return;
        }
        
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Logging in...';
        this.disabled = true;
        
        try {
          const result = await window.NikoPIM.login(email, password);
          
          if (result.success) {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
              window.location.href = '/dev/app/customer/dashboard';
            }, 1000);
          } else {
            showError(result.error);
          }
        } catch (error) {
          showError('Login failed: ' + error.message);
        } finally {
          this.textContent = originalText;
          this.disabled = false;
        }
      });
      console.log('✅ Customer login handler attached');
    }
    
    const retailerLoginBtn = document.getElementById('retailer-login-btn');
    if (retailerLoginBtn) {
      retailerLoginBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('retailer-email-input')?.value;
        const password = document.getElementById('retailer-password-input')?.value;
        
        if (!email || !password) {
          showError('Please fill in all fields');
          return;
        }
        
        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Logging in...';
        this.disabled = true;
        
        try {
          const result = await window.NikoPIM.login(email, password);
          
          if (result.success) {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
              window.location.href = '/dev/app/retailer/dashboard';
            }, 1000);
          } else {
            showError(result.error);
          }
        } catch (error) {
          showError('Login failed: ' + error.message);
        } finally {
          this.textContent = originalText;
          this.disabled = false;
        }
      });
      console.log('✅ Retailer login handler attached');
    }
  }
  
  function showError(message) {
    console.error('🚨 Error:', message);
    
    // Try to find error display elements
    const errorElement = document.querySelector('.w--tab-active .error-text') || 
                        document.querySelector('.error-text') ||
                        document.querySelector('[data-error]');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.color = '#ff0000';
      const wrapper = errorElement.closest('.form_message-error-wrapper');
      if (wrapper) {
        wrapper.style.display = 'block';
      }
    } else {
      // Fallback to alert
      alert('Error: ' + message);
    }
  }
  
  function showSuccess(message) {
    console.log('✅ Success:', message);
    
    const successElement = document.querySelector('.w--tab-active .success-text') ||
                          document.querySelector('.success-text') ||
                          document.querySelector('[data-success]');
    
    if (successElement) {
      successElement.textContent = message;
      successElement.style.color = '#4CAF50';
      const wrapper = successElement.closest('.form_message-success-wrapper');
      if (wrapper) {
        wrapper.style.display = 'block';
      }
    } else {
      // Also show in console for debugging
      console.log('✅', message);
    }
  }
  
})();