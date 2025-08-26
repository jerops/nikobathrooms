#!/bin/bash

echo "🔧 NIKO PIM AUTHENTICATION SYSTEM - COMPLETE FIX & REBUILD"
echo "=========================================================="

# Step 1: Navigate to auth directory
cd niko-pim-auth

echo "📦 Step 1: Installing/updating dependencies..."
npm install

echo "🧹 Step 2: Cleaning old build files..."
rm -rf dist/*

echo "🔨 Step 3: Building production version..."
npm run build

echo "🔍 Step 4: Verifying build..."
if [ -f "dist/niko-pim.min.js" ]; then
    echo "✅ Build successful!"
    echo "📊 File size:"
    ls -lh dist/niko-pim.min.js
    echo ""
    echo "🌐 CDN URL (update this in Webflow):"
    echo "https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-pim.min.js"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy the built files to your CDN"
    echo "2. Update Webflow to use the new CDN URL"
    echo "3. Test registration and login flows"
    echo "4. Deploy Supabase Edge Functions if needed"
else
    echo "❌ Build failed! Check for errors above."
    exit 1
fi

echo ""
echo "✅ SYSTEM RESTORATION COMPLETE!"
echo "🎯 All modules should now have correct working code."
