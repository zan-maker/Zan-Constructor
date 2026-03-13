// Simple build script for Railway
// This creates a minimal build without Vite

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');

// Create dist directory
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a simple HTML file
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landscaping Estimator Tool</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
    }
    .message {
      padding: 20px;
      background: #e8f4fd;
      border-left: 4px solid #3498db;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .message h3 {
      margin-top: 0;
      color: #2980b9;
    }
    .steps {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .steps h3 {
      margin-top: 0;
      color: #27ae60;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
    }
    .steps li {
      margin-bottom: 10px;
    }
    .code {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚧 Landscaping Estimator Tool - Build in Progress</h1>
    
    <div class="message">
      <h3>⚠️ Temporary Build</h3>
      <p>The full React application is currently being built. This is a temporary static page for Railway deployment.</p>
      <p>The complete estimator tool with AI-powered features will be available soon.</p>
    </div>
    
    <div class="steps">
      <h3>📋 Next Steps:</h3>
      <ol>
        <li>Complete npm package installation</li>
        <li>Build React frontend with Vite</li>
        <li>Deploy to Railway with custom domain</li>
        <li>Enable AI-powered estimate generation</li>
      </ol>
      
      <p><strong>API Status:</strong> <span style="color: #27ae60;">✅ Backend is running</span></p>
      <p><strong>Health Check:</strong> <a href="/health">/health</a></p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p><strong>For development:</strong></p>
      <div class="code">
        # Install dependencies<br>
        npm install<br><br>
        # Start development server<br>
        npm run dev
      </div>
    </div>
  </div>
  
  <script>
    // Simple JavaScript for the temporary page
    console.log('Estimator Tool - Temporary Build');
    
    // Check backend health
    fetch('/health')
      .then(response => response.json())
      .then(data => {
        console.log('Backend health:', data);
      })
      .catch(error => {
        console.log('Backend health check failed:', error);
      });
  </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Copy any existing assets
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const copyDir = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir(publicDir, distDir);
}

console.log('✅ Simple build completed!');
console.log(`📁 Output directory: ${distDir}`);
console.log(`📄 Created: ${path.join(distDir, 'index.html')}`);
console.log('\n🚀 Ready for Railway deployment!');