# Webflow CMS Integration

This folder contains Phase 5 functionality: automatic creation of Webflow CMS records when users register via Supabase.

## 🎯 Goal
- Create Webflow CMS records when users register
- Sync user data between Supabase auth and Webflow CMS
- Enable wishlist functionality
- Maintain CORS-free API integration via Edge Functions

## 🔧 Components

### Edge Functions (`../supabase/functions/`)
- `create-webflow-user` - Creates CMS records on registration
- `get-webflow-user-by-firebase-uid` - Retrieves user data
- `update-webflow-user-wishlist` - Manages wishlist

### Integration Files
- `supabase-registration-with-webflow.js` - Enhanced registration
- `webflow-api-client.js` - Edge Function client
- `enhanced-auth-system.js` - Main system with CMS integration

## 🚀 Data Flow

```
User Register → Supabase Auth → Edge Function → Webflow CMS
User Login → Load Webflow Data → Wishlist Available
```

## 🧪 Testing CDN
```html
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@phase-5/webflow-cms-integration/dist/enhanced-auth.min.js"></script>
```

This extends the core auth system with CMS integration.