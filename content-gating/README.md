# Niko Bathrooms Content Gating System

## Overview
Phase 5.3: Standalone content gating system that works alongside the core authentication system.

## Architecture
- **Separate module** from core authentication
- **Independent CDN deployment**
- **Modular integration** with existing auth system

## Installation

### 1. Core Authentication (Required)
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-pim.min.js"></script>
```

### 2. Content Gating (Optional Enhancement)
```html
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```

## Features
- **Role-based content gating** (customer/retailer)
- **Authentication state management**
- **Finsweet Attributes integration**
- **Fallback CSS gating**
- **Login redirect handling**

## Usage

### Basic Gating
```html
<!-- Customer-only content -->
<div niko-data="customer">Customer exclusive content</div>

<!-- Retailer-only content -->
<div niko-data="retailer">Retailer exclusive content</div>

<!-- Public content (no attribute needed) -->
<div>Public content for everyone</div>
```

### JavaScript API
```javascript
// Check gating state
console.log(window.NikoContentGating.getAuthState());

// Manual element gating
const element = document.querySelector('.protected-content');
window.NikoContentGating.gateElement(element, true, 'customer');

// Add login prompt
window.NikoContentGating.addLoginPrompt(element, 'Login to access this feature');
```

## Build Commands
```bash
npm install
npm run build
npm run serve  # Local testing
```

## Dependencies
- Core Niko PIM Authentication System
- Finsweet Attributes (optional)
- Modern browser with sessionStorage support

## Security
- No sensitive tokens stored client-side
- Server-side authentication verification
- Periodic token validation
- Graceful degradation