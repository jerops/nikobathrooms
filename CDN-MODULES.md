# Niko Bathrooms PIM System - Modular CDN Architecture

## Available CDN Modules

Each functionality is isolated in its own CDN link for modular architecture, better performance, and easier maintenance.

### Core Authentication
**CDN Link:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
```
**Features:** User registration, login/logout, Supabase authentication, role-based redirects, domain detection  
**Global API:** `window.NikoAuthCore`  
**Size:** 131KB  
**Status:** Production Ready

### CMS User Integration
**CDN Link:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
```
**Features:** Webflow CMS sync, Firebase UID linking, Edge Functions integration, wishlist management  
**Global API:** `window.NikoCMSIntegration`  
**Dependencies:** Requires auth-core  
**Size:** 12.8KB  
**Status:** Production Ready

### Webflow Forms
**CDN Link:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/niko-webflow-forms.min.js"></script>
```
**Features:** Login/signup form handlers, password toggles, Webflow modal integration, error handling  
**Global API:** `window.NikoWebflowForms`  
**Dependencies:** Requires auth-core  
**Size:** TBD (after build)  
**Status:** Ready for Build

### Content Gating
**CDN Link:**
```html
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```
**Features:** Role-based content visibility, authentication state management, CSS fallback gating  
**Global API:** `window.NikoContentGating`  
**Dependencies:** Requires auth-core + Finsweet Attributes  
**Size:** 28KB  
**Status:** Production Ready

## Usage Scenarios

### Basic Authentication Only
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
```
**Size:** 131KB  
**Use Case:** API-based authentication without forms

### Authentication with Forms
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/niko-webflow-forms.min.js"></script>
```
**Size:** ~145KB  
**Use Case:** Complete login/signup functionality

### Full CMS Integration
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/niko-webflow-forms.min.js"></script>
```
**Size:** ~158KB  
**Use Case:** Forms + CMS sync + wishlist management

### Complete System
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/niko-webflow-forms.min.js"></script>
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```
**Size:** ~186KB  
**Use Case:** Full-featured dashboard with all capabilities

## Migration from Backup Scripts

### Replace These:
```html
<!-- OLD - Remove these -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms-working-backup@main/webflow-scripts/signup-page.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms-working-backup@main/webflow-scripts/login-page.js"></script>
```

### With This:
```html
<!-- NEW - Integrated modular system -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/webflow-forms/dist/niko-webflow-forms.min.js"></script>
```

## Build Instructions

```bash
# Pull latest changes
git pull origin main

# Build webflow-forms module
cd webflow-forms
npm install
npm run build
git add dist/ -f
cd ..

# Commit and push
git commit -m "Build webflow-forms module"
git push origin main
```

## Benefits Achieved

- **Preserved Working Logic:** Original form handlers kept unchanged
- **Modular Architecture:** Load only required functionality  
- **Single CDN Management:** All modules in one repository
- **Domain-Aware Redirects:** Automatic staging/production detection
- **Error Handling:** Email confirmation prompts and validation
- **Password Toggles:** UI functionality maintained
- **Modal Integration:** Webflow confirmation modals preserved