// LOGIN HANDLER - RESTORED FROM EXACT WORKING REFERENCE POINT
// Based on the working pattern from Site Authentication Project Setup

document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.login) {
      setupLoginForms();
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
  
  function setupLoginForms() {
    const customerLoginBtn = document.getElementById('customer-login-btn');
    if (customerLoginBtn) {
      customerLoginBtn.addEventListener('click', handleCustomerLogin);
    }
    
    const retailerLoginBtn = document.getElementById('retailer-login-btn');
    if (retailerLoginBtn) {
      retailerLoginBtn.addEventListener('click', handleRetailerLogin);
    }
  }
  
  async function handleCustomerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('customer-email-input').value;
    const password = document.getElementById('customer-password-input').value;
    
    try {
      const result = await window.NikoPIM.login(email, password);
      
      if (result.success) {
        // Use working redirect pattern
        const redirectUrl = getRedirectUrl(result.role || 'Customer');
        window.location.href = redirectUrl;
      } else {
        showError('customer', result.error || 'Login failed');
      }
    } catch (error) {
      showError('customer', error.message || 'Login failed');
    }
  }
  
  async function handleRetailerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('retailer-email-input').value;
    const password = document.getElementById('retailer-password-input').value;
    
    try {
      const result = await window.NikoPIM.login(email, password);
      
      if (result.success) {
        // Use working redirect pattern
        const redirectUrl = getRedirectUrl(result.role || 'Retailer');
        window.location.href = redirectUrl;
      } else {
        showError('retailer', result.error || 'Login failed');
      }
    } catch (error) {
      showError('retailer', error.message || 'Login failed');
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