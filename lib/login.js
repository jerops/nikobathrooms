// Niko PIM Login Form Handler
// Handles login form interactions and authentication
// Version: 2.0.0

(function(window) {
  'use strict';
  
  class LoginHandler {
    constructor() {
      this.isInitialized = false;
      this.init();
    }
    
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }
    
    setup() {
      // Wait for NikoPIM core to be available
      this.waitForCore(() => {
        this.attachHandlers();
        this.isInitialized = true;
        console.log('✅ Login handlers initialized');
      });
    }
    
    waitForCore(callback) {
      if (window.NikoPIM && window.NikoPIM.isInitialized) {
        callback();
      } else {
        setTimeout(() => this.waitForCore(callback), 100);
      }
    }
    
    attachHandlers() {
      // Customer Login Handler
      const customerLoginBtn = document.getElementById('customer-login-btn');
      if (customerLoginBtn) {
        customerLoginBtn.addEventListener('click', (e) => this.handleCustomerLogin(e));
        console.log('✅ Customer login handler attached');
      }
      
      // Retailer Login Handler
      const retailerLoginBtn = document.getElementById('retailer-login-btn');
      if (retailerLoginBtn) {
        retailerLoginBtn.addEventListener('click', (e) => this.handleRetailerLogin(e));
        console.log('✅ Retailer login handler attached');
      }
    }
    
    async handleCustomerLogin(e) {
      e.preventDefault();
      
      const email = document.getElementById('customer-email-input')?.value;
      const password = document.getElementById('customer-password-input')?.value;
      
      if (!email || !password) {
        this.showError('Please fill in all fields');
        return;
      }
      
      const button = e.target;
      this.setLoadingState(button, true, 'Logging in...');
      
      try {
        const result = await window.NikoPIM.login(email, password);
        
        if (result.success) {
          this.showSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            window.location.href = window.NikoPIM.getRedirectUrl('Customer');
          }, 1000);
        } else {
          this.showError(result.error);
        }
      } catch (error) {
        this.showError('Login failed: ' + error.message);
      } finally {
        this.setLoadingState(button, false, 'Log in');
      }
    }
    
    async handleRetailerLogin(e) {
      e.preventDefault();
      
      const email = document.getElementById('retailer-email-input')?.value;
      const password = document.getElementById('retailer-password-input')?.value;
      
      if (!email || !password) {
        this.showError('Please fill in all fields');
        return;
      }
      
      const button = e.target;
      this.setLoadingState(button, true, 'Logging in...');
      
      try {
        const result = await window.NikoPIM.login(email, password);
        
        if (result.success) {
          this.showSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            window.location.href = window.NikoPIM.getRedirectUrl('Retailer');
          }, 1000);
        } else {
          this.showError(result.error);
        }
      } catch (error) {
        this.showError('Login failed: ' + error.message);
      } finally {
        this.setLoadingState(button, false, 'Log in');
      }
    }
    
    setLoadingState(button, isLoading, text) {
      if (isLoading) {
        button.setAttribute('data-original-text', button.textContent);
        button.textContent = text;
        button.disabled = true;
      } else {
        button.textContent = button.getAttribute('data-original-text') || text;
        button.disabled = false;
      }
    }
    
    showError(message) {
      console.error('🚨 Login Error:', message);
      
      const errorElement = document.querySelector('.w--tab-active .error-text') || 
                          document.querySelector('.error-text');
      
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#ff0000';
        const wrapper = errorElement.closest('.form_message-error-wrapper');
        if (wrapper) {
          wrapper.style.display = 'block';
        }
      } else {
        alert('Error: ' + message);
      }
    }
    
    showSuccess(message) {
      console.log('✅ Login Success:', message);
      
      const successElement = document.querySelector('.w--tab-active .success-text') ||
                            document.querySelector('.success-text');
      
      if (successElement) {
        successElement.textContent = message;
        successElement.style.color = '#4CAF50';
        const wrapper = successElement.closest('.form_message-success-wrapper');
        if (wrapper) {
          wrapper.style.display = 'block';
        }
      }
    }
  }
  
  // Initialize login handler
  new LoginHandler();
  
})(window);