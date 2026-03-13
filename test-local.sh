#!/bin/bash

# Test the Landscaping Estimator Tool locally

set -e

echo "🌿 Testing Landscaping Estimator Tool..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Run this script from the estimator-tool directory"
    exit 1
fi

# Install frontend dependencies if needed
echo "📦 Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not created"
    exit 1
fi

echo "✅ Frontend build successful!"

# Test with a simple HTTP server
echo "🌐 Starting test server..."
echo ""
echo "=========================================="
echo "🚀 Landscaping Estimator Tool is ready!"
echo "=========================================="
echo ""
echo "Open your browser and visit:"
echo "  http://localhost:8080"
echo ""
echo "To test the AI features, also start OpenRAG:"
echo "  cd .. && ./setup-openrag.sh"
echo "  cd openrag-env && uvx openrag serve"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start a simple HTTP server
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080 --directory dist
elif command -v python &> /dev/null; then
    python -m http.server 8080 --directory dist
elif command -v npx &> /dev/null; then
    npx serve dist -p 8080
else
    echo "❌ No HTTP server found. Install python or npx/serve"
    echo "   Python: sudo apt install python3"
    echo "   Node.js: npm install -g serve"
    exit 1
fi