# Railway Deployment Guide for Estimator Tool

## ✅ What's Ready

1. **Backend**: Node.js Express server (`backend/server.js`)
   - Serves frontend static files from `frontend/dist/`
   - API endpoints for estimates, documents, AI suggestions
   - Health check endpoint at `/health`
   - Railway-compatible (uses `PORT` environment variable)

2. **Frontend**: Simple static build (`frontend/dist/`)
   - Temporary landing page (will be replaced with full React app)
   - Ready for deployment

3. **Railway Configuration**: `railway.json`
   - Builds frontend with simple script
   - Starts backend server
   - Health check configured

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
cd ~/.openclaw/workspace/estimator-tool

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Estimator Tool with Railway config"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/cubiczan1/estimator-tool.git
git branch -M main
git push -u origin main
```

### 2. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `estimator-tool` repository
4. Railway will automatically detect the `railway.json` configuration

### 3. Configure Environment Variables

In Railway dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3000
```

### 4. Add Custom Domain

1. In Railway project settings, go to "Domains"
2. Add custom domain: `estimator.cubiczan.com`
3. Follow DNS configuration instructions

## 📁 Project Structure

```
estimator-tool/
├── railway.json           # Railway configuration
├── backend/
│   ├── server.js         # Main server (serves frontend + API)
│   ├── package.json      # Backend dependencies
│   └── data/             # File-based storage
├── frontend/
│   ├── build-simple.js   # Simple build script
│   ├── dist/             # Built frontend files
│   ├── package.json      # Frontend dependencies
│   └── src/              # React source code (to be built later)
└── DEPLOYMENT_GUIDE.md   # This file
```

## 🔧 Development

### Local Development

```bash
# Start backend
cd backend
npm install
npm run dev

# Build frontend (temporary)
cd frontend
npm run build

# Access at http://localhost:7130
```

### API Endpoints

- `GET /health` - Health check
- `GET /estimates` - List all estimates
- `POST /estimates` - Create new estimate
- `GET /estimates/:id` - Get single estimate
- `POST /ai/suggest-pricing` - AI pricing suggestions
- `POST /ai/chat` - AI chat assistance

## 🔄 Next Steps

1. **Complete React Build**: Fix Vite/TypeScript issues to build full React app
2. **Database Integration**: Add PostgreSQL/SQLite for persistent storage
3. **Authentication**: Implement real JWT authentication
4. **Email Integration**: Add Brevo/SendGrid for notifications
5. **Payment Processing**: Add Stripe for paid features

## 🆘 Troubleshooting

### Build Issues
If the React build fails, the simple build script (`build-simple.js`) creates a temporary static page.

### Port Issues
Railway sets the `PORT` environment variable. The server automatically uses it.

### Health Check Fails
Check that:
- Backend is running
- `/health` endpoint returns 200 OK
- Environment variables are set correctly

## 📞 Support

For issues:
1. Check Railway logs in dashboard
2. Verify environment variables
3. Test locally with `npm run dev`

---

**Deployment Status**: ✅ Ready for Railway deployment  
**Custom Domain**: `estimator.cubiczan.com`  
**Backend Port**: Uses Railway's `PORT` environment variable  
**Health Check**: `/health` endpoint configured