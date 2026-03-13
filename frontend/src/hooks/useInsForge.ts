import { useState, useEffect, useCallback } from 'react';
import { 
  estimatesApi, 
  documentsApi, 
  aiApi, 
  authApi, 
  isAuthenticated, 
  initializeApi 
} from '../api/insforge';
import type { Estimate } from '../types/estimate';

export function useInsForge() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    if (isConnected && isAuthenticated()) {
      fetchCurrentUser();
    }
  }, [isConnected]);

  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const connected = await initializeApi();
      setIsConnected(connected);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to InsForge backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.warn('Failed to fetch user:', err);
      setUser(null);
    }
  }, []);

  // Authentication
  const loginWithGoogle = useCallback(async () => {
    try {
      const { redirectUrl } = await authApi.loginWithGoogle();
      window.location.href = redirectUrl;
    } catch (err) {
      setError('Failed to initiate Google login');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError('Failed to logout');
      throw err;
    }
  }, []);

  // Estimates
  const saveEstimate = useCallback(async (estimate: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const savedEstimate = await estimatesApi.create(estimate);
      return savedEstimate;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save estimate';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const loadEstimates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const estimates = await estimatesApi.getAll();
      return estimates;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load estimates';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const updateEstimate = useCallback(async (id: string, estimate: Partial<Estimate>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const updatedEstimate = await estimatesApi.update(id, estimate);
      return updatedEstimate;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update estimate';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const deleteEstimate = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      await estimatesApi.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete estimate';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const generatePdf = useCallback(async (estimateId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const { pdfUrl } = await estimatesApi.generatePdf(estimateId);
      return pdfUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Documents
  const uploadDocument = useCallback(async (file: File, estimateId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const result = await documentsApi.upload(file, estimateId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // AI Features
  const getPricingSuggestions = useCallback(async (projectType: string, location: string, areaSqFt: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const suggestions = await aiApi.suggestPricing(projectType, location, areaSqFt);
      return suggestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get pricing suggestions';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const extractDataFromDocument = useCallback(async (documentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const extractedData = await aiApi.extractDataFromDocument(documentId);
      return extractedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract data from document';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const chatWithAssistant = useCallback(async (message: string, context?: { estimateId?: string; documentId?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Not connected to InsForge backend');
      }

      const response = await aiApi.chat(message, context);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to chat with assistant';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  return {
    // State
    isConnected,
    isLoading,
    error,
    user,
    isAuthenticated: isAuthenticated(),

    // Connection
    checkConnection,

    // Authentication
    loginWithGoogle,
    logout,

    // Estimates
    saveEstimate,
    loadEstimates,
    updateEstimate,
    deleteEstimate,
    generatePdf,

    // Documents
    uploadDocument,

    // AI Features
    getPricingSuggestions,
    extractDataFromDocument,
    chatWithAssistant,

    // Error handling
    clearError: () => setError(null),
  };
}