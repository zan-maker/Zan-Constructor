/**
 * OpenRAG Service for Estimator Tool
 * 
 * This service provides AI-powered document processing and chat assistance
 * for the estimator tool using OpenRAG mock API.
 */

// Configuration
const OPENRAG_BASE_URL = (import.meta as any).env?.NEXT_PUBLIC_OPENRAG_URL || 'http://localhost:8080';

// Types
export interface DocumentProcessingResult {
  extractedData: Record<string, any>;
  confidence: number;
  suggestions: string[];
  warnings: string[];
  metadata: {
    documentType: string;
    pages: number;
    processingTime: number;
  };
}

export interface ChatResponse {
  response: string;
  sources?: Array<{
    title: string;
    url?: string;
    snippet: string;
    confidence: number;
  }>;
  suggestions?: string[];
  followUpQuestions?: string[];
}

export interface IndustryKnowledge {
  industry: string;
  pricingData: Record<string, any>;
  regulations: string[];
  bestPractices: string[];
  competitors: Array<{
    name: string;
    pricing: Record<string, any>;
    strengths: string[];
    weaknesses: string[];
  }>;
}

export interface EstimationContext {
  industry: string;
  projectType: string;
  location?: string;
  budgetRange?: string;
  timeline?: string;
  specialRequirements?: string[];
}

class OpenRAGService {
  private baseUrl: string;
  private isInitialized = false;

  constructor() {
    this.baseUrl = OPENRAG_BASE_URL;
    this.checkHealth();
  }

  private async checkHealth(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        this.isInitialized = true;
        console.log('✅ OpenRAG service initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenRAG service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Process uploaded documents (contracts, blueprints, photos, etc.)
   */
  async processDocument(
    file: File,
    industry: string,
    context?: EstimationContext
  ): Promise<DocumentProcessingResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify({
        industry,
        documentType: this.getDocumentType(file.name),
        context: context || {},
      }));

      const response = await fetch(`${this.baseUrl}/api/v1/documents/upload`, {
        method: 'POST',
        body: JSON.stringify({
          metadata: {
            industry,
            documentType: this.getDocumentType(file.name),
            context: context || {},
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        extractedData: data.extracted_data,
        confidence: data.confidence,
        suggestions: ['Review extracted measurements', 'Verify material quantities'],
        warnings: [],
        metadata: {
          documentType: data.metadata?.documentType || 'unknown',
          pages: data.metadata?.pages || 1,
          processingTime: data.metadata?.processingTime || 0,
        },
      };
    } catch (error: any) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Chat with AI assistant for estimation help
   */
  async chat(
    message: string,
    context: EstimationContext,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            ...context,
            chatHistory: history || [],
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        response: data.response,
        sources: data.sources?.map((source: any) => ({
          title: source.title || 'Unknown source',
          url: source.url,
          snippet: source.snippet || '',
          confidence: source.confidence || 0,
        })),
        suggestions: data.suggestions,
        followUpQuestions: data.followUpQuestions,
      };
    } catch (error: any) {
      console.error('Error in chat:', error);
      throw new Error(`Failed to get chat response: ${error.message}`);
    }
  }

  /**
   * Get industry-specific knowledge
   */
  async getIndustryKnowledge(industry: string): Promise<IndustryKnowledge> {
    try {
      const response = await fetch(`${this.baseUrl}/knowledge/${industry}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        industry,
        pricingData: data.pricing || {},
        regulations: data.regulations || [],
        bestPractices: data.best_practices || [],
        competitors: [],
      };
    } catch (error: any) {
      console.error('Error getting industry knowledge:', error);
      throw new Error(`Failed to get industry knowledge: ${error.message}`);
    }
  }

  /**
   * Compare estimate against market rates
   */
  async compareEstimate(
    estimate: Record<string, any>,
    industry: string,
    _location?: string
  ): Promise<{
    comparison: Record<string, any>;
    recommendations: string[];
    marketPosition: 'below' | 'average' | 'above';
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: estimate,
          industry,
          goal: 'market_comparison',
        }),
      });

      if (!response.ok) {
        throw new Error(`Comparison failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        comparison: data.comparison || {},
        recommendations: data.recommendations || [],
        marketPosition: 'average',
        confidence: data.confidence || 0.8,
      };
    } catch (error: any) {
      console.error('Error comparing estimate:', error);
      throw new Error(`Failed to compare estimate: ${error.message}`);
    }
  }

  /**
   * Check regulatory compliance
   */
  async checkCompliance(
    estimate: Record<string, any>,
    industry: string,
    _location: string
  ): Promise<{
    compliant: boolean;
    violations: Array<{
      code: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      fix: string;
    }>;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: estimate,
          industry,
          goal: 'regulatory_compliance',
        }),
      });

      if (!response.ok) {
        throw new Error(`Compliance check failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        compliant: data.isValid || true,
        violations: data.violations || [],
        recommendations: data.recommendations || [],
      };
    } catch (error: any) {
      console.error('Error checking compliance:', error);
      throw new Error(`Failed to check compliance: ${error.message}`);
    }
  }

  // Helper methods
  private getDocumentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx'].includes(ext || '')) return 'contract';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'photo';
    if (['dwg', 'dxf', 'skp'].includes(ext || '')) return 'blueprint';
    return 'document';
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getStatus(): {
    available: boolean;
    baseUrl: string;
    initialized: boolean;
  } {
    return {
      available: this.isInitialized,
      baseUrl: this.baseUrl,
      initialized: this.isInitialized,
    };
  }
}

// Create singleton instance
export const openragService = new OpenRAGService();

// Export types and service
export default openragService;