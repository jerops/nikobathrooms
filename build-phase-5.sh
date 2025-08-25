#!/bin/bash

# Phase 5: Webflow CMS Integration - Build Script
echo "🚀 Building Niko PIM Authentication System with Webflow CMS Integration..."

cd niko-pim-auth

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the system with Phase 5 integration
echo "🔨 Building enhanced authentication system..."
npm run build

# Verify build
if [ -f "dist/niko-pim.min.js" ]; then
    echo "✅ Build successful!"
    echo "📊 Build size:"
    ls -lh dist/niko-pim.min.js
    echo ""
    echo "🔧 New features added in Phase 5:"
    echo "  - Webflow CMS user record creation"
    echo "  - User data synchronization"
    echo "  - Wishlist functionality"
    echo "  - Edge Functions integration"
    echo ""
    echo "🌐 CDN URL for Webflow:"
    echo "  https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-pim.min.js"
else
    echo "❌ Build failed!"
    exit 1
fi
