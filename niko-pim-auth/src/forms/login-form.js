document.addEventListener('DOMContentLoaded', function() {
    function waitForNikoPIM() {
      if (window.NikoPIM && window.NikoPIM.login) {
        setupLoginForms();
        setupPasswordToggle();
      } else {
        setTimeout(waitForNikoPIM, 100);
      }
    }
    
    function getRedirectUrl(userType) {
      const basePath = '/dev/app';
      
      return userType === 'Customer' 
        ? `${basePath}/customer/dashboard`
        : `${basePath}/retailer/dashboard`;
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
    
    async function handleCustomerLogin(e) {
      e.preventDefault();
      const email = document.getElementById('customer-email-input').value;
      const password = document.getElementById('customer-password-input').value;
      
      const result = await window.NikoPIM.login(email, password);
      
      if (result.success) {
        window.location.href = getRedirectUrl(result.role);
      } else {
        showError('customer', result.error);
      }
    }
    
    async function handleRetailerLogin(e) {
      e.preventDefault();
      const email = document.getElementById('retailer-email-input').value;
      const password = document.getElementById('retailer-password-input').value;
      
      const result = await window.NikoPIM.login(email, password);
      
      if (result.success) {
        window.location.href = getRedirectUrl(result.role);
      } else {
        showError('retailer', result.error);
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