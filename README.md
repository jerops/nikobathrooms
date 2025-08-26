# Niko Bathrooms PIM System

A modular authentication and user management system built for Webflow integration with Supabase backend.

## Architecture Overview

The system is built using a modular CDN architecture where each functionality is isolated in separate modules. This approach provides better maintainability, debugging capabilities, and allows loading only required functionality.

## Core Modules

### Authentication Core
**Path:** `auth-core/`  
**CDN:** `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js`  
**Size:** 131KB  
**Dependencies:** None

Core authentication functionality including user registration, login/logout, Supabase authentication, role-based redirects, and dynamic domain detection for staging/production environments.

### CMS User Integration  
**Path:** `cms-user-integration/`  
**CDN:** `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js`  
**Size:** 12.8KB  
**Dependencies:** Authentication Core

Handles automatic synchronization between Supabase authenticated users and Webflow CMS Customer/Retailer collections. Creates matching CMS records linked via firebase-uid field when users register.

### Webflow Form Handlers
**Path:** `webflow-forms/`  
**CDN:** 
- Signup: `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/signup-page.js`
- Login: `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/login-page.js`

**Dependencies:** Authentication Core

Standalone form handlers for Webflow pages. Includes password toggles, email confirmation handling, domain-aware redirects, and Webflow modal integration.

### Content Gating
**Path:** `content-gating/`  
**CDN:** `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js`  
**Size:** 28KB  
**Dependencies:** Authentication Core, Finsweet Attributes

Role-based content visibility system that shows/hides content based on user authentication state and user type (Customer/Retailer).

## Implementation Guide

### Site-Wide Integration
Add to Webflow Site Settings > Custom Code > Head:

```html
<!-- Core authentication system -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>

<!-- CMS integration for user synchronization -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
```

### Page-Specific Integration

**Login Page** - Add to Page Settings > Before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/login-page.js"></script>
```

**Signup Page** - Add to Page Settings > Before `</body>`:
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/signup-page.js"></script>
```

**Dashboard Pages** - Add to Page Settings > Head:
```html
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```

## Environment Support

The system automatically detects and supports:
- **Production:** `www.nikobathrooms.ie`
- **Staging:** `nikobathrooms.webflow.io`

All redirects and authentication flows are environment-aware.

## Technical Specifications

### Build System
Each module uses Webpack for bundling with Babel transpilation for browser compatibility.

### API Exposure
- **Authentication Core:** `window.NikoAuthCore`
- **CMS Integration:** `window.NikoCMSIntegration`
- **Content Gating:** `window.NikoContentGating`

### Security
- Client-side session management without sensitive token storage
- Server-side authentication verification via Supabase
- Secure Edge Functions integration for CMS operations

## Development

### Building Modules
```bash
# Navigate to specific module
cd [module-directory]

# Install dependencies
npm install

# Build production bundle
npm run build

# Commit built assets
git add dist/ -f
git commit -m "Build [module-name]"
git push origin main
```

### Module Structure
Each module follows consistent structure:
```
module-name/
├── src/           # Source files
├── dist/          # Built assets (committed)
├── package.json   # Dependencies and scripts
├── webpack.config.js
└── README.md
```

## Migration Notes

This system replaces previous monolithic implementations and external dependencies while maintaining identical functionality. All existing Webflow form integrations, authentication flows, and CMS synchronization continue to work without modification.