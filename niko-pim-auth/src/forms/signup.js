// Browser-compatible signup form handlers
// This file provides the signup functionality that works directly in browsers
// STACK OVERFLOW FIX: Prevent infinite recursion and multiple event handlers

(function() {
  'use strict';
  
  // Prevent multiple initialization
  if (window.NikoSignupHandlersLoaded) {
    console.log('⚠️ Signup handlers already loaded, skipping...');
    return;
  }
  window.NikoSignupHandlersLoaded = true;

  console.log('🔧 Loading signup handlers...');

  let initializationAttempts = 0;
  const MAX_INIT_ATTEMPTS = 50; // 5 seconds max wait

  document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, starting signup handler setup...');
    waitForNikoPIM();
  });

  function waitForNikoPIM() {
    initializationAttempts++;
    
    if (initializationAttempts > MAX_INIT_ATTEMPTS) {
      console.error('❌ Failed to load NikoPIM after 50 attempts');
      return;
    }
    
    if (window.NikoPIM && window.NikoPIM.register) {
      console.log('✅ NikoPIM found, setting up forms...');
      setupSignupForms();
      setupPasswordValidation();
      setupPasswordToggle();
      console.log('✅ Signup handlers ready');
    } else {
      console.log(`⏳ Waiting for NikoPIM... (attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS})`);
      setTimeout(waitForNikoPIM, 100);
    }
  }

  function getRedirectUrl(userType) {
    const currentDomain = window.location.origin;
    const basePath = '/dev/app';
    
    return userType === 'Customer' 
      ? `${currentDomain}${basePath}/customer/dashboard`
      : `${currentDomain}${basePath}/retailer/dashboard`;
  }

  function setupSignupForms() {
    console.log('🔧 Setting up signup form handlers...');
    
    // Remove any existing handlers first to prevent duplicates
    const customerSignupBtn = document.getElementById('customer-signup-btn');
    if (customerSignupBtn) {
      // Clone node to remove all event listeners
      const newCustomerBtn = customerSignupBtn.cloneNode(true);
      customerSignupBtn.parentNode.replaceChild(newCustomerBtn, customerSignupBtn);
      newCustomerBtn.addEventListener('click', handleCustomerSignup);
      console.log('✅ Customer signup handler attached');
    }
    
    const retailerSignupBtn = document.getElementById('retailer-signup-btn');
    if (retailerSignupBtn) {
      // Clone node to remove all event listeners
      const newRetailerBtn = retailerSignupBtn.cloneNode(true);
      retailerSignupBtn.parentNode.replaceChild(newRetailerBtn, retailerSignupBtn);
      newRetailerBtn.addEventListener('click', handleRetailerSignup);
      console.log('✅ Retailer signup handler attached');
    }
  }

  function setupPasswordValidation() {
    const customerConfirm = document.getElementById('customer-confirm-password-input');
    if (customerConfirm) {
      customerConfirm.addEventListener('input', () => validatePasswordMatch('customer'));
    }
    
    const retailerConfirm = document.getElementById('retailer-confirm-password-input');
    if (retailerConfirm) {
      retailerConfirm.addEventListener('input', () => validatePasswordMatch('retailer'));
    }
  }

  function setupPasswordToggle() {
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

  function validatePasswordMatch(userType) {
    try {
      const passwordInput = document.getElementById(`${userType}-password-input`);
      const confirmInput = document.getElementById(`${userType}-confirm-password-input`);
      
      if (!passwordInput || !confirmInput) {
        console.warn(`Password inputs not found for ${userType}`);
        return false;
      }
      
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;
      
      if (password && confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#ff0000';
        showError(userType, 'Passwords do not match');
        return false;
      } else {
        confirmInput.style.borderColor = '';
        hideError(userType);
        return true;
      }
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  async function handleCustomerSignup(e) {
    e.preventDefault();
    console.log('🔄 Handling customer signup...');
    
    try {
      if (!validatePasswordMatch('customer')) return;
      
      const name = document.getElementById('customer-name-input')?.value;
      const email = document.getElementById('customer-email-input')?.value;
      const password = document.getElementById('customer-password-input')?.value;
      
      if (!name || !email || !password) {
        showError('customer', 'Please fill in all fields');
        return;
      }
      
      // Show loading state
      const submitBtn = e.target;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;
      
      console.log('📤 Registering customer:', email);
      const result = await window.NikoPIM.register(email, password, name, 'Customer');
      
      if (result && result.success) {
        console.log('✅ Customer registration successful');
        showSuccess('customer', 'Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = getRedirectUrl('Customer');
        }, 1500);
      } else {
        throw new Error(result?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Customer signup error:', error);
      showError('customer', error.message || 'Registration failed');
      
      // Reset button state
      const submitBtn = e.target;
      submitBtn.textContent = 'Sign up';
      submitBtn.disabled = false;
    }
  }

  async function handleRetailerSignup(e) {
    e.preventDefault();
    console.log('🔄 Handling retailer signup...');
    
    try {
      if (!validatePasswordMatch('retailer')) return;
      
      const name = document.getElementById('retailer-name-input')?.value;
      const email = document.getElementById('retailer-email-input')?.value;
      const password = document.getElementById('retailer-password-input')?.value;
      
      if (!name || !email || !password) {
        showError('retailer', 'Please fill in all fields');
        return;
      }
      
      // Show loading state
      const submitBtn = e.target;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;
      
      console.log('📤 Registering retailer:', email);
      const result = await window.NikoPIM.register(email, password, name, 'Retailer');
      
      if (result && result.success) {
        console.log('✅ Retailer registration successful');
        showSuccess('retailer', 'Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = getRedirectUrl('Retailer');
        }, 1500);
      } else {
        throw new Error(result?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Retailer signup error:', error);
      showError('retailer', error.message || 'Registration failed');
      
      // Reset button state
      const submitBtn = e.target;
      submitBtn.textContent = 'Sign up';
      submitBtn.disabled = false;
    }
  }

  function showError(userType, message) {
    try {
      const errorElement = document.querySelector('.w--tab-active .error-text');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#ff0000';
        errorElement.parentElement.parentElement.style.display = 'block';
      } else {
        console.error(`${userType} signup error:`, message);
        alert(`Error: ${message}`); // Fallback for debugging
      }
    } catch (error) {
      console.error('Error showing error message:', error);
    }
  }

  function showSuccess(userType, message) {
    try {
      const errorElement = document.querySelector('.w--tab-active .error-text');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#4CAF50';
        errorElement.parentElement.parentElement.style.display = 'block';
      } else {
        console.log(`${userType} signup success:`, message);
      }
    } catch (error) {
      console.error('Error showing success message:', error);
    }
  }

  function hideError(userType) {
    try {
      const errorElement = document.querySelector('.w--tab-active .error-text');
      if (errorElement) {
        errorElement.parentElement.parentElement.style.display = 'none';
      }
    } catch (error) {
      console.error('Error hiding error message:', error);
    }
  }

  console.log('📋 Signup handlers module loaded');
})();