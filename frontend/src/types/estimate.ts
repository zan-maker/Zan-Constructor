// Estimate types for estimator tool

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  markup: number;
}

export interface LaborItem {
  id: string;
  name: string;
  hours: number;
  hourlyRate: number;
  crewSize: number;
}

export interface LandscapingEstimate {
  id: string;
  clientName: string;
  projectName: string;
  projectType: string;
  location: string;
  date: string;
  
  // Measurements
  areaSqFt: number;
  perimeterFt: number;
  slopePercentage: number;
  soilType: string;
  
  // Materials
  materials: MaterialItem[];
  
  // Labor
  labor: LaborItem[];
  
  // Additional costs
  equipmentRental: number;
  permitFees: number;
  wasteRemoval: number;
  contingency: number;
  
  // Markup
  markup: number;
  
  // Status
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Estimate {
  id: string;
  clientName: string;
  projectName: string;
  projectType: string;
  industry: string;
  location: string;
  date: string;
  
  // Cost breakdown
  materialsCost: number;
  laborCost: number;
  additionalCosts: number;
  subtotal: number;
  contingencyAmount: number;
  markupAmount: number;
  total: number;
  
  // Status
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}