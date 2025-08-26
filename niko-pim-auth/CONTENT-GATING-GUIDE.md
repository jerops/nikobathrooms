# Phase 5.3: Content Gating Implementation Guide

## Overview
Phase 5.3 implements secure content gating that hides/shows elements based on user authentication state without storing sensitive tokens client-side.

## Architecture

### Security Approach
- **No sensitive tokens** stored in localStorage/sessionStorage
- **Server-side verification** of authentication state
- **Periodic token validation** (every 5 minutes)
- **Graceful degradation** when JavaScript is disabled

### Components
1. **AuthStateManager** - Manages authentication state securely
2. **FinsweetIntegration** - Interfaces with Finsweet Attributes for filtering
3. **ContentGatingController** - Orchestrates the entire system

## Webflow Setup

### 1. Add Finsweet Attributes Script
Add to your Webflow site's head:
```html
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
```

### 2. Add Content Gating CSS
Add to your site's head or custom CSS:
```html
<style>
/* Content gating styles */
[niko-data*="authenticated-only"] { display: none; }
[niko-data*="guest-only"] { display: block; }

/* When authenticated */
.niko-authenticated [niko-data*="authenticated-only"] { display: block !important; }
.niko-authenticated [niko-data*="guest-only"] { display: none !important; }

/* Role-specific content */
.niko-customer [niko-data*="customer"] { display: block !important; }
.niko-retailer [niko-data*="retailer"] { display: block !important; }

/* Login prompts */
.niko-login-prompt {
  padding: 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.niko-login-prompt a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.niko-login-prompt a:hover {
  text-decoration: underline;
}
</style>
```

### 3. Add Gating Attributes to Elements

#### Basic Authentication Gating
```html
<!-- Show only to authenticated users -->
<button class="wishlist-btn" niko-data="authenticated-only">
  Add to Wishlist
</button>

<!-- Show only to guests -->
<div class="login-prompt" niko-data="guest-only">
  <a href="/dev/app/auth/log-in">Login to save favorites</a>
</div>
```

#### Role-Specific Gating
```html
<!-- Show only to customers -->
<div class="customer-pricing" niko-data="authenticated-only customer">
  Customer Price: $100
</div>

<!-- Show only to retailers -->
<div class="retailer-pricing" niko-data="authenticated-only retailer">
  Wholesale Price: $80
</div>
```

#### Combined Attributes
```html
<!-- Multiple conditions -->
<div niko-data="authenticated-only customer guest-fallback">
  <!-- Content for authenticated customers -->
</div>
```

## JavaScript Integration

### Basic Usage
```javascript
// Check authentication state
const authState = window.NikoPIM.getContentGatingState();
console.log('Authenticated:', authState.isAuthenticated);
console.log('User Type:', authState.userType);

// Manually gate an element
const wishlistBtn = document.getElementById('wishlist-btn');
window.NikoPIM.gateElement(wishlistBtn, true, 'Customer');

// Add login prompt to element
const protectedContent = document.getElementById('protected-content');
window.NikoPIM.addLoginPrompt(protectedContent, 'Login to access premium features');

// Refresh gating (useful after AJAX content loads)
await window.NikoPIM.refreshContentGating();
```

### Advanced Usage
```javascript
// Listen for authentication changes
window.addEventListener('load', async () => {
  // Wait for auth system to initialize
  setTimeout(async () => {
    const authState = window.NikoPIM.getContentGatingState();
    
    if (authState.isAuthenticated) {
      console.log(`Welcome back, ${authState.userType}!`);
      // Load user-specific content
      loadUserContent();
    } else {
      console.log('Guest user');
      // Show guest experience
      showGuestExperience();
    }
  }, 1000);
});

// Manual logout with content gating cleanup
async function customLogout() {
  await window.NikoPIM.logout();
  // Content gating automatically updates
  window.location.reload(); // Optional: reload page
}
```

## Content Gating Patterns

### 1. Progressive Enhancement
```html
<!-- Default: Hidden (works without JavaScript) -->
<div class="premium-feature" niko-data="authenticated-only" style="display: none;">
  <h3>Premium Feature</h3>
  <p>This feature is available to logged-in users.</p>
</div>

<!-- Always visible fallback -->
<div class="login-prompt" niko-data="guest-only">
  <h3>Login Required</h3>
  <p><a href="/dev/app/auth/log-in">Sign in</a> to access premium features.</p>
</div>
```

