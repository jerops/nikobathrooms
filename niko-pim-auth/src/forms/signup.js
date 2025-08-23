// Browser-compatible signup form handlers - RESTORED TO WORKING VERSION
// This restores the working functionality from before GitHub MCP changes

document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.register) {
      setupSignupForms();
      setupPasswordValidation();
      setupPasswordToggle();
      console.log('✅ Signup handlers ready');
    } else {
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
    const customerSignupBtn = document.getElementById('customer-signup-btn');
    if (customerSignupBtn) {
      customerSignupBtn.addEventListener('click', handleCustomerSignup);
    }
    
    const retailerSignupBtn = document.getElementById('retailer-signup-btn');
    if (retailerSignupBtn) {
      retailerSignupBtn.addEventListener('click', handleRetailerSignup);
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
    const password = document.getElementById(`${userType}-password-input`).value;
    const confirmPassword = document.getElementById(`${userType}-confirm-password-input`).value;
    const confirmInput = document.getElementById(`${userType}-confirm-password-input`);
    
    if (password && confirmPassword && password !== confirmPassword) {
      confirmInput.style.borderColor = '#ff0000';
      showError(userType, 'Passwords do not match');
      return false;
    } else {
      confirmInput.style.borderColor = '';
      hideError(userType);
      return true;
    }
  }
  
  async function handleCustomerSignup(e) {
    e.preventDefault();
    console.log('🔄 Customer signup initiated');
    
    if (!validatePasswordMatch('customer')) return;
    
    const name = document.getElementById('customer-name-input').value;
    const email = document.getElementById('customer-email-input').value;
    const password = document.getElementById('customer-password-input').value;
    
    // Show loading state
    const submitBtn = e.target;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
      console.log('📤 Calling NikoPIM.register for customer:', email);
      const result = await window.NikoPIM.register(email, password, name, 'Customer');
      
      if (result.success) {
        console.log('✅ Customer registration successful');
        showSuccess('customer', 'Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = getRedirectUrl('Customer');
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Customer signup error:', error);
      showError('customer', error.message || 'Registration failed');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
  
  async function handleRetailerSignup(e) {
    e.preventDefault();
    console.log('🔄 Retailer signup initiated');
    
    if (!validatePasswordMatch('retailer')) return;
    
    const name = document.getElementById('retailer-name-input').value;
    const email = document.getElementById('retailer-email-input').value;
    const password = document.getElementById('retailer-password-input').value;
    
    // Show loading state
    const submitBtn = e.target;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
      console.log('📤 Calling NikoPIM.register for retailer:', email);
      const result = await window.NikoPIM.register(email, password, name, 'Retailer');
      
      if (result.success) {
        console.log('✅ Retailer registration successful');
        showSuccess('retailer', 'Account created successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = getRedirectUrl('Retailer');
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Retailer signup error:', error);
      showError('retailer', error.message || 'Registration failed');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
  
  function showError(userType, message) {
    const errorElement = document.querySelector('.w--tab-active .error-text');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.parentElement.parentElement.style.display = 'block';
    } else {
      console.error(`${userType} signup error:`, message);
    }
  }
  
  function showSuccess(userType, message) {
    const errorElement = document.querySelector('.w--tab-active .error-text');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.color = '#4CAF50';
      errorElement.parentElement.parentElement.style.display = 'block';
    } else {
      console.log(`${userType} signup success:`, message);
    }
  }
  
  function hideError(userType) {
    const errorElement = document.querySelector('.w--tab-active .error-text');
    if (errorElement) {
      errorElement.parentElement.parentElement.style.display = 'none';
    }
  }
  
  waitForNikoPIM();
});