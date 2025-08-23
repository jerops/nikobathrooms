// Niko PIM Signup Form Handler
// Handles registration form interactions and validation
// Version: 2.0.0

(function(window) {
  'use strict';
  
  class SignupHandler {
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
        this.setupPasswordValidation();
        this.isInitialized = true;
        console.log('✅ Signup handlers initialized');
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
      // Customer Signup Handler
      const customerSignupBtn = document.getElementById('customer-signup-btn');
      if (customerSignupBtn) {
        customerSignupBtn.addEventListener('click', (e) => this.handleCustomerSignup(e));
        console.log('✅ Customer signup handler attached');
      }
      
      // Retailer Signup Handler
      const retailerSignupBtn = document.getElementById('retailer-signup-btn');
      if (retailerSignupBtn) {
        retailerSignupBtn.addEventListener('click', (e) => this.handleRetailerSignup(e));
        console.log('✅ Retailer signup handler attached');
      }
    }
    
    setupPasswordValidation() {
      // Customer password confirmation
      const customerConfirm = document.getElementById('customer-confirm-password-input');
      if (customerConfirm) {
        customerConfirm.addEventListener('input', () => this.validatePasswordMatch('customer'));
      }
      
      // Retailer password confirmation
      const retailerConfirm = document.getElementById('retailer-confirm-password-input');
      if (retailerConfirm) {
        retailerConfirm.addEventListener('input', () => this.validatePasswordMatch('retailer'));
      }
    }
    
    validatePasswordMatch(userType) {
      const password = document.getElementById(`${userType}-password-input`)?.value;
      const confirmPassword = document.getElementById(`${userType}-confirm-password-input`)?.value;
      const confirmInput = document.getElementById(`${userType}-confirm-password-input`);
      
      if (!password || !confirmPassword || !confirmInput) return false;
      
      if (password !== confirmPassword) {
        confirmInput.style.borderColor = '#ff0000';
        this.showError('Passwords do not match');
        return false;
      } else {
        confirmInput.style.borderColor = '';
        this.hideError();
        return true;
      }
    }
    
    async handleCustomerSignup(e) {
      e.preventDefault();
      
      const name = document.getElementById('customer-name-input')?.value;
      const email = document.getElementById('customer-email-input')?.value;
      const password = document.getElementById('customer-password-input')?.value;
      const confirmPassword = document.getElementById('customer-confirm-password-input')?.value;
      
      if (!this.validateSignupForm(name, email, password, confirmPassword)) {
        return;
      }
      
      const button = e.target;
      this.setLoadingState(button, true, 'Creating account...');
      
      try {
        const result = await window.NikoPIM.register(email, password, name, 'Customer');
        
        if (result.success) {
          this.showSuccess('Account created successfully! Redirecting...');
          setTimeout(() => {
            window.location.href = window.NikoPIM.getRedirectUrl('Customer');
          }, 1500);
        } else {
          this.showError(result.error);
        }
      } catch (error) {
        this.showError('Registration failed: ' + error.message);
      } finally {
        this.setLoadingState(button, false, 'Sign up');
      }
    }
    
    async handleRetailerSignup(e) {
      e.preventDefault();
      
      const name = document.getElementById('retailer-name-input')?.value;
      const email = document.getElementById('retailer-email-input')?.value;
      const password = document.getElementById('retailer-password-input')?.value;
      const confirmPassword = document.getElementById('retailer-confirm-password-input')?.value;
      
      if (!this.validateSignupForm(name, email, password, confirmPassword)) {
        return;
      }
      
      const button = e.target;
      this.setLoadingState(button, true, 'Creating account...');
      
      try {
        const result = await window.NikoPIM.register(email, password, name, 'Retailer');
        
        if (result.success) {
          this.showSuccess('Account created successfully! Redirecting...');
          setTimeout(() => {
            window.location.href = window.NikoPIM.getRedirectUrl('Retailer');
          }, 1500);
        } else {
          this.showError(result.error);
        }
      } catch (error) {
        this.showError('Registration failed: ' + error.message);
      } finally {
        this.setLoadingState(button, false, 'Sign up');
      }
    }
    
    validateSignupForm(name, email, password, confirmPassword) {
      if (!name || !email || !password) {
        this.showError('Please fill in all required fields');
        return false;
      }
      
      if (password !== confirmPassword) {
        this.showError('Passwords do not match');
        return false;
      }
      
      if (password.length < 6) {
        this.showError('Password must be at least 6 characters long');
        return false;
      }
      
      return true;
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
      console.error('🚨 Signup Error:', message);
      
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
      console.log('✅ Signup Success:', message);
      
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
    
    hideError() {
      const errorWrapper = document.querySelector('.form_message-error-wrapper');
      if (errorWrapper) {
        errorWrapper.style.display = 'none';
      }
    }
  }
  
  // Initialize signup handler
  new SignupHandler();
  
})(window);