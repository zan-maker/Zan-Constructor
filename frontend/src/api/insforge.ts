// InsForge API Integration for Landscaping Estimator
import type { Estimate } from '../types/estimate';

const INSFORGE_API = import.meta.env.VITE_INSFORGE_URL || 'http://localhost:7130';
const API_KEY = import.meta.env.VITE_INSFORGE_API_KEY;

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('insforge_token');
}

// Set auth token
export function setAuthToken(token: string): void {
  localStorage.setItem('insforge_token', token);
}

// Remove auth token (logout)
export function clearAuthToken(): void {
  localStorage.removeItem('insforge_token');
}

// Generic API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(API_KEY && { 'X-API-Key': API_KEY }),
    ...options.headers,
  };

  const response = await fetch(`${INSFORGE_API}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

// Estimates API
export const estimatesApi = {
  // Get all estimates for current user
  async getAll(): Promise<Estimate[]> {
    return apiRequest<Estimate[]>('/estimates');
  },

  // Get single estimate
  async getById(id: string): Promise<Estimate> {
    return apiRequest<Estimate>(`/estimates/${id}`);
  },

  // Create new estimate
  async create(estimate: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Estimate> {
    return apiRequest<Estimate>('/estimates', {
      method: 'POST',
      body: JSON.stringify(estimate),
    });
  },

  // Update estimate
  async update(id: string, estimate: Partial<Estimate>): Promise<Estimate> {
    return apiRequest<Estimate>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(estimate),
    });
  },

  // Delete estimate
  async delete(id: string): Promise<void> {
    await apiRequest(`/estimates/${id}`, {
      method: 'DELETE',
    });
  },

  // Generate PDF for estimate
  async generatePdf(id: string): Promise<{ pdfUrl: string }> {
    return apiRequest<{ pdfUrl: string }>(`/estimates/${id}/pdf`, {
      method: 'POST',
    });
  },
};

// Documents API
export const documentsApi = {
  // Upload document
  async upload(file: File, estimateId: string): Promise<{ documentId: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('estimateId', estimateId);

    const token = getAuthToken();
    const headers: HeadersInit = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(`${INSFORGE_API}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload Error (${response.status}): ${error}`);
    }

    return response.json();
  },

  // Get document info
  async getById(documentId: string): Promise<{ id: string; filename: string; fileUrl: string; uploadedAt: string }> {
    return apiRequest(`/documents/${documentId}`);
  },

  // Delete document
  async delete(documentId: string): Promise<void> {
    await apiRequest(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};

// AI Processing API
export const aiApi = {
  // Get pricing suggestions from AI
  async suggestPricing(projectType: string, location: string, areaSqFt: number): Promise<{
    materialPrices: Array<{ name: string; unit: string; price: number }>;
    laborRates: Array<{ task: string; hourlyRate: number }>;
    equipmentRates: Array<{ name: string; dailyRate: number }>;
  }> {
    return apiRequest('/ai/suggest-pricing', {
      method: 'POST',
      body: JSON.stringify({ projectType, location, areaSqFt }),
    });
  },

  // Extract data from uploaded document
  async extractDataFromDocument(documentId: string): Promise<{
    extractedData: Record<string, any>;
    confidence: number;
  }> {
    return apiRequest('/ai/extract-data', {
      method: 'POST',
      body: JSON.stringify({ documentId }),
    });
  },

  // Chat with estimator assistant
  async chat(message: string, context?: { estimateId?: string; documentId?: string }): Promise<{
    response: string;
    suggestions?: Array<{ field: string; value: any; confidence: number }>;
  }> {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, ...context }),
    });
  },
};

// Authentication API
export const authApi = {
  // Login with Google
  async loginWithGoogle(): Promise<{ redirectUrl: string }> {
    return apiRequest('/auth/google/login');
  },

  // Get current user
  async getCurrentUser(): Promise<{ id: string; email: string; name: string }> {
    return apiRequest('/auth/me');
  },

  // Logout
  async logout(): Promise<void> {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
    clearAuthToken();
  },
};

// Utility function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Initialize API - check if InsForge is available
export async function initializeApi(): Promise<boolean> {
  try {
    const response = await fetch(`${INSFORGE_API}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('InsForge API not available:', error);
    return false;
  }
}