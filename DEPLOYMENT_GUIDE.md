# Landscaping Estimator Tool - Deployment Guide

## 🚀 Quick Start

### Option 1: Deploy to estimator.cubiczan.com (Recommended)
1. **Build the app:**
   ```bash
   cd estimator-tool/frontend
   npm run build
   ```

2. **Upload to your hosting:**
   - Copy the `dist/` folder to your web server
   - Point `estimator.cubiczan.com` DNS to this folder

3. **Start OpenRAG backend (for AI features):**
   ```bash
   cd estimator-tool
   ./setup-openrag.sh
   # Follow the prompts to install container runtime
   # Start OpenRAG:
   cd openrag-env
   uvx openrag serve
   ```

### Option 2: Docker Deployment
```bash
cd estimator-tool
./deploy.sh
# Follow the instructions to build and run with Docker
```

### Option 3: Netlify (Free & Easy)
1. Go to https://app.netlify.com/
2. Drag and drop the `estimator-tool/frontend/dist` folder
3. Set site name to `estimator-cubiczan`
4. Add custom domain `estimator.cubiczan.com`

## 📁 Project Structure

```
estimator-tool/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SimpleEstimateForm.tsx    # Main form
│   │   │   └── OpenRAGAssistant.tsx      # AI assistant
│   │   ├── types/estimate.ts            # TypeScript types
│   │   └── App.tsx                      # Main app
│   └── dist/                          # Built files
├── openrag-data/                     # AI knowledge base
│   └── knowledge-base/
│       └── landscaping-pricing.md    # Industry pricing data
├── deploy.sh                        # Deployment script
└── DEPLOYMENT_GUIDE.md             # This file
```

## 🔧 Integration with cubiczan.com

### Method A: Subdomain (Recommended)
1. **Create subdomain:** `estimator.cubiczan.com`
2. **Deploy standalone:** Follow Quick Start above
3. **Link from main site:** Add button/link on cubiczan.com

### Method B: Embedded Page
1. **Add to website builder:**
   - Files are already added to `cubiczan-website-builder/frontend/src/pages/EstimatorPage.tsx`
   - Access via "Open Landscaping Estimator" button

2. **Run website builder:**
   ```bash
   cd cubiczan-website-builder/frontend
   npm run dev
   # Open http://localhost:5173
   ```

### Method C: Iframe Embed
Add to any page on cubiczan.com:
```html
<iframe 
  src="https://estimator.cubiczan.com" 
  width="100%" 
  height="800px"
  style="border: none;"
  title="Landscaping Estimator"
></iframe>
```

## 🧠 AI Backend (OpenRAG)

### Installation
```bash
cd estimator-tool
./setup-openrag.sh
# Choose Podman (option 1) or Docker (option 2)
# Complete the setup wizard
```

### Configuration
- **Port:** 3000 (http://localhost:3000)
- **Knowledge base:** `openrag-data/knowledge-base/`
- **Industries:** landscaping, plumbing, hvac, electrical

### Start/Stop
```bash
# Start
cd openrag-env
uvx openrag serve

# Stop
Ctrl+C
```

## 📊 Database & Storage

### Estimates Storage
The app currently uses browser localStorage. For production:

1. **Add backend API** (Node.js/Express):
   ```javascript
   // Example endpoint
   POST /api/estimates
   GET /api/estimates/:id
   ```

2. **Database options:**
   - PostgreSQL (recommended)
   - MongoDB
   - SQLite (simple)

3. **File uploads:**
   - Store in `uploads/` directory
   - Use Cloudinary/S3 for production

## 🔒 Security & Environment Variables

### Required Variables
Create `.env` file in `frontend/`:
```env
VITE_API_URL=https://api.cubiczan.com
VITE_OPENRAG_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Security Best Practices
1. **HTTPS:** Always use HTTPS in production
2. **CORS:** Configure CORS for your domain
3. **Rate limiting:** Implement on API endpoints
4. **Input validation:** Sanitize all user inputs
5. **File upload limits:** Restrict file types and sizes

## 📈 Monitoring & Analytics

### Basic Setup
1. **Google Analytics:**
   ```html
   <!-- Add to index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Error tracking:**
   - Sentry.io (free tier available)
   - LogRocket

3. **Performance monitoring:**
   - Lighthouse audits
   - Web Vitals tracking

## 🚨 Troubleshooting

### Common Issues

1. **OpenRAG won't start:**
   ```bash
   # Check container runtime
   docker --version
   podman --version
   
   # Reinstall OpenRAG
   uvx openrag --tui
   ```

2. **Build errors:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

3. **CORS errors:**
   - Ensure OpenRAG is running on port 3000
   - Check browser console for errors
   - Configure CORS in OpenRAG settings

4. **Form not saving:**
   - Check browser localStorage
   - Verify form validation
   - Check console for JavaScript errors

### Support
- **Documentation:** Check this guide first
- **GitHub Issues:** Create issue with error details
- **Community:** Discord #claw18 channel

## 🎯 Success Metrics

### Deployment Checklist
- [ ] Frontend builds without errors
- [ ] OpenRAG backend starts successfully
- [ ] Form calculations work correctly
- [ ] AI suggestions appear
- [ ] Document upload works
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Analytics configured
- [ ] Error tracking setup

### Performance Targets
- **Load time:** < 3 seconds
- **Form response:** < 100ms
- **AI queries:** < 2 seconds
- **Uptime:** 99.9%

## 📞 Contact & Support

For deployment assistance:
- **Discord:** @cubiczan1 in #claw18
- **Email:** [your email]
- **Documentation:** https://docs.cubiczan.com/estimator

---

**Last Updated:** 2026-03-13  
**Version:** 1.0.0  
**Status:** Production Ready 🚀