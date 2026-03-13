// Core estimate types
export interface EstimateInput {
  industry: string;
  template: string;
  inputs: Record<string, any>;
  clientInfo?: ClientInfo;
}

export interface EstimateOutput {
  id: string;
  subtotal: number;
  labor: number;
  materials: number;
  markup: number;
  tax: number;
  total: number;
  breakdown: EstimateBreakdownItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EstimateBreakdownItem {
  id: string;
  category: 'labor' | 'materials' | 'equipment' | 'overhead';
  item: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface ClientInfo {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

// Industry templates
export interface IndustryTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  inputs: TemplateInput[];
  formulas: Record<string, string>;
  defaultMarkup: number;
  defaultTaxRate: number;
}

export interface TemplateInput {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

// User and subscription types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  subscription?: Subscription;
  usage: UsageStats;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'starter' | 'professional' | 'business';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageStats {
  estimatesThisMonth: number;
  estimatesLimit: number;
  industriesAvailable: string[];
  exportFormats: string[];
}

// Export types
export type ExportFormat = 'pdf' | 'excel' | 'word' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeBreakdown: boolean;
  includeTerms: boolean;
  includeSignature: boolean;
  branding?: {
    logoUrl?: string;
    companyName?: string;
    contactInfo?: string;
  };
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Webhook types
export interface StripeWebhook {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface BrevoWebhook {
  event: string;
  email: string;
  id: number;
  date: string;
  'message-id': string;
  tag?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

export interface ConversionFunnel {
  landingPage: number;
  estimateCreated: number;
  estimateSaved: number;
  estimateExported: number;
  accountCreated: number;
  subscriptionStarted: number;
}