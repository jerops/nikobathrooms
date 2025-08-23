// Webflow Form Integration for Niko PIM Authentication
// This script connects Webflow forms to the Niko PIM authentication system

class WebflowAuthIntegration {
  constructor() {
    this.isReady = false;
    this.currentForm = null;
    this.init();
  }

  async init() {
    // Wait for both DOM and NikoPIM to be ready
    await this.waitForDependencies();
    
    // Setup form handlers based on current page
    this.setupPageHandlers();
    
    console.log('✅ Webflow Auth Integration ready');
  }

  async waitForDependencies() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Wait for NikoPIM to be available
    let attempts = 0;
    while (!window.NikoPIM || !window.NikoPIM.isAuthenticated) {
      if (attempts > 100) { // 10 seconds timeout
        throw new Error('NikoPIM authentication system not available');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    this.isReady = true;
  }

  setupPageHandlers() {
    const path = window.location.pathname;
    
    if (path.includes('/dev/app/auth/log-in')) {
      this.setupLoginPage();
    } else if (path.includes('/dev/app/auth/sign-up')) {
      this.setupSignupPage();
    }
  }

  setupLoginPage() {
    console.log('Setting up login page handlers');
    
    // Find all forms on the login page
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form, index) => {
      // Skip if already handled
      if (form.dataset.nikoHandled) return;
      
      form.dataset.nikoHandled = 'true';
      
      // Prevent default Webflow form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin(form, index);
      });
    });

    // Also handle any existing Webflow form submit buttons
    const submitButtons = document.querySelectorAll('[type="submit"]');
    submitButtons.forEach((button, index) => {
      if (button.dataset.nikoHandled) return;
      
      button.dataset.nikoHandled = 'true';
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const form = button.closest('form');
        if (form) {
          await this.handleLogin(form, index);
        }
      });
    });
  }

  setupSignupPage() {
    console.log('Setting up signup page handlers');
    
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form, index) => {
      if (form.dataset.nikoHandled) return;
      
      form.dataset.nikoHandled = 'true';
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignup(form, index);
      });
    });

    const submitButtons = document.querySelectorAll('[type="submit"]');
    submitButtons.forEach((button, index) => {
      if (button.dataset.nikoHandled) return;
      
      button.dataset.nikoHandled = 'true';
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const form = button.closest('form');
        if (form) {
          await this.handleSignup(form, index);
        }
      });
    });
  }

  async handleLogin(form, index = 0) {
    try {
      console.log(`Handling login for form ${index}`);
      
      // Get form data
      const email = this.getFormFieldValue(form, ['email', 'Email']);
      const password = this.getFormFieldValue(form, ['password', 'Password']);
      
      if (!email || !password) {
        throw new Error('Please fill in all required fields');
      }

      // Show loading state
      this.setFormLoading(form, true);
      this.hideMessages(form);

      // Attempt login
      const result = await window.NikoPIM.login(email, password);

      if (result.success) {
        this.showSuccess(form, 'Login successful! Redirecting...');
        
        // Small delay to show success message
        setTimeout(() => {
          // The authentication system will handle the redirect automatically
          // But we can also trigger it manually if needed
          this.redirectAfterLogin(result.role || window.NikoPIM.getUserRole());
        }, 1000);
        
      } else {
        throw new Error(result.error || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      this.showError(form, error.message);
    } finally {
      this.setFormLoading(form, false);
    }
  }

  async handleSignup(form, index = 0) {
    try {
      console.log(`Handling signup for form ${index}`);
      
      // Get form data
      const name = this.getFormFieldValue(form, ['name', 'Name']);
      const email = this.getFormFieldValue(form, ['email', 'Email']);
      const password = this.getFormFieldValue(form, ['password', 'Password']);
      const confirmPassword = this.getFormFieldValue(form, ['confirm-password', 'Confirm Password', 'confirmPassword']);
      
      if (!name || !email || !password) {
        throw new Error('Please fill in all required fields');
      }

      if (confirmPassword && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Determine user type based on current tab or form context
      const userType = this.determineUserType();

      // Show loading state
      this.setFormLoading(form, true);
      this.hideMessages(form);

      // Attempt registration
      const result = await window.NikoPIM.register(email, password, name, userType);

      if (result.success) {
        this.showSuccess(form, 'Registration successful! Please check your email to verify your account.');
        
        // Clear form
        form.reset();
        
        // Redirect to login after successful registration
        setTimeout(() => {
          window.location.href = '/dev/app/auth/log-in';
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      this.showError(form, error.message);
    } finally {
      this.setFormLoading(form, false);
    }
  }

  determineUserType() {
    // Check for active tab indicators
    const activeCustomerTab = document.querySelector('.w--current');
    const retailerElements = document.querySelectorAll('[data-w-tab="Retailer"], .retailer-tab, #retailer');
    const customerElements = document.querySelectorAll('[data-w-tab="Customer"], .customer-tab, #customer');
    
    // Look for any indication that retailer tab is active
    const isRetailerActive = Array.from(retailerElements).some(el => 
      el.classList.contains('w--current') || 
      el.classList.contains('active') ||
      el.style.display !== 'none'
    );

    return isRetailerActive ? 'Retailer' : 'Customer';
  }

  redirectAfterLogin(userRole) {
    const routes = {
      'Retailer': '/dev/app/retailer/dashboard',
      'Customer': '/dev/app/customer/dashboard'
    };
    
    const targetRoute = routes[userRole] || routes['Customer'];
    console.log(`Redirecting ${userRole} to ${targetRoute}`);
    window.location.href = targetRoute;
  }

  getFormFieldValue(form, fieldNames) {
    for (const fieldName of fieldNames) {
      // Try different selectors
      const selectors = [
        `input[name="${fieldName}"]`,
        `input[name="${fieldName.toLowerCase()}"]`,
        `input[placeholder*="${fieldName}"]`,
        `input[id*="${fieldName.toLowerCase()}"]`,
        `[data-name="${fieldName}"]`
      ];
      
      for (const selector of selectors) {
        const field = form.querySelector(selector);
        if (field && field.value) {
          return field.value.trim();
        }
      }
      
      // Also try finding by label text
      const labels = form.querySelectorAll('label, .form_field-label');
      for (const label of labels) {
        if (label.textContent.includes(fieldName)) {
          const input = label.nextElementSibling || 
                        form.querySelector(`input[id="${label.getAttribute('for')}"]`) ||
                        label.parentElement.querySelector('input');
          if (input && input.value) {
            return input.value.trim();
          }
        }
      }
    }
    
    // Fallback: find inputs by position for forms with consistent structure
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    if (fieldNames.includes('email') || fieldNames.includes('Email')) {
      for (const input of inputs) {
        if (input.type === 'email' || input.placeholder.toLowerCase().includes('email')) {
          return input.value.trim();
        }
      }
    }
    if (fieldNames.includes('password') || fieldNames.includes('Password')) {
      for (const input of inputs) {
        if (input.type === 'password') {
          return input.value.trim();
        }
      }
    }
    
    return '';
  }

  setFormLoading(form, isLoading) {
    const submitButton = form.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.disabled = isLoading;
      if (isLoading) {
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.textContent = submitButton.getAttribute('data-wait') || 'Please wait...';
      } else if (submitButton.dataset.originalText) {
        submitButton.textContent = submitButton.dataset.originalText;
      }
    }
  }

  hideMessages(form) {
    const messages = form.querySelectorAll('.success-text, .error-text, .w-form-done, .w-form-fail');
    messages.forEach(msg => {
      msg.style.display = 'none';
    });
  }

  showSuccess(form, message) {
    this.hideMessages(form);
    
    let successElement = form.querySelector('.success-text, .w-form-done');
    if (!successElement) {
      successElement = this.createMessageElement('success', message);
      form.appendChild(successElement);
    } else {
      successElement.textContent = message;
      successElement.style.display = 'block';
    }
  }

  showError(form, message) {
    this.hideMessages(form);
    
    let errorElement = form.querySelector('.error-text, .w-form-fail');
    if (!errorElement) {
      errorElement = this.createMessageElement('error', message);
      form.appendChild(errorElement);
    } else {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  createMessageElement(type, message) {
    const element = document.createElement('div');
    element.className = type === 'success' ? 'success-text w-form-done' : 'error-text w-form-fail';
    element.textContent = message;
    element.style.display = 'block';
    element.style.marginTop = '10px';
    return element;
  }
}

// Initialize when page loads
if (typeof window !== 'undefined') {
  // Only initialize on auth pages
  if (window.location.pathname.includes('/dev/app/auth/')) {
    new WebflowAuthIntegration();
  }
}