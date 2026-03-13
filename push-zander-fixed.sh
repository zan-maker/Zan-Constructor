#!/bin/bash

# ============================================
# PUSH ESTIMATOR-TOOL TO ZANDER REPOSITORY
# ============================================
# Repository: https://github.com/cubiczan1/Zander
# ============================================

echo "=== Pushing estimator-tool to GitHub (Zander repository) ==="
echo "Repository: https://github.com/cubiczan1/Zander"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ ERROR: Not in estimator-tool directory"
    echo "Please run this from: /home/node/.openclaw/workspace/estimator-tool"
    exit 1
fi

# Check Git status
echo "📊 Checking Git status..."
git status

# Stage all changes
echo ""
echo "📦 Staging all changes..."
git add .

# Commit changes
echo ""
echo "💾 Committing changes..."
git commit -m "Deploy estimator-tool to Railway

- Complete estimator tool with React frontend
- Mock InsForge backend API
- OpenRAG AI integration
- Railway deployment configuration
- Production-ready build"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "🌿 Current branch: $CURRENT_BRANCH"

# Set remote URL (using HTTPS for easier authentication)
echo ""
echo "🔗 Setting remote URL..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/cubiczan1/Zander.git

# Verify remote
echo ""
echo "🔍 Verifying remote..."
git remote -v

echo ""
echo "⚠️  IMPORTANT: When prompted for credentials:"
echo "   - Username: cubiczan1"
echo "   - Password: Your Personal Access Token (PAT)"
echo ""
echo "📤 Pushing to GitHub..."

# Try to push to current branch
if git push -u origin "$CURRENT_BRANCH"; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub repository:"
    echo "   https://github.com/cubiczan1/Zander"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Go to Railway.app"
    echo "   2. Create new project"
    echo "   3. Connect to GitHub repository 'Zander'"
    echo "   4. Deploy automatically"
    echo ""
    echo "🌐 Your app will be available at:"
    echo "   https://estimator.cubiczan.com (after domain setup)"
else
    echo ""
    echo "❌ Push failed. Possible issues:"
    echo "   1. Repository 'Zander' doesn't exist"
    echo "   2. PAT doesn't have 'repo' permissions"
    echo "   3. Network connectivity"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "   A. Create repository: https://github.com/new"
    echo "      - Owner: cubiczan1"
    echo "      - Name: Zander"
    echo "      - Private: ✅"
    echo "      - Initialize with README: ✅"
    echo ""
    echo "   B. Create PAT: https://github.com/settings/tokens"
    echo "      - Note: 'Zander Repository Access'"
    echo "      - Expiration: 90 days"
    echo "      - Scopes: repo (full control)"
    echo ""
    echo "   C. Try pushing manually:"
    echo "      git push -u origin $CURRENT_BRANCH"
    echo ""
    echo "   D. Check if repository exists:"
    echo "      curl -s -H 'Authorization: token YOUR_PAT' https://api.github.com/repos/cubiczan1/Zander"
fi