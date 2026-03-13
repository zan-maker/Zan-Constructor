// Railway-compatible server for estimator tool
// Serves both frontend static files and backend API

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7130;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data directories
const DATA_DIR = path.join(__dirname, 'data');
const ESTIMATES_DIR = path.join(DATA_DIR, 'estimates');
const DOCUMENTS_DIR = path.join(DATA_DIR, 'documents');
const USERS_DIR = path.join(DATA_DIR, 'users');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ESTIMATES_DIR, { recursive: true });
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  await fs.mkdir(USERS_DIR, { recursive: true });
}

// Simple JWT-like tokens
const tokens = new Map();

// Serve frontend static files (built by Railway)
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', mode: 'railway' });
});

// Authentication endpoints
app.post('/auth/google/login', (req, res) => {
  // Mock Google login - returns a redirect URL
  const redirectUrl = `/auth/callback?token=mock-token-${uuidv4()}`;
  res.json({ redirectUrl });
});

app.get('/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const user = tokens.get(token);
  res.json(user);
});

app.post('/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token && tokens.has(token)) {
    tokens.delete(token);
  }
  
  res.json({ success: true });
});

// Estimates endpoints
app.get('/estimates', async (req, res) => {
  try {
    const files = await fs.readdir(ESTIMATES_DIR);
    const estimates = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(ESTIMATES_DIR, file), 'utf8');
        estimates.push(JSON.parse(content));
      }
    }
    
    res.json(estimates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read estimates' });
  }
});

app.get('/estimates/:id', async (req, res) => {
  try {
    const filePath = path.join(ESTIMATES_DIR, `${req.params.id}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(404).json({ error: 'Estimate not found' });
  }
});

app.post('/estimates', async (req, res) => {
  try {
    const estimate = req.body;
    const id = uuidv4();
    estimate.id = id;
    estimate.createdAt = new Date().toISOString();
    estimate.updatedAt = new Date().toISOString();
    
    const filePath = path.join(ESTIMATES_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(estimate, null, 2));
    
    res.status(201).json(estimate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create estimate' });
  }
});

app.put('/estimates/:id', async (req, res) => {
  try {
    const estimate = req.body;
    estimate.id = req.params.id;
    estimate.updatedAt = new Date().toISOString();
    
    const filePath = path.join(ESTIMATES_DIR, `${req.params.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(estimate, null, 2));
    
    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update estimate' });
  }
});

app.delete('/estimates/:id', async (req, res) => {
  try {
    const filePath = path.join(ESTIMATES_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Estimate not found' });
  }
});

app.get('/estimates/:id/pdf', (req, res) => {
  // Mock PDF generation
  res.json({ 
    pdfUrl: `https://api.example.com/estimates/${req.params.id}/download.pdf`,
    message: 'PDF generation queued' 
  });
});

// Documents endpoints
app.post('/documents/upload', async (req, res) => {
  try {
    const { filename, content, estimateId } = req.body;
    const id = uuidv4();
    
    const document = {
      id,
      filename,
      estimateId,
      uploadedAt: new Date().toISOString(),
      size: content.length,
      mimeType: 'application/pdf'
    };
    
    const filePath = path.join(DOCUMENTS_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(document, null, 2));
    
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

app.get('/documents/:id', async (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(404).json({ error: 'Document not found' });
  }
});

// AI endpoints
app.post('/ai/suggest-pricing', (req, res) => {
  const { industry, material, quantity, location } = req.body;
  
  // Mock pricing suggestions
  const suggestions = {
    landscaping: {
      sod: { unitCost: 2.75, minOrder: 100, delivery: 75 },
      topsoil: { unitCost: 45, minOrder: 1, delivery: 100 },
      mulch: { unitCost: 35, minOrder: 2, delivery: 60 },
    },
    plumbing: {
      pipe: { unitCost: 8.5, minOrder: 10, delivery: 0 },
      fixture: { unitCost: 125, minOrder: 1, delivery: 25 },
    },
    electrical: {
      wire: { unitCost: 1.25, minOrder: 100, delivery: 0 },
      outlet: { unitCost: 4.5, minOrder: 10, delivery: 0 },
    },
  };
  
  const industryData = suggestions[industry] || suggestions.landscaping;
  const materialData = industryData[material] || { unitCost: 0, minOrder: 1, delivery: 0 };
  
  res.json({
    suggestions: [materialData],
    confidence: 0.8,
    source: 'Mock pricing database',
  });
});

app.post('/ai/extract-data', (req, res) => {
  const { documentId, documentType } = req.body;
  
  // Mock data extraction
  const extractedData = {
    areaSqFt: 1500,
    sodQuantity: 1500,
    sodUnitCost: 2.75,
    prepHours: 8,
    prepHourlyRate: 50,
    equipmentRental: 250,
    markup: 25,
    contingency: 10,
  };
  
  res.json({
    extractedData,
    confidence: 0.85,
  });
});

app.post('/ai/chat', async (req, res) => {
  const { message, estimateId, documentId } = req.body;
  
  // Mock AI chat response
  const responses = [
    "Based on your project details, I recommend using premium sod at $2.75 per sq ft for better durability.",
    "For a 1500 sq ft area, you'll need approximately 3 yards of topsoil for proper grading.",
    "Consider adding 10% contingency for unexpected site conditions.",
    "The labor rate in your area averages $45-55 per hour for landscaping work.",
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    response: randomResponse,
    suggestions: [
      { field: 'sodUnitCost', value: 2.75, confidence: 0.8 },
      { field: 'prepHourlyRate', value: 50, confidence: 0.7 },
    ],
  });
});

// Serve static files for documents
app.use('/documents', express.static(DOCUMENTS_DIR));

// Catch-all route for frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Initialize and start server
async function startServer() {
  await ensureDirectories();
  
  // Create a mock user token
  const mockToken = 'mock-token-123';
  tokens.set(mockToken, {
    id: 'user-123',
    email: 'demo@example.com',
    name: 'Demo User',
  });
  
  app.listen(PORT, () => {
    console.log(`Estimator Tool Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Mock token for testing: ${mockToken}`);
    console.log('\nEnvironment:');
    console.log(`  PORT: ${PORT}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log('\nReady for Railway deployment!');
  });
}

startServer().catch(console.error);