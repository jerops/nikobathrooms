# CDN Module Reference

Complete reference for all available CDN modules in the Niko Bathrooms PIM System.

## Quick Reference

| Module | CDN Link | Size | Dependencies |
|--------|----------|------|--------------|
| Auth Core | `@main/auth-core/dist/niko-auth-core.min.js` | 131KB | None |
| CMS Integration | `@main/cms-user-integration/dist/niko-cms-integration.min.js` | 12.8KB | Auth Core |
| Signup Forms | `@main/webflow-forms/dist/signup-page.js` | ~8KB | Auth Core |
| Login Forms | `@main/webflow-forms/dist/login-page.js` | ~6KB | Auth Core |
| Content Gating | `@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js` | 28KB | Auth Core |

## Implementation Patterns

### Basic Authentication
**Use Case:** Simple authentication without CMS integration
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
```

### Authentication with CMS Sync
**Use Case:** User registration syncs with Webflow Customer/Retailer collections
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
```

### Login Page Implementation
```html
<!-- Site-wide (in head) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>

<!-- Page-specific (before </body>) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/login-page.js"></script>
```

### Signup Page Implementation
```html
<!-- Site-wide (in head) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>

<!-- Page-specific (before </body>) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/signup-page.js"></script>
```

### Dashboard with Content Gating
```html
<!-- Site-wide (in head) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>

<!-- Dashboard-specific (in head) -->
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```

## Module Details

### Authentication Core
**Primary Functions:**
- User registration (Customer/Retailer roles)
- Login/logout with email confirmation handling
- Automatic domain detection (staging vs production)
- Role-based dashboard redirects
- Session state management

**Global API:** `window.NikoAuthCore`

**Key Methods:**
```javascript
// Authentication
await NikoAuthCore.register(email, password, name, userType)
await NikoAuthCore.login(email, password)
await NikoAuthCore.logout()

// State checking
NikoAuthCore.isAuthenticated()
NikoAuthCore.getCurrentUser()
NikoAuthCore.getUserRole()

// Utilities
NikoAuthCore.redirectToLogin()
NikoAuthCore.redirectToDashboard()
```

### CMS User Integration
**Primary Functions:**
- Automatic Webflow CMS record creation on user registration
- User data synchronization between Supabase and Webflow
- Firebase UID linking for record association
- Edge Functions integration for CMS operations

**Global API:** `window.NikoCMSIntegration`

**Process Flow:**
1. User registers via Auth Core
2. CMS Integration detects registration
3. Edge Function creates matching Webflow CMS record
4. Records linked via firebase-uid field
5. User data stays synchronized

### Webflow Form Handlers
**Signup Handler Features:**
- Customer/Retailer registration forms
- Password visibility toggles
- Webflow confirmation modal integration
- Email validation and error display

**Login Handler Features:**
- Customer/Retailer login forms
- Email confirmation status handling
- Domain-aware dashboard redirects
- Password visibility toggles

Both handlers preserve existing Webflow functionality while integrating with the modular authentication system.

### Content Gating
**Primary Functions:**
- Role-based content visibility
- Authentication state monitoring
- CSS fallback for non-JavaScript scenarios
- Finsweet Attributes integration

**Usage:**
```html
<!-- Customer-only content -->
<div niko-data="customer">Customer exclusive content</div>

<!-- Retailer-only content -->
<div niko-data="retailer">Retailer exclusive content</div>
```

## Load Order Requirements

1. **Auth Core** - Must load first (all other modules depend on it)
2. **CMS Integration** - Loads after Auth Core, before form handlers
3. **Form Handlers** - Page-specific, load after DOM ready
4. **Content Gating** - Requires Auth Core, can load independently

## Performance Considerations

- **Minimal Setup:** 131KB (Auth Core only)
- **Standard Setup:** 143.8KB (Auth Core + CMS Integration)
- **Complete Setup:** ~171.8KB (All modules)
- **Page-specific modules** reduce unnecessary loading
- **CDN caching** ensures fast subsequent loads