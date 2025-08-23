#!/bin/bash

# Niko PIM Authentication System - Rebuild & Deploy Script
# This script rebuilds the authentication system and prepares it for deployment

echo "🚀 Starting Niko PIM Authentication System rebuild..."

# Navigate to the project directory
cd "$(dirname "$0")/niko-pim-auth" || exit 1

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct directory. package.json not found."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Building production bundle with hardcoded credentials..."

# Build the production bundle
npm run build:prod

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Display build information
    echo ""
    echo "📊 Build Output:"
    echo "├── niko-pim.min.js ($(wc -c < dist/niko-pim.min.js | xargs) bytes)"
    echo "├── niko-pim-webflow.min.js ($(wc -c < dist/niko-pim-webflow.min.js | xargs) bytes)"
    echo "└── Source maps and licenses generated"
    
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Upload dist/niko-pim.min.js to your CDN (jsDelivr or hosting)"
    echo "2. Update Webflow pages to use the new version"
    echo "3. Test registration on: https://nikobathrooms.ie/dev/app/auth/sign-up"
    echo "4. Clear browser cache after deployment"
    
    echo ""
    echo "🌐 CDN Upload Commands:"
    echo "Upload: dist/niko-pim.min.js"
    echo "To: https://cdn.jsdelivr.net/gh/jerops/nikobathrooms@main/niko-pim-auth/dist/niko-pim.min.js"
    
    echo ""
    echo "✨ Build complete! Ready for deployment."
else
    echo "❌ Build failed! Check the errors above."
    exit 1
fi