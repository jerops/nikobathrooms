#!/bin/bash

echo "🔍 NIKO PIM SYSTEM - FILE VALIDATION CHECK"
echo "=========================================="

echo "📂 Checking modular structure..."

# Check core files
if [ -f "niko-pim-auth/src/index.js" ]; then
    echo "✅ Core authentication system: FOUND"
else
    echo "❌ Core authentication system: MISSING"
fi

# Check modular components
if [ -d "niko-pim-auth/src/config" ] && [ -d "niko-pim-auth/src/auth" ] && [ -d "niko-pim-auth/src/forms" ]; then
    echo "✅ Modular structure: FOUND"
else
    echo "❌ Modular structure: INCOMPLETE"
fi

# Check form handlers
if [ -f "niko-pim-auth/src/forms/signup.js" ] && [ -f "niko-pim-auth/src/forms/login.js" ]; then
    echo "✅ Form handlers: FOUND"
else
    echo "❌ Form handlers: MISSING"
fi

# Check build system
if [ -f "niko-pim-auth/package.json" ] && [ -f "niko-pim-auth/webpack.config.js" ]; then
    echo "✅ Build system: FOUND"
else
    echo "❌ Build system: INCOMPLETE"
fi

# Check Supabase Edge Functions
if [ -d "supabase/functions" ]; then
    echo "✅ Supabase Edge Functions: FOUND"
    echo "   📋 Available functions:"
    ls supabase/functions/ | grep -v _shared | sed 's/^/   - /'
else
    echo "❌ Supabase Edge Functions: MISSING"
fi

# Check dist files
if [ -d "niko-pim-auth/dist" ] && [ -f "niko-pim-auth/dist/niko-pim.min.js" ]; then
    echo "✅ Built files: FOUND"
    echo "   📊 Size: $(ls -lh niko-pim-auth/dist/niko-pim.min.js | awk '{print $5}')"
else
    echo "❌ Built files: MISSING - Run rebuild script"
fi

echo ""
echo "🔧 RECOMMENDATIONS:"
echo "1. Run: ./fix-and-rebuild.sh"
echo "2. Test authentication on your Webflow site"
echo "3. Deploy Supabase Edge Functions if needed"
echo "4. Update CDN URLs in Webflow"
