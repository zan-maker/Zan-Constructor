# InsForge Integration for Landscaping Estimator

## 🚀 One-Click Deployment Options

### Option 1: Railway (Recommended)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/insforge)

**Steps:**
1. Click the Railway button above
2. Connect your GitHub account
3. Select the `insforge` repository
4. Railway will automatically deploy InsForge
5. Get your API URL (e.g., `https://insforge-production.up.railway.app`)

### Option 2: Zeabur
[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/Q82M3Y)

### Option 3: Sealos
[![Deploy on Sealos](https://sealos.io/Deploy-on-Sealos.svg)](https://sealos.io/products/app-store/insforge)

## 🔧 Configuration

### 1. Environment Variables
After deploying InsForge, configure these in your Railway/Zeabur dashboard:

```env
# Database
DATABASE_URL=postgresql://...

# Storage (S3 compatible)
S3_ENDPOINT=https://storage.railway.app
S3_ACCESS_KEY=your_key
S3_SECRET_KEY=your_secret
S3_BUCKET=estimator-uploads

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

# OpenRAG Integration
OPENRAG_URL=http://localhost:3000
```

### 2. Database Schema
Create tables for estimates:

```sql
-- estimates table
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT,
  location TEXT,
  area_sq_ft DECIMAL,
  sod_quantity INTEGER,
  sod_unit_cost DECIMAL,
  prep_hours DECIMAL,
  prep_hourly_rate DECIMAL,
  equipment_rental DECIMAL,
  markup DECIMAL DEFAULT 25,
  contingency DECIMAL DEFAULT 10,
  materials_total DECIMAL,
  labor_total DECIMAL,
  subtotal DECIMAL,
  final_total DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- documents table for uploaded files
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES estimates(id),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 Frontend Integration

### Update API Calls
Replace localStorage with InsForge API:

```typescript
// src/api/insforge.ts
const INSFORGE_API = import.meta.env.VITE_INSFORGE_URL || 'https://insforge-production.up.railway.app';

export async function saveEstimate(estimate: Estimate) {
  const response = await fetch(`${INSFORGE_API}/estimates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(estimate)
  });
  return response.json();
}

export async function uploadDocument(file: File, estimateId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('estimateId', estimateId);

  const response = await fetch(`${INSFORGE_API}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  return response.json();
}
```

### Authentication
Add login to estimator tool:

```typescript
// src/components/AuthButton.tsx
import { useInsForgeAuth } from '@insforge/sdk';

function AuthButton() {
  const { user, signIn, signOut } = useInsForgeAuth();

  if (user) {
    return (
      <button onClick={signOut}>
        Sign Out ({user.email})
      </button>
    );
  }

  return (
    <button onClick={() => signIn('google')}>
      Sign in with Google to save estimates
    </button>
  );
}
```

## 🌐 Website Integration (www.cubiczan.com)

### Option A: Direct Link
```html
<!-- Add to cubiczan.com navigation -->
<a href="https://estimator.cubiczan.com" 
   class="nav-link estimator-link">
  🌿 Landscaping Estimator
</a>
```

### Option B: Embedded Widget
```html
<!-- Add to cubiczan.com homepage -->
<div class="estimator-widget">
  <h3>Professional Landscaping Estimates</h3>
  <p>Get AI-powered estimates in minutes</p>
  <iframe 
    src="https://estimator.cubiczan.com/widget" 
    width="100%" 
    height="500"
    style="border: none; border-radius: 12px;"
    title="Landscaping Estimator">
  </iframe>
</div>
```

### Option C: Full Page Integration
1. **Add route:** `/estimator` on cubiczan.com
2. **Embed component:** Use React component directly
3. **Shared auth:** Use same InsForge instance

## 📊 Data Flow Architecture

```
User → cubiczan.com/estimator → InsForge Backend
                                     ↓
                              PostgreSQL Database
                                     ↓
                              S3 Storage (uploads)
                                     ↓
                              OpenRAG AI Processing
                                     ↓
                              PDF Generation → Email
```

## 🔄 API Endpoints

### Estimates API
```
GET    /estimates           - List user's estimates
POST   /estimates           - Create new estimate
GET    /estimates/:id       - Get estimate details
PUT    /estimates/:id       - Update estimate
DELETE /estimates/:id       - Delete estimate
POST   /estimates/:id/pdf   - Generate PDF
```

### Documents API
```
POST   /documents/upload    - Upload document
GET    /documents/:id       - Get document
DELETE /documents/:id       - Delete document
```

### AI Processing API
```
POST   /ai/suggest-pricing  - Get AI pricing suggestions
POST   /ai/extract-data     - Extract data from document
POST   /ai/chat             - Chat with estimator assistant
```

## 🎨 Design Integration

### 1. Brand Consistency
- Use cubiczan.com color scheme (#3B82F6)
- Match typography (Inter font)
- Consistent button styles

### 2. Responsive Layout
```css
.estimator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .estimator-container {
    padding: 1rem;
  }
}
```

### 3. User Experience
- **Guest mode:** Use without signup
- **Save prompts:** "Sign in to save this estimate"
- **Share features:** Generate shareable links
- **Export options:** PDF, Excel, JSON

## 🚀 Deployment Checklist

### Phase 1: InsForge Setup
- [ ] Deploy InsForge to Railway/Zeabur
- [ ] Configure PostgreSQL database
- [ ] Set up S3 storage
- [ ] Configure Google OAuth
- [ ] Test API endpoints

### Phase 2: Frontend Updates
- [ ] Update API calls to use InsForge
- [ ] Add authentication
- [ ] Implement file uploads
- [ ] Add estimate persistence
- [ ] Test all features

### Phase 3: Website Integration
- [ ] Add estimator link to cubiczan.com
- [ ] Create embedded widget
- [ ] Set up shared authentication
- [ ] Test cross-domain communication
- [ ] Monitor performance

### Phase 4: Production Launch
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Add analytics
- [ ] Create documentation

## 📈 Monitoring & Analytics

### Essential Metrics
- **Usage:** Number of estimates created
- **Performance:** API response times
- **Errors:** Failed requests, uploads
- **Conversion:** Guest → signed up users

### Tools
- **InsForge Dashboard:** Built-in monitoring
- **Google Analytics:** User behavior
- **Sentry:** Error tracking
- **Uptime Robot:** Availability monitoring

## 🔒 Security Considerations

### Authentication
- Use JWT tokens with short expiry
- Implement refresh tokens
- Secure password reset flow

### Data Protection
- Encrypt sensitive estimate data
- Secure file uploads (virus scanning)
- Regular database backups

### API Security
- Rate limiting per user/IP
- CORS configuration
- Input validation/sanitization

## 🆘 Support & Troubleshooting

### Common Issues
1. **CORS errors:** Check InsForge CORS settings
2. **Database connection:** Verify DATABASE_URL
3. **File uploads:** Check S3 credentials
4. **Authentication:** Verify OAuth configuration

### Getting Help
- **InsForge Docs:** https://insforge.dev/docs
- **GitHub Issues:** https://github.com/InsForge/InsForge/issues
- **Discord:** https://discord.com/invite/MPxwj5xVvW

---

**Next Steps:**
1. Click Railway/Zeabur button to deploy InsForge
2. Update frontend API calls
3. Add estimator link to cubiczan.com
4. Test complete workflow

**Estimated Time:** 2-4 hours for full integration