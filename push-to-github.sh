#!/bin/bash

# Script to push estimator-tool to GitHub repository
# Run this script and enter your GitHub credentials when prompted

cd "$(dirname "$0")"

echo "=== Pushing estimator-tool to GitHub ==="
echo "Repository: https://github.com/zan-maker/Zander"
echo ""

# Remove existing remote if any
git remote remove origin 2>/dev/null

# Add HTTPS remote
git remote add origin https://github.com/zan-maker/Zander.git

echo "Pushing code to GitHub..."
echo ""
echo "When prompted for credentials:"
echo "  - Username: Your GitHub username"
echo "  - Password: Your GitHub Personal Access Token (PAT)"
echo ""
echo "To create a PAT: https://github.com/settings/tokens"
echo "Required scope: 'repo' (full control of private repositories)"
echo ""

# Push to GitHub
git push -u origin master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "Repository: https://github.com/zan-maker/Zander"
    echo ""
    echo "Next steps:"
    echo "1. Go to Railway.app"
    echo "2. Create new project"
    echo "3. Connect GitHub repository 'zan-maker/Zander'"
    echo "4. Deploy!"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo "Make sure you have a GitHub Personal Access Token with 'repo' scope."
fi