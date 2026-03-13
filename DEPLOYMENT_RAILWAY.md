# Railway Deployment Instructions

## Prerequisites
1. GitHub account with repository access
2. Railway account (https://railway.app/)
3. Railway CLI installed (optional)

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit for Railway deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to https://railway.app/
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `estimator-tool`

### 3. Configure Environment Variables
In Railway dashboard, add these environment variables:

**For estimator-tool:**
```
NODE_ENV=production
PORT=3000
VITE_INSFORGE_URL=https://insforge-production.up.railway.app
```

**For cubiczan-website-builder:**
```
NODE_ENV=production
PORT=3000
```

### 4. Add Custom Domain (Optional)
1. In Railway project settings, go to "Domains"
2. Add your custom domain (e.g., estimator.cubiczan.com)
3. Update DNS records as instructed

### 5. Monitor Deployment
- Check Railway dashboard for deployment status
- View logs in Railway dashboard
- Monitor resource usage

## Railway Configuration
This project uses `railway.json` for deployment configuration:
- **Builder:** Nixpacks (auto-detects stack)
- **Build Command:** Defined in railway.json
- **Start Command:** Defined in railway.json

## Troubleshooting
- **Build fails:** Check Railway logs for errors
- **App not starting:** Verify PORT environment variable
- **Database issues:** Add PostgreSQL addon in Railway

## Cost Estimation
- **Free Tier:** Limited resources, good for testing
- **Hobby Tier:** $5/month, suitable for production
- **Database:** PostgreSQL addon starts at $7/month

## Support
- Railway Docs: https://docs.railway.app/
- GitHub Integration: https://docs.railway.app/deploy/github
- Custom Domains: https://docs.railway.app/deploy/custom-domains
