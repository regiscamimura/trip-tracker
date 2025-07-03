#!/bin/bash

# 🚀 Trip Tracker Deployment Script
# This script helps you deploy your app to production

echo "🚀 Trip Tracker Deployment Helper"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "netlify.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Frontend builds successfully (pnpm build)"
echo "2. ✅ Backend dependencies are updated"
echo "3. ✅ Environment variables are configured"
echo "4. ✅ CORS settings are updated for production"
echo ""

# Test frontend build
echo "🔨 Testing frontend build..."
cd frontend
if pnpm build; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed. Please fix the issues first."
    exit 1
fi
cd ..

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Deploy Frontend to Netlify:"
echo "   - Go to https://netlify.com"
echo "   - Connect your GitHub repository"
echo "   - Set base directory to: frontend"
echo "   - Set build command to: pnpm build"
echo "   - Set publish directory to: dist"
echo ""
echo "2. Deploy Backend to Railway/Render/Heroku:"
echo "   - Choose your preferred platform"
echo "   - Set root directory to: backend"
echo "   - Configure environment variables"
echo ""
echo "3. Update Environment Variables:"
echo "   - VITE_API_URL: Your backend URL"
echo "   - VITE_MAPBOX_ACCESS_TOKEN: Your Mapbox token"
echo ""
echo "4. Update CORS settings in backend/trip_tracker/settings_production.py"
echo "   - Replace 'your-netlify-app.netlify.app' with your actual Netlify domain"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!" 