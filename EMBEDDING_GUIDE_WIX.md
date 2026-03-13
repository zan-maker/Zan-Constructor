# 📘 EMBEDDING GUIDE: Landscaping Estimator
## For Wix & Website Builder Implementation

**Project:** AI Landscaping Estimator with InsForge + A2UI  
**Target:** kubexam.com (and other contractor websites)  
**Version:** 1.0  
**Last Updated:** March 13, 2026

---

## 🎯 Overview

This guide provides step-by-step instructions for embedding the AI-powered landscaping estimator into Wix websites. The estimator uses:
- **InsForge Backend** - Cloud-based estimate storage & AI
- **A2UI Frontend** - Agent-generated dynamic UI components
- **3 UI Modes** - AI Wizard, Standard Form, Chat

---

## 📦 What You Need

### From the Development Team:
1. **Deployed API URL** (e.g., `https://api.kubexam.com` or `https://insforge-xx.railway.app`)
2. **Embed Code** (provided below)
3. **Styling Guide** (colors, fonts, sizing)

### For Wix Implementation:
1. Wix Premium Plan (for custom code)
2. Access to Wix Editor
3. Basic HTML/JavaScript knowledge

---

## 🚀 Option 1: iFrame Embed (Easiest - 5 minutes)

### Best For:
- Quick implementation
- Minimal customization needed
- Standalone estimator page

### Step-by-Step:

#### Step 1: Add HTML Embed Element
1. Open Wix Editor
2. Click **"+ Add"** → **"Embed"** → **"HTML iframe"**
3. Drag to desired location on page
4. Resize to approximately **900px width × 700px height**

#### Step 2: Insert Embed Code
Click on the HTML element and paste this code:

```html
<div style="width:100%;height:100%;min-height:600px;">
  <iframe 
    src="https://estimator.kubexam.com" 
    width="100%" 
    height="100%" 
    style="border:none;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);"
    allow="fullscreen"
    title="AI Landscaping Estimator"
  ></iframe>
</div>
```

#### Step 3: Update Source URL
Replace `https://estimator.kubexam.com` with the actual deployed URL

#### Step 4: Style Container (Optional)
Add custom CSS to match website:

```html
<style>
  .estimator-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  .estimator-iframe {
    width: 100%;
    height: 700px;
    border: 2px solid #e0e0e0;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
</style>

<div class="estimator-container">
  <iframe 
    class="estimator-iframe"
    src="https://estimator.kubexam.com"
    title="AI Landscaping Estimator"
  ></iframe>
</div>
```

#### Step 5: Publish
1. Click **"Publish"** in Wix Editor
2. Test the embedded estimator
3. Verify it loads and functions correctly

---

## 🎨 Option 2: Custom Element Integration (Advanced - 30 minutes)

### Best For:
- Seamless website integration
- Custom styling
- Responsive design
- Better SEO

### Step-by-Step:

#### Step 1: Create Custom Element in Wix
1. Go to **"Dev Mode"** (top right of editor)
2. Click **"+"** → **"Custom Element"**
3. Name it: `LandscapingEstimator`

#### Step 2: Add JavaScript Code

```javascript
// LandscapingEstimator.js
class LandscapingEstimator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const apiUrl = this.getAttribute('api-url') || 'https://api.kubexam.com';
    const theme = this.getAttribute('theme') || 'light';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .estimator-wrapper {
          background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
          min-height: 600px;
        }
        
        .estimator-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }
        
        .estimator-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .estimator-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }
        
        .estimator-content {
          padding: 24px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: ${theme === 'dark' ? '#ffffff' : '#666666'};
        }
        
        iframe {
          width: 100%;
          height: 600px;
          border: none;
          border-radius: 8px;
        }
      </style>
      
      <div class="estimator-wrapper">
        <div class="estimator-header">
          <h2>🌿 AI Landscaping Estimator</h2>
          <p>Get instant estimates powered by artificial intelligence</p>
        </div>
        <div class="estimator-content">
          <div class="loading">Loading estimator...</div>
          <iframe 
            src="${apiUrl}/embed" 
            style="display:none;"
            onload="this.style.display='block';this.previousElementSibling.style.display='none';"
          ></iframe>
        </div>
      </div>
    `;
  }
}

customElements.define('landscaping-estimator', LandscapingEstimator);
```

#### Step 3: Add to Wix Page
1. Drag "Custom Element" to page
2. Select `LandscapingEstimator`
3. Add attributes in Properties panel:
   - `api-url`: `https://api.kubexam.com`
   - `theme`: `light` (or `dark`)

#### Step 4: Style with Wix
Use Wix design tools to:
- Adjust container size
- Set responsive breakpoints
- Match website color scheme