### 2. Wishlist Buttons
```html
<div class="product-card">
  <h3>{{product-name}}</h3>
  <p>{{product-price}}</p>
  
  <!-- Authenticated: Show wishlist button -->
  <button class="wishlist-btn" niko-data="authenticated-only" 
          onclick="addToWishlist('{{wf-cms-id}}')">
    Add to Wishlist
  </button>
  
  <!-- Guest: Show login prompt -->
  <div class="login-prompt" niko-data="guest-only">
    <a href="/dev/app/auth/log-in?return={{current-page}}">
      Login to save favorites
    </a>
  </div>
</div>
```

### 3. Navigation Elements
```html
<nav class="main-nav">
  <!-- Always visible -->
  <a href="/">Home</a>
  <a href="/products">Products</a>
  
  <!-- Authenticated users -->
  <a href="/dashboard" niko-data="authenticated-only">Dashboard</a>
  <a href="/wishlist" niko-data="authenticated-only">My Wishlist</a>
  <button onclick="window.NikoPIM.logout()" niko-data="authenticated-only">Logout</button>
  
  <!-- Guests -->
  <a href="/dev/app/auth/log-in" niko-data="guest-only">Login</a>
  <a href="/dev/app/auth/sign-up" niko-data="guest-only">Sign Up</a>
</nav>
```

### 4. Role-Based Content
```html
<!-- Customer-only content -->
<div class="customer-section" niko-data="authenticated-only customer">
  <h2>Customer Portal</h2>
  <a href="/dev/app/customer/dashboard">My Dashboard</a>
  <a href="/dev/app/customer/wishlist">My Wishlist</a>
</div>

<!-- Retailer-only content -->
<div class="retailer-section" niko-data="authenticated-only retailer">
  <h2>Retailer Portal</h2>
  <a href="/dev/app/retailer/dashboard">Retailer Dashboard</a>
  <a href="/dev/app/retailer/wishlist">Product Catalog</a>
</div>
```

## Testing

### Manual Testing
1. **Guest State**: Ensure only guest content is visible
2. **Authenticated State**: Login and verify authenticated content appears
3. **Role Switching**: Test with Customer and Retailer accounts
4. **Session Expiry**: Wait 10+ minutes and verify redirect to login
5. **JavaScript Disabled**: Test that default styles provide reasonable fallback

### Console Testing
```javascript
// Check current state
console.log(window.NikoPIM.getContentGatingState());

// Force refresh
await window.NikoPIM.refreshContentGating();

// Test element gating
const testElement = document.querySelector('.test-element');
window.NikoPIM.gateElement(testElement, true, 'Customer');

// Test logout
await window.NikoPIM.logout();
```

## Security Considerations

### What This System Protects Against
- **XSS token theft** (no sensitive tokens stored client-side)
- **Session replay attacks** (periodic server-side validation)
- **Manual session storage modification** (server-side verification)

### What This System Does NOT Protect Against
- **Direct API calls** (implement server-side authorization)
- **Source code inspection** (content is still in HTML)
- **Advanced browser manipulation** (implement server-side validation for critical operations)

### Best Practices
- Use content gating for **UX enhancement**, not security
- Always **validate permissions server-side** for critical operations
- Implement **server-side authorization** for API endpoints
- Use **HTTPS** for all authentication-related requests

## Troubleshooting

### Common Issues

**1. Content not showing for authenticated users**
- Check browser console for JavaScript errors
- Verify Finsweet Attributes loaded properly
- Ensure `niko-data` attributes are correctly formatted

**2. Authentication state not updating**
- Check that Supabase auth is working properly
- Verify network connectivity
- Check session storage for cached auth state

**3. Login redirects not working**
- Verify return URL encoding in links
- Check for JavaScript errors during logout
- Ensure login page handles return URLs properly

**4. Finsweet integration not working**
- Verify Finsweet Attributes script is loaded
- Check for console errors related to `fsAttributes`
- Fallback CSS gating should still work

### Debug Commands
```javascript
// Check authentication status
console.log('Auth State:', window.NikoPIM.getContentGatingState());

// Check if system is initialized
console.log('Initialized:', window.NikoPIM.isInitialized);

// Force authentication verification
await window.NikoPIM.refreshContentGating();

// Check session storage
console.log('Session Data:', sessionStorage.getItem('niko_auth_state'));
```

This implementation provides robust, secure content gating that works well with Webflow's infrastructure while maintaining security best practices.