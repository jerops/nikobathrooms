# Phase 5: Webflow CMS Integration - Deployment Guide

## Overview
Phase 5 adds Webflow CMS integration to create corresponding user records in Webflow when users register via Supabase. This enables wishlist functionality and user data management.

## What's Been Added

### 1. Supabase Edge Functions
- **`create-webflow-user`** - Creates customer/retailer records in Webflow CMS
- **`get-webflow-user-by-firebase-uid`** - Retrieves user data from Webflow CMS
- **`update-webflow-user-wishlist`** - Updates user wishlist in Webflow CMS

### 2. Enhanced Authentication System
- **`supabase-signup-with-webflow-integration.js`** - Updated registration with CMS integration
- **`webflow-edge-functions-client.js`** - Client to interact with Edge Functions
- **Enhanced main system** - Now includes wishlist methods and Webflow data loading

## Deployment Steps

### Step 1: Deploy Edge Functions to Supabase

```bash
# Navigate to project root
cd /path/to/nikobathrooms

# Login to Supabase (if not already)
supabase login

# Link to your project
supabase link --project-ref bzjoxjqfpmjhbfijthpp

# Deploy the functions
supabase functions deploy create-webflow-user --no-verify-jwt
supabase functions deploy get-webflow-user-by-firebase-uid --no-verify-jwt
supabase functions deploy update-webflow-user-wishlist --no-verify-jwt
```

### Step 2: Set Environment Variables in Supabase

In your Supabase dashboard:
1. Go to Project Settings → Edge Functions
2. Add environment variables:

```
WEBFLOW_API_TOKEN=2ed581dc918442a26a18ecdb00ec916412c89d71d3fdf386f41ee8459ae2b1db
```

### Step 3: Rebuild and Deploy Authentication System

```bash
# Navigate to niko-pim-auth
cd niko-pim-auth

# Install dependencies
npm install

# Build the system
npm run build

# Commit and push changes
git add .
git commit -m "Phase 5: Webflow CMS Integration deployed"
git push
```

### Step 4: Test the Integration

After deployment, test the complete flow:

1. **Register a new user** at `https://nikobathrooms.webflow.io/dev/app/auth/sign-up`
2. **Check Supabase** - User should exist in auth.users
3. **Check Webflow CMS** - User should exist in Customers/Retailers collection
4. **Verify linking** - `firebase-uid` field should match Supabase user ID

## New API Methods Available

The updated system now exposes these methods:

```javascript
// Existing methods
window.NikoPIM.register(email, password, name, userType)
window.NikoPIM.login(email, password)
window.NikoPIM.logout()

// New Webflow methods
window.NikoPIM.getWebflowUser()           // Get Webflow CMS user data
window.NikoPIM.getWishlist()              // Get user's wishlist products
window.NikoPIM.addToWishlist(productId)   // Add product to wishlist
window.NikoPIM.removeFromWishlist(productId) // Remove from wishlist
```

## Data Flow

```
User Registration:
1. User fills signup form
2. Creates Supabase auth user
3. Calls Edge Function → Creates Webflow CMS record
4. Links records via firebase-uid field

User Login:
1. User authenticates with Supabase
2. System automatically loads Webflow user data
3. Wishlist data becomes available
```

## Collections Structure

### Customers Collection (68a6dc21ddfb81569ba773a4)
- `name` (Text)
- `email` (Email) 
- `firebase-uid` (Text, Unique)
- `user-type` (Option: Customer)
- `wishlist-products` (Multi-reference to Products)
- `is-active` (Switch)
- `registration-date` (DateTime)

### Retailers Collection (6738c46e5f48be10cf90c694)
- `name` (Text)
- `email` (Email)
- `firebase-uid` (Text, Unique)
- `user-type` (Option: Retailer)
- `wishlist-products` (Multi-reference to Products)
- `is-active` (Switch)
- `registration-date` (DateTime)

## Troubleshooting

### Edge Function Issues
```bash
# View function logs
supabase functions logs create-webflow-user

# Test function locally
supabase functions serve create-webflow-user
```

### CORS Issues
- Edge Functions handle CORS automatically
- Direct Webflow API calls from browser will fail (by design)

### User Not Created in Webflow
1. Check Edge Function logs
2. Verify WEBFLOW_API_TOKEN is set
3. Confirm collection IDs are correct
4. Check Webflow API quotas

## Next Steps

With Phase 5 complete, you can now:
1. **Build wishlist functionality** on your Webflow pages
2. **Create user dashboard** with CMS data
3. **Implement role-based access** control
4. **Add product management** features

The authentication system now serves as the foundation for the complete PIM functionality.
