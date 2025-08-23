document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.login) {
      setupLoginForms();
      setupPasswordToggle();
      console.log('✅ Login handlers ready');
    } else {
      setTimeout(waitForNikoPIM, 100);
    }
  }
  
  // ENHANCED DOMAIN-AWARE REDIRECTS - Restored from working implementation
  function getRedirectUrl(userType) {
    const hostname = window.location.hostname;
    let baseUrl;
    
    // Handle different deployment domains
    if (hostname === 'nikobathrooms.ie') {
      // Production domain
      baseUrl = 'https://nikobathrooms.ie';
    } else if (hostname === 'nikobathrooms.webflow.io') {
      // Staging/Webflow domain
      baseUrl = 'https://nikobathrooms.webflow.io';
    } else {
      // Fallback for preview/other domains
      baseUrl = window.location.origin;
    }
    
    const basePath = '/dev/app';
    
    return userType === 'Customer' 
      ? `${baseUrl}${basePath}/customer/dashboard`
      : `${baseUrl}${basePath}/retailer/dashboard`;
  }
  
  function setupLoginForms() {
    const customerLoginBtn = document.getElementById('customer-login-btn');
    if (customerLoginBtn) {
      customerLoginBtn.addEventListener('click', handleCustomerLogin);
      console.log('🔗 Customer login handler attached');
    }
    
    const retailerLoginBtn = document.getElementById('retailer-login-btn');
    if (retailerLoginBtn) {
      retailerLoginBtn.addEventListener('click', handleRetailerLogin);
      console.log('🔗 Retailer login handler attached');
    }
  }
  
  function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.input-visibility-toggle');
    
    toggleButtons.forEach(button => {
      const showIcon = button.querySelector('[wized=\"icon_show_password\"]');
      const hideIcon = button.querySelector('[wized=\"icon_hide_password\"]');
      const passwordInput = button.closest('.form_field-wrapper').querySelector('input[type=\"password\"], input[type=\"text\"]');
      
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
  
  async function handleCustomerLogin(e) {
    e.preventDefault();
    console.log('🔄 Customer login initiated');
    
    const email = document.getElementById('customer-email-input').value;
    const password = document.getElementById('customer-password-input').value;
    
    // Show loading state
    const submitBtn = e.target;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    
    try {
      const result = await window.NikoPIM.login(email, password);
      
      if (result.success) {
        console.log('✅ Customer login successful');
        // Use domain-aware redirect
        const redirectUrl = getRedirectUrl(result.role || 'Customer');
        console.log('🚀 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Customer login error:', error);
      showError('customer', error.message || 'Login failed');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
  
  async function handleRetailerLogin(e) {
    e.preventDefault();
    console.log('🔄 Retailer login initiated');
    
    const email = document.getElementById('retailer-email-input').value;
    const password = document.getElementById('retailer-password-input').value;
    
    // Show loading state
    const submitBtn = e.target;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;
    
    try {
      const result = await window.NikoPIM.login(email, password);
      
      if (result.success) {
        console.log('✅ Retailer login successful');
        // Use domain-aware redirect
        const redirectUrl = getRedirectUrl(result.role || 'Retailer');
        console.log('🚀 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Retailer login error:', error);
      showError('retailer', error.message || 'Login failed');
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
      console.error(`${userType} login error:`, message);
    }
  }
  
  waitForNikoPIM();
});