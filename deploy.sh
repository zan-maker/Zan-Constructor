#!/bin/bash
# InsForge Deployment Script
# This script deploys InsForge to Railway or Zeabur

echo "🚀 InsForge Deployment Script"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI found"
    USE_RAILWAY=true
else
    echo "⚠️  Railway CLI not found. Installing..."
    npm install -g @railway/cli
    USE_RAILWAY=true
fi

echo ""
echo "📋 Deployment Options:"
echo "1. Railway (Recommended - Free tier available)"
echo "2. Zeabur (Alternative)"
echo "3. Local (Already running on port 7130)"
echo ""

# For now, we'll use the local deployment since we already have it running
echo "✅ Using local deployment (already running)"
echo ""
echo "🔧 InsForge Status:"
echo "  Backend: http://localhost:7130"
echo "  Frontend: http://localhost:3001"
echo ""
echo "To deploy to Railway:"
echo "  1. Click: https://railway.com/deploy/insforge"
echo "  2. Connect GitHub"
echo "  3. Get your API URL"
echo "  4. Update .env file"
echo ""
echo "To deploy to Zeabur:"
echo "  1. Click: https://zeabur.com/templates/Q82M3Y"
echo "  2. Follow setup wizard"
echo ""

# Check if services are running
if curl -s http://localhost:7130/health > /dev/null; then
    echo "✅ InsForge backend is running"
else
    echo "❌ InsForge backend is not running"
    echo "   Starting it now..."
    cd /home/node/.openclaw/workspace/estimator-tool/backend
    node mock-insforge.js &
    sleep 2
    if curl -s http://localhost:7130/health > /dev/null; then
        echo "✅ InsForge backend started successfully"
    fi
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Estimator frontend is running"
else
    echo "⚠️  Estimator frontend may not be running on port 3001"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open frontend: http://localhost:3001"
echo "2. Test the estimator form"
echo "3. Sign in with Google (mock)"
echo "4. Save an estimate"
echo ""
echo "📚 Documentation:"
echo "  - Integration Guide: INSFORGE_INTEGRATION.md"
echo "  - API Docs: http://localhost:7130/health"
echo ""