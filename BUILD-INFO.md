# 🏗️ Build Information

**Build Date**: August 28, 2025  
**Build Version**: 1.0.0  
**Status**: ✅ Production Ready  

## Files Built:
- `niko-pim-auth/dist/niko-auth-core.min.js` - Main authentication system
- `niko-pim-auth/dist/niko-auth-styles.min.css` - Authentication styling

## CDN URLs:
- JS: `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-auth-core.min.js`
- CSS: `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-auth-styles.min.css`

## Integration:
The system is ready for production deployment on the Niko Bathrooms website.

## Webflow Integration Code:

```html
<!-- Add this to your site's <head> section -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-auth-styles.min.css">

<!-- Add Supabase SDK -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>

<!-- Configure authentication -->
<script>
window.nikoAuthConfig = {
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
  webflowSiteId: '67378d122c9df01858dd36f6'
};
</script>

<!-- Load Niko authentication system -->
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-auth-core.min.js"></script>
```

## Usage Examples:

### Registration:
```javascript
// Customer registration
window.NikoPIM.register('user@example.com', 'password123', 'John Doe', 'Customer')
  .then(result => {
    console.log('Registration successful:', result);
    // Redirect to onboarding
    window.location.href = '/dev/app/onboarding';
  })
  .catch(error => {
    console.error('Registration failed:', error);
  });
```

### Login:
```javascript
// User login
window.NikoPIM.login('user@example.com', 'password123')
  .then(result => {
    console.log('Login successful:', result);
    // Redirect based on user type
    const userType = result.user.user_metadata.user_type;
    if (userType === 'Customer') {
      window.location.href = '/dev/app/customer/dashboard';
    } else {
      window.location.href = '/dev/app/retailer/dashboard';
    }
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

### Logout:
```javascript
// User logout
window.NikoPIM.logout()
  .then(() => {
    console.log('Logout successful');
    window.location.href = '/dev/app/auth/log-in';
  })
  .catch(error => {
    console.error('Logout failed:', error);
  });
```
