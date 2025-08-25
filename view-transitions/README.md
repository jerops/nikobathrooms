# Niko Bathrooms View Transitions

Custom smooth page transitions for the Niko Bathrooms Webflow application using the native View Transitions API.

## 🚀 Features

- **Native Performance** - Uses browser's View Transitions API
- **Niko-Branded** - Custom animations matching brand aesthetics  
- **Smart Filtering** - Only transitions within `/dev/app/` paths
- **Mobile Optimized** - Faster animations on mobile devices
- **Accessibility** - Respects `prefers-reduced-motion`
- **Analytics Ready** - Built-in Google Analytics integration
- **Debug Mode** - Development tools and logging

## 📦 Installation

### CDN Usage (Production)

Add to your Webflow global header:

```html
<!-- Niko View Transitions CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/view-transitions/src/view-transitions.css">

<!-- Niko View Transitions JS -->
<script>
window.nikoBathroomsViewTransitionsConfig = {
  appPath: '/dev/app/',
  contentWrapperClass: '.shell_main-wrapper',
  debug: false, // Set to true during development
  enableAnalytics: true
};
</script>
<script src="https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/view-transitions/src/view-transitions.js"></script>
```

**Note:** Once built, use the minified versions:
- `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/view-transitions/dist/view-transitions.min.css`
- `https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/view-transitions/dist/view-transitions.min.js`

## ⚙️ Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appPath` | string | `'/dev/app/'` | URL path for your app section |
| `contentWrapperClass` | string | `'.shell_main-wrapper'` | Main content container selector |
| `transitionDuration` | number | `400` | Animation duration (ms) |
| `debug` | boolean | `false` | Enable debug logging |
| `enableAnalytics` | boolean | `false` | Send events to Google Analytics |

## 🎨 Animation Styles

Add these CSS classes to your `<body>` or `<html>` element:

### Transition Types
- **Default** - Smooth slide transition
- `.niko-fade` - Fade with subtle blur effect
- `.niko-premium` - Scale + slide premium feel

### Speed Variants
- `.niko-fast` - Quick 250ms transitions
- `.niko-slow` - Leisurely 600ms transitions  
- `.niko-instant` - No animation (0ms)

### Example Usage
```html
<body class="niko-premium niko-fast">
  <!-- Your content -->
</body>
```

## 🛠️ Development

```bash
cd view-transitions
npm install
npm run build    # Build production files
npm run dev      # Watch for changes
npm run clean    # Clean dist folder
```

## 📊 Debug Mode

Set `debug: true` in config for development features:

- **Console Logging** - Detailed transition info
- **Visual Outlines** - See transition boundaries (add `.niko-debug` class)
- **Keyboard Shortcut** - `Ctrl+Shift+T` for stats
- **Performance Metrics** - Transition timing data

## 🌐 Browser Support

- ✅ Chrome 111+
- ✅ Edge 111+ 
- ✅ Safari 16.4+
- ⏳ Firefox (Coming Soon)
- 📱 Mobile Safari iOS 16.4+

Graceful fallback to normal navigation on unsupported browsers.

## 📈 Analytics Events

When `enableAnalytics: true`, these events are sent to Google Analytics:

- `system_initialized` - System startup
- `transition_success` - Successful page transition
- `transition_error` - Failed transition
- `transition_fallback` - Fallback to normal navigation

## 🔧 API Reference

### Global Object: `window.nikoBathroomsViewTransitions`

```javascript
// Get transition stats
window.nikoBathroomsViewTransitions.stats()

// Update configuration
window.nikoBathroomsViewTransitions.instance.updateConfig({ debug: true })

// Access instance
const vt = window.nikoBathroomsViewTransitions.instance
```

## 🎯 Integration with Niko Auth System

This system is designed to work seamlessly with the Niko PIM authentication system. Transitions automatically handle:

- Authentication state preservation
- Form data retention during navigation
- Error state management

## 📱 Mobile Considerations

- Reduced animation duration (300ms vs 400ms)
- Touch-friendly interaction zones
- Battery-conscious animations
- Reduced motion support

## 🏗️ Build Process

The system uses Webpack to create optimized production builds:

1. **Source Files**: `src/view-transitions.js` and `src/view-transitions.css`
2. **Build Command**: `npm run build`
3. **Output**: `dist/view-transitions.min.js` and `dist/view-transitions.min.css`

### Build Configuration

- **Minification** - TerserPlugin for JavaScript
- **CSS Processing** - MiniCssExtractPlugin for styles
- **UMD Export** - Compatible with various module systems
- **Clean Builds** - Automatic cleanup of dist folder

## 🔄 Version Control

This is a living system that will evolve with the Niko Bathrooms application:

- **Semantic Versioning** - Following SemVer standards
- **GitHub Releases** - Tagged releases for production
- **CDN Caching** - jsDelivr provides reliable CDN delivery

## 📝 Contributing

For modifications:

1. Follow the existing code style
2. Test thoroughly with debug mode enabled
3. Update documentation for any API changes
4. Run build process before committing

## 🔗 Related Systems

**Part of the Niko Bathrooms Digital Infrastructure:**
- [niko-pim-auth](../niko-pim-auth/) - Authentication system
- [Main Project](../) - Complete infrastructure overview

---

**Status:** ✅ Production Ready  
**Build System:** ✅ Configured  
**Documentation:** ✅ Complete  
**CDN Ready:** ✅ Available