# Niko Bathrooms PIM System - Modular CDN Architecture

## 📦 Available CDN Modules

Each functionality is isolated in its own CDN link for modular architecture, better performance, and easier maintenance.

### 🔐 Auth Core Module
**CDN Link:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
```

**Features Covered:**
- User registration (Customer/Retailer)
- User login/logout  
- Supabase authentication
- Role-based redirects
- Dynamic domain detection (staging/production)
- Session management

**Global API:** `window.NikoAuthCore`  
**Status:** ✅ Ready for Build  
**Size:** ~60-80KB (Supabase included)

---

### 🔗 CMS User Integration Module
**CDN Link:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
```

**Features Covered:**
- Webflow CMS synchronization
- Firebase UID linking
- Edge Functions integration
- User profile sync
- Wishlist management

**Global API:** `window.NikoCMSIntegration`  
**Dependencies:** Requires `auth-core` module  
**Status:** ✅ Ready for Build  
**Size:** ~20-30KB

---

### 🚪 Content Gating Module
**CDN Link:**
```html
<!-- Finsweet Attributes (required dependency) -->
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>

<!-- Content Gating Module -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```

**Features Covered:**
- Role-based content visibility (Customer/Retailer)
- Authentication state management
- Finsweet Attributes integration
- CSS fallback gating
- Element-level access control

**Global API:** `window.NikoContentGating`  
**Dependencies:** Requires `auth-core` module  
**Status:** ✅ Production Ready  
**Size:** ~28KB

---

## 🏗️ Module Load Order & Dependencies

### **Correct Loading Sequence:**
```html
<!-- 1. Core Authentication (required first) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>

<!-- 2. CMS Integration (optional - for Webflow sync) -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>

<!-- 3. Content Gating (optional - for role-based visibility) -->
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```

### **Dependency Tree:**
```
auth-core (required)
├── cms-user-integration (depends on auth-core)
└── content-gating (depends on auth-core)
```

## 🎯 Usage Scenarios

### **Basic Authentication Only:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
```
**Use Case:** Simple login/logout functionality  
**Total Size:** ~70KB

### **Full CMS Integration:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
```
**Use Case:** Authentication + Webflow CMS sync + Wishlist  
**Total Size:** ~90KB

### **Complete System:**
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/auth-core/dist/niko-auth-core.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/cms-user-integration/dist/niko-cms-integration.min.js"></script>
<script async src="https://cdn.jsdelivr.net/npm/@finsweet/attributes-listfilter@1/listfilter.js"></script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5.3-content-gating/content-gating/dist/niko-content-gating.min.js"></script>
```
**Use Case:** Full featured dashboard with role-based content  
**Total Size:** ~120KB

## 🚀 Building the Modules

Each module can be built independently:

```bash
# Auth Core
cd auth-core
npm install
npm run build

# CMS Integration  
cd cms-user-integration
npm install
npm run build

# Content Gating (already built)
# Available at phase-5.3-content-gating branch
```

## 📊 Migration Strategy

### **From Monolithic System:**
1. **Phase 1:** Deploy new modular CDNs alongside existing
2. **Phase 2:** Test new modular system 
3. **Phase 3:** Switch production to modular CDNs
4. **Phase 4:** Deprecate monolithic system

### **Backward Compatibility:**
- Existing `niko-pim.min.js` remains functional
- New modular system provides identical API
- Gradual migration possible

## ✅ Benefits Achieved

- **🎯 Isolation:** Problems in one module don't break others
- **🔍 Debugging:** Easier to identify which system has issues  
- **⚡ Performance:** Load only required modules
- **🛠️ Maintenance:** Individual updates and rollbacks
- **👥 Team Development:** Different developers can work on different modules
- **📈 Scalability:** Add new modules without affecting existing ones