---

## 🔧 Option 3: Velo by Wix (Full Control - 1-2 hours)

### Best For:
- Maximum customization
- Database integration
- Dynamic content
- Member-specific features

### Step-by-Step:

#### Step 1: Enable Velo
1. Go to **"Dev Mode"** in Wix Editor
2. Click **"Enable Velo"**
3. Turn on **"Site Monitoring"**

#### Step 2: Create Page Elements
Add these elements to your page:
- Container (Box) - `estimatorContainer`
- HTML Component - `estimatorFrame`
- Loading spinner (optional)

#### Step 3: Add Page Code

```javascript
// Page Code (e.g., Estimator.js)

import { fetch } from 'wix-fetch';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';

const API_URL = 'https://api.kubexam.com';
const EMBED_URL = 'https://estimator.kubexam.com';

// On page load
$w.onReady(function () {
  // Show loading state
  $w('#loadingSpinner').show();
  $w('#estimatorFrame').hide();
  
  // Get current user (if logged in)
  const user = wixUsers.currentUser;
  const userId = user.loggedIn ? user.id : null;
  
  // Build embed URL with parameters
  let embedUrl = EMBED_URL;
  const params = new URLSearchParams();
  
  if (userId) {
    params.append('userId', userId);
    params.append('auth', 'wix');
  }
  
  // Add any custom parameters
  const pageContext = wixLocation.query;
  if (pageContext.projectType) {
    params.append('projectType', pageContext.projectType);
  }
  
  if (params.toString()) {
    embedUrl += '?' + params.toString();
  }
  
  // Set iframe source
  $w('#estimatorFrame').src = embedUrl;
  
  // Hide loading when iframe loads
  $w('#estimatorFrame').onMessage((event) => {
    if (event.data === 'loaded') {
      $w('#loadingSpinner').hide();
      $w('#estimatorFrame').show();
    }
  });
});

// Handle messages from estimator
export function estimatorFrame_message(event) {
  const data = event.data;
  
  switch(data.type) {
    case 'estimateSaved':
      // Save to Wix database
      saveEstimateToDatabase(data.estimate);
      break;
      
    case 'userLogin':
      // Prompt user to login
      wixUsers.promptLogin();
      break;
      
    case 'navigate':
      // Navigate to another page
      wixLocation.to(data.url);
      break;
  }
}

async function saveEstimateToDatabase(estimate) {
  try {
    const response = await fetch(`${API_URL}/estimates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estimate)
    });
    
    if (response.ok) {
      console.log('Estimate saved successfully');
    }
  } catch (error) {
    console.error('Failed to save estimate:', error);
  }
}
```

#### Step 4: Create Database (Optional)
1. Go to **"Database"** in Velo sidebar
2. Create new collection: `Estimates`
3. Add fields:
   - `estimateId` (Text)
   - `clientName` (Text)
   - `projectType` (Text)
   - `totalAmount` (Number)
   - `createdDate` (Date)
   - `userId` (Text)

#### Step 5: Backend Code (Optional)

```javascript
// Backend code (web modules)

import { fetch } from 'wix-fetch';
import { Permissions, webMethod } from 'wix-web-module';

const API_URL = 'https://api.kubexam.com';

export const getEstimate = webMethod(
  Permissions.Anyone,
  async (estimateId) => {
    const response = await fetch(`${API_URL}/estimates/${estimateId}`);
    return response.json();
  }
);

