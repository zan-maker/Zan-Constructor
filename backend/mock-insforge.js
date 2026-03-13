// Mock InsForge Backend API
// This provides the same API as InsForge for local development
// Can be swapped out for real InsForge when deployed

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 7130;

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', mode: 'mock' });
});

// Authentication endpoints
app.post('/auth/google/login', (req, res) => {
  // Mock Google login - returns a redirect URL
  const redirectUrl = `http://localhost:5173/auth/callback?token=mock-token-${uuidv4()}`;
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
  
  if (token) {
    tokens.delete(token);
  }
  
  res.json({ status: 'ok' });
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
    res.status(500).json({ error: error.message });
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
    const now = new Date().toISOString();
    
    const estimateWithMeta = {
      ...estimate,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    const filePath = path.join(ESTIMATES_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(estimateWithMeta, null, 2));
    
    res.status(201).json(estimateWithMeta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/estimates/:id', async (req, res) => {
  try {
    const filePath = path.join(ESTIMATES_DIR, `${req.params.id}.json`);
    const existingContent = await fs.readFile(filePath, 'utf8');
    const existing = JSON.parse(existingContent);
    
    const updated = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: 'Estimate not found' });
  }
});

app.delete('/estimates/:id', async (req, res) => {
  try {
    const filePath = path.join(ESTIMATES_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ status: 'deleted' });
  } catch (error) {
    res.status(404).json({ error: 'Estimate not found' });
  }
});

app.post('/estimates/:id/pdf', async (req, res) => {
  // Mock PDF generation
  const pdfUrl = `http://localhost:${PORT}/documents/estimate-${req.params.id}.pdf`;
  res.json({ pdfUrl });
});

// Documents endpoints
app.post('/documents/upload', async (req, res) => {
  // Mock file upload - in a real implementation, you'd handle multipart/form-data
  const { filename = 'document.pdf', estimateId } = req.body;
  const documentId = uuidv4();
  const fileUrl = `http://localhost:${PORT}/documents/${documentId}/${filename}`;
  
  const document = {
    id: documentId,
    filename,
    fileUrl,
    estimateId,
    uploadedAt: new Date().toISOString(),
  };
  
  const filePath = path.join(DOCUMENTS_DIR, `${documentId}.json`);
  await fs.writeFile(filePath, JSON.stringify(document, null, 2));
  
  res.json(document);
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

app.delete('/documents/:id', async (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ status: 'deleted' });
  } catch (error) {
    res.status(404).json({ error: 'Document not found' });
  }
});

// AI endpoints
app.post('/ai/suggest-pricing', async (req, res) => {
  const { projectType, location, areaSqFt } = req.body;
  
  // Mock AI suggestions based on project type
  const suggestions = {
    materialPrices: [
      { name: 'Sod', unit: 'sq ft', price: 2.5 },
      { name: 'Mulch', unit: 'cubic yard', price: 35 },
      { name: 'Plants', unit: 'each', price: 15 },
      { name: 'Soil', unit: 'cubic yard', price: 40 },
    ],
    laborRates: [
      { task: 'Site Preparation', hourlyRate: 45 },
      { task: 'Installation', hourlyRate: 50 },
      { task: 'Cleanup', hourlyRate: 40 },
    ],
    equipmentRates: [
      { name: 'Skid Steer', dailyRate: 250 },
      { name: 'Dump Truck', dailyRate: 300 },
      { name: 'Trencher', dailyRate: 150 },
    ],
  };
  
  res.json(suggestions);
});

app.post('/ai/extract-data', async (req, res) => {
  const { documentId } = req.body;
  
  // Mock data extraction
  const extractedData = {
    areaSqFt: 1500,
    sodQuantity: 1500,
    projectType: 'residential',
    location: 'Suburban',
    notes: 'Backyard renovation with sod installation',
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
    console.log(`Mock InsForge API running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Mock token for testing: ${mockToken}`);
    console.log('Endpoints available:');
    console.log('  GET  /health');
    console.log('  GET  /estimates');
    console.log('  POST /estimates');
    console.log('  POST /ai/suggest-pricing');
    console.log('  POST /ai/chat');
    console.log('\nTo use with frontend, set:');
    console.log('VITE_INSFORGE_URL=http://localhost:7130');
  });
}

startServer().catch(console.error);