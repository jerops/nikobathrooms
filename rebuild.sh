#!/bin/bash

# Quick Deploy Script for Niko PIM - fixes the registration issue
# Run this script to rebuild and deploy after fixing the ES6 module issue

echo "🔧 Rebuilding Niko PIM Authentication System..."

# Navigate to the project directory
cd niko-pim-auth

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Clean previous build
echo "🧹 Cleaning dist folder..."
npm run clean

# Build production version
echo "🏗️ Building production version..."
npm run build

echo "✅ Build completed!"

# The fixed signup.js now works with browser JavaScript instead of ES6 modules
# The key fix was:
# - Removed ES6 import/export statements
# - Restored browser-compatible event listeners
# - Fixed registration flow to work with existing window.NikoPIM object

echo "🚀 Ready to deploy:"
echo "- dist/niko-pim.min.js (main authentication library)"
echo "- dist/niko-pim-webflow.min.js (webflow integration)"

echo "📋 Next steps:"
echo "1. Upload dist files to jsDelivr CDN"
echo "2. Test registration forms in Webflow"
echo "3. Verify users are created in both Supabase and Webflow CMS"