export const createEstimate = webMethod(
  Permissions.Authenticated,
  async (estimateData) => {
    const response = await fetch(`${API_URL}/estimates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estimateData)
    });
    return response.json();
  }
);
```

---

## 🎨 Styling Guidelines

### Recommended Colors:
```css
/* Primary Palette */
--primary: #3b82f6;        /* Blue */
--primary-dark: #2563eb;
--secondary: #10b981;      /* Green */
--accent: #8b5cf6;         /* Purple */

/* Backgrounds */
--bg-light: #ffffff;
--bg-dark: #1f2937;
--bg-gray: #f3f4f6;

/* Text */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-light: #ffffff;

/* Status */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
```

### Typography:
- **Headers:** Inter, Segoe UI, or system fonts
- **Body:** 16px base size
- **Line height:** 1.5

### Spacing:
- **Container padding:** 24px
- **Section gaps:** 32px
- **Card padding:** 16px
- **Border radius:** 12px (large), 8px (small)

---

## 📱 Responsive Design

### Breakpoints:
```css
/* Mobile */
@media (max-width: 640px) {
  .estimator-container {
    padding: 12px;
  }
  .estimator-iframe {
    height: 500px;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .estimator-container {
    padding: 20px;
  }
  .estimator-iframe {
    height: 600px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .estimator-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  .estimator-iframe {
    height: 700px;
  }
}
```

---

## 🔐 Security Considerations

### For Implementation:
1. **HTTPS Only** - Ensure all URLs use https://
2. **Sandbox Attributes** - Add to iframe:
   ```html
   sandbox="allow-scripts allow-same-origin allow-forms"
   ```
3. **Content Security Policy** - Set in Wix site settings
4. **Authentication** - Use Wix member authentication tokens

### Recommended Headers:
```
X-Frame-Options: ALLOW-FROM https://*.wixsite.com
Content-Security-Policy: frame-src https://estimator.kubexam.com
```

---

## 🧪 Testing Checklist

### Before Going Live:
- [ ] Estimator loads correctly
- [ ] All 3 UI modes work (Wizard, Form, Chat)
- [ ] AI suggestions appear
- [ ] Estimates can be saved
- [ ] User authentication works (if applicable)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Styling matches website
- [ ] No console errors
- [ ] Loading states work
- [ ] Error handling works

### Test Scenarios:
1. **New User Flow:**
   - Visit page → Load estimator → Create estimate → Save
   
2. **Returning User Flow:**
   - Login → Load previous estimates → Edit → Save
   
3. **AI Wizard Flow:**
   - Select project type → Enter area → Get suggestions → Add materials
   
4. **Error Scenarios:**
   - Network failure → Show error message
   - Invalid input → Show validation error
   - API down → Show fallback UI

---

## 📞 Support & Resources

### For Technical Issues:
- **API Documentation:** https://api.kubexam.com/docs
- **Health Check:** https://api.kubexam.com/health
- **Developer Support:** dev@kubexam.com

### For Wix-Specific Questions:
- **Wix Velo Docs:** https://www.wix.com/velo/reference
- **Wix Forum:** https://www.wix.com/velo/forum
- **Wix Support:** https://support.wix.com

---

## 🎯 Example Implementations

### Example 1: Simple Landing Page
```html
<!-- Wix HTML Component -->
<section class="estimator-section">
  <h2>Get Your Free Landscaping Estimate</h2>
  <p>Use our AI-powered tool to get an instant quote</p>
  
  <div class="estimator-container">
    <iframe 
      src="https://estimator.kubexam.com?mode=wizard"
      width="100%"
      height="700"
      style="border:none;border-radius:16px;"
    ></iframe>
  </div>
</section>

<style>
  .estimator-section {
    padding: 60px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .estimator-section h2 {
    color: white;
    text-align: center;
    margin-bottom: 16px;
  }
  .estimator-section p {
    color: rgba(255,255,255,0.9);
    text-align: center;
    margin-bottom: 40px;
  }
  .estimator-container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    padding: 8px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
</style>
```

### Example 2: Member-Only Estimator
```javascript
// Velo Code
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';

$w.onReady(function () {
  // Check if user is logged in
  if (!wixUsers.currentUser.loggedIn) {
    // Show login prompt
    $w('#estimatorContainer').hide();
    $w('#loginPrompt').show();
    
    $w('#loginButton').onClick(() => {
      wixUsers.promptLogin()
        .then(() => {
          wixLocation.reload();
        });
    });
  } else {
    // Show estimator for logged-in users
    $w('#loginPrompt').hide();
    $w('#estimatorContainer').show();
    
    // Load estimator with user context
    const userId = wixUsers.currentUser.id;
    $w('#estimatorFrame').src = `https://estimator.kubexam.com?userId=${userId}`;
  }
});
```

---

## ✅ Quick Start Checklist

**For Wix Talent:**

1. **Get Deployment URL** from development team
2. **Choose Implementation Method** (iFrame/Custom/Velo)
3. **Add Embed Code** to Wix page
4. **Customize Styling** to match website
5. **Test All Features** using checklist
6. **Go Live!**

**Estimated Time:**
- iFrame: 5-10 minutes
- Custom Element: 30-45 minutes
- Velo Integration: 1-2 hours

---

## 🎓 Additional Resources

### Video Tutorials:
- [Wix iFrame Embed Tutorial](https://support.wix.com)
- [Velo by Wix Introduction](https://www.wix.com/velo)
- [Custom Elements in Wix](https://www.wix.com/velo/reference)

### Documentation:
- **InsForge API Docs:** `INSFORGE_INTEGRATION.md`
- **A2UI Specification:** https://github.com/google/A2UI
- **Project Summary:** `PROJECT_SUMMARY.md`

---

**Questions?** Contact the development team or refer to the API documentation.

**Ready to implement! 🚀**