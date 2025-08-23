// SIGNUP HANDLER - RESTORED FROM EXACT WORKING REFERENCE POINT
// Based on the working pattern from Site Authentication Project Setup

document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.register) {
      setupSignupForms();
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
  
  async function handleCustomerSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('customer-name-input').value;
    const email = document.getElementById('customer-email-input').value;
    const password = document.getElementById('customer-password-input').value;
    
    try {
      const result = await window.NikoPIM.register(email, password, name, 'Customer');
      
      if (result.success) {
        // Use working redirect pattern
        const redirectUrl = getRedirectUrl('Customer');
        window.location.href = redirectUrl;
      } else {
        showError('customer', result.error || 'Registration failed');
      }
    } catch (error) {
      showError('customer', error.message || 'Registration failed');
    }
  }
  
  async function handleRetailerSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('retailer-name-input').value;
    const email = document.getElementById('retailer-email-input').value;
    const password = document.getElementById('retailer-password-input').value;
    
    try {
      const result = await window.NikoPIM.register(email, password, name, 'Retailer');
      
      if (result.success) {
        // Use working redirect pattern
        const redirectUrl = getRedirectUrl('Retailer');
        window.location.href = redirectUrl;
      } else {
        showError('retailer', result.error || 'Registration failed');
      }
    } catch (error) {
      showError('retailer', error.message || 'Registration failed');
    }
  }
  
  function showError(userType, message) {
    const errorElement = document.querySelector('.w--tab-active .error-text');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.parentElement.parentElement.style.display = 'block';
    }
  }
  
  waitForNikoPIM();
});