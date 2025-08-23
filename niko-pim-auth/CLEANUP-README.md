# Niko PIM Authentication - Simplified Approach

## 🎯 Current Status: REPO IS MOSTLY CORRECT

### ✅ What's Working:
- `src/index.js` - Core authentication system 
- `dist/niko-pim.min.js` - Built CDN file (149KB)
- Supabase integration with proper environment variables
- User registration, login, logout functions available globally as `window.NikoPIM.*`

### 🗂️ File Structure (Keep):
```
niko-pim-auth/
├── src/
│   ├── index.js              ✅ Main authentication system
│   ├── api/
│   │   └── supabase-client.js ✅ Supabase configuration  
│   ├── auth/
│   │   ├── login.js          ✅ Login functions
│   │   ├── logout.js         ✅ Logout functions
│   │   └── registration.js   ✅ Registration functions
│   └── config/
│       └── constants.js      ✅ Configuration constants
├── dist/
│   └── niko-pim.min.js      ✅ CDN-ready file (THIS IS WHAT WEBFLOW USES)
└── package.json             ✅ Build configuration
```

### ❌ What to Remove/Ignore:
```
src/forms/                   ❌ Remove - causes confusion
├── login.js                 ❌ Not integrated with main build
├── signup.js                ❌ Separate from core system
└── logout-handler.js        ❌ Redundant
```

## 🔧 Webflow Integration (Simple Approach):

### 1. Webflow Project Settings → Custom Code → Header:
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-pim.min.js"></script>
```

### 2. Signup Page → Page Settings → Before </body>:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.register) {
      setupSignupHandlers();
    } else {
      setTimeout(waitForNikoPIM, 100);
    }
  }
  
  function setupSignupHandlers() {
    const customerBtn = document.getElementById('customer-signup-btn');
    const retailerBtn = document.getElementById('retailer-signup-btn');
    
    if (customerBtn) {
      customerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = document.getElementById('customer-name-input').value;
        const email = document.getElementById('customer-email-input').value;
        const password = document.getElementById('customer-password-input').value;
        
        try {
          const result = await window.NikoPIM.register(email, password, name, 'Customer');
          if (result.success) window.location.href = '/dev/app/customer/dashboard';
        } catch (error) {
          alert('Signup failed: ' + error.message);
        }
      });
    }
    
    if (retailerBtn) {
      retailerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = document.getElementById('retailer-name-input').value;
        const email = document.getElementById('retailer-email-input').value;
        const password = document.getElementById('retailer-password-input').value;
        
        try {
          const result = await window.NikoPIM.register(email, password, name, 'Retailer');
          if (result.success) window.location.href = '/dev/app/retailer/dashboard';
        } catch (error) {
          alert('Signup failed: ' + error.message);
        }
      });
    }
  }
  
  waitForNikoPIM();
});
</script>
```

### 3. Login Page → Page Settings → Before </body>:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.login) {
      setupLoginHandlers();
    } else {
      setTimeout(waitForNikoPIM, 100);
    }
  }
  
  function setupLoginHandlers() {
    const customerBtn = document.getElementById('customer-login-btn');
    const retailerBtn = document.getElementById('retailer-login-btn');
    
    if (customerBtn) {
      customerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('customer-email-input').value;
        const password = document.getElementById('customer-password-input').value;
        
        try {
          const result = await window.NikoPIM.login(email, password);
          if (result.success) {
            const role = window.NikoPIM.getUserRole();
            const redirectUrl = role === 'Retailer' ? 
              '/dev/app/retailer/dashboard' : '/dev/app/customer/dashboard';
            window.location.href = redirectUrl;
          }
        } catch (error) {
          alert('Login failed: ' + error.message);
        }
      });
    }
    
    if (retailerBtn) {
      retailerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('retailer-email-input').value;
        const password = document.getElementById('retailer-password-input').value;
        
        try {
          const result = await window.NikoPIM.login(email, password);
          if (result.success) {
            const role = window.NikoPIM.getUserRole();
            const redirectUrl = role === 'Retailer' ? 
              '/dev/app/retailer/dashboard' : '/dev/app/customer/dashboard';
            window.location.href = redirectUrl;
          }
        } catch (error) {
          alert('Login failed: ' + error.message);
        }
      });
    }
  }
  
  waitForNikoPIM();
});
</script>
```

## ✅ Required Form IDs in Webflow:

**Signup Form:**
- `customer-name-input` / `retailer-name-input`
- `customer-email-input` / `retailer-email-input`  
- `customer-password-input` / `retailer-password-input`
- `customer-signup-btn` / `retailer-signup-btn`

**Login Form:**
- `customer-email-input` / `retailer-email-input`
- `customer-password-input` / `retailer-password-input`
- `customer-login-btn` / `retailer-login-btn`

## 🎯 Next Steps:

1. ✅ Repo is mostly correct - keep current structure
2. ❌ Remove `/src/forms/` folder (causes confusion)
3. ✅ Use the simple inline scripts approach above
4. ✅ Update Webflow form IDs to match the script expectations
5. ✅ Test authentication flow

The authentication system is solid - it just needs proper Webflow form integration!
