/*document.addEventListener('DOMContentLoaded', function() {
    function waitForNikoPIM() {
      if (window.NikoPIM && window.NikoPIM.register) {
        setupSignupForms();
        setupPasswordValidation();
        setupPasswordToggle();
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
      
      if (!validatePasswordMatch('customer')) return;
      
      const name = document.getElementById('customer-name-input').value;
      const email = document.getElementById('customer-email-input').value;
      const password = document.getElementById('customer-password-input').value;
      
      const result = await window.NikoPIM.register(email, password, name, 'Customer');
      
      if (result.success) {
        window.location.href = getRedirectUrl('Customer');
      } else {
        showError('customer', result.error);
      }
    }
    
    async function handleRetailerSignup(e) {
      e.preventDefault();
      
      if (!validatePasswordMatch('retailer')) return;
      
      const name = document.getElementById('retailer-name-input').value;
      const email = document.getElementById('retailer-email-input').value;
      const password = document.getElementById('retailer-password-input').value;
      
      const result = await window.NikoPIM.register(email, password, name, 'Retailer');
      
      if (result.success) {
        window.location.href = getRedirectUrl('Retailer');
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
    
    function hideError(userType) {
      const errorElement = document.querySelector('.w--tab-active .error-text');
      if (errorElement) {
        errorElement.parentElement.parentElement.style.display = 'none';
      }
    }
    
    waitForNikoPIM();
  });*/

  import { getSupabase } from '../api/supabase-client.js';
import { webflowClient } from '../api/webflow-client.js';
import { USER_ROLES } from '../config/constants.js';

export async function registerUser(email, password, name, userType) {
  const supabase = getSupabase();
  
  try {
    // Step 1: Validate retailer email if needed
    if (userType === 'Retailer') {
      const isValidRetailer = await webflowClient.validateRetailerEmail(email);
      if (!isValidRetailer) {
        throw new Error('Email not found in authorized retailers list');
      }
    }

    // Step 2: Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          user_type: userType
        }
      }
    });

    if (authError) throw authError;

    // Step 3: Create corresponding Webflow CMS entry
    const userData = {
      name,
      email,
      supabaseId: authData.user.id
    };

    if (userType === 'Customer') {
      await webflowClient.createCustomer(userData);
    } else {
      await webflowClient.createRetailer(userData);
    }

    console.log('User created in both Supabase and Webflow CMS');
    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Registration failed:', error);
    return { success: false, error: error.message };
  }
}