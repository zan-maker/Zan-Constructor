import { IndustryTemplate } from '../types';

export const landscapingTemplate: IndustryTemplate = {
  id: 'landscaping',
  name: 'Landscaping Services',
  slug: 'landscaping',
  description: 'Estimate landscaping projects including lawn care, planting, hardscaping, and irrigation',
  icon: '🌿',
  inputs: [
    {
      id: 'area',
      label: 'Area Size',
      type: 'number',
      required: true,
      defaultValue: 1000,
      unit: 'sq ft',
      min: 100,
      max: 100000,
      step: 100,
    },
    {
      id: 'complexity',
      label: 'Project Complexity',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Simple (Basic lawn care)', value: 'simple' },
        { label: 'Medium (Planting + basic features)', value: 'medium' },
        { label: 'Complex (Hardscaping + irrigation)', value: 'complex' },
      ],
    },
    {
      id: 'lawnType',
      label: 'Lawn Type',
      type: 'select',
      required: false,
      defaultValue: 'standard',
      options: [
        { label: 'Standard grass', value: 'standard' },
        { label: 'Premium turf', value: 'premium' },
        { label: 'Artificial turf', value: 'artificial' },
        { label: 'No lawn', value: 'none' },
      ],
    },
    {
      id: 'planting',
      label: 'Planting Required',
      type: 'checkbox',
      required: false,
      defaultValue: false,
    },
    {
      id: 'irrigation',
      label: 'Irrigation System',
      type: 'checkbox',
      required: false,
      defaultValue: false,
    },
    {
      id: 'hardscaping',
      label: 'Hardscaping (patio, walkways)',
      type: 'checkbox',
      required: false,
      defaultValue: false,
    },
    {
      id: 'maintenance',
      label: 'Include Maintenance Plan',
      type: 'checkbox',
      required: false,
      defaultValue: false,
    },
    {
      id: 'urgency',
      label: 'Project Urgency',
      type: 'select',
      required: false,
      defaultValue: 'standard',
      options: [
        { label: 'Standard (2-4 weeks)', value: 'standard' },
        { label: 'Expedited (1-2 weeks)', value: 'expedited' },
        { label: 'Emergency (3-7 days)', value: 'emergency' },
      ],
    },
  ],
  formulas: {
    // Base labor rate per sq ft based on complexity
    baseLaborRate: `
      switch(inputs.complexity) {
        case 'simple': return 0.50;
        case 'medium': return 0.75;
        case 'complex': return 1.25;
        default: return 0.75;
      }
    `,
    
    // Material cost per sq ft based on lawn type
    materialCostRate: `
      switch(inputs.lawnType) {
        case 'standard': return 1.50;
        case 'premium': return 2.50;
        case 'artificial': return 8.00;
        case 'none': return 0;
        default: return 1.50;
      }
    `,
    
    // Additional costs for features
    plantingCost: 'inputs.planting ? inputs.area * 0.25 : 0',
    irrigationCost: 'inputs.irrigation ? inputs.area * 1.50 : 0',
    hardscapingCost: 'inputs.hardscaping ? inputs.area * 3.00 : 0',
    maintenanceCost: 'inputs.maintenance ? inputs.area * 0.10 * 12 : 0', // Annual cost
    
    // Urgency multiplier
    urgencyMultiplier: `
      switch(inputs.urgency) {
        case 'standard': return 1.0;
        case 'expedited': return 1.25;
        case 'emergency': return 1.5;
        default: return 1.0;
      }
    `,
    
    // Calculation formulas
    laborCost: 'inputs.area * baseLaborRate * urgencyMultiplier',
    materialCost: 'inputs.area * materialCostRate',
    additionalCosts: 'plantingCost + irrigationCost + hardscapingCost + maintenanceCost',
    subtotal: 'laborCost + materialCost + additionalCosts',
    markupAmount: 'subtotal * defaultMarkup',
    taxAmount: '(subtotal + markupAmount) * defaultTaxRate',
    total: 'subtotal + markupAmount + taxAmount',
  },
  defaultMarkup: 0.30, // 30% markup
  defaultTaxRate: 0.08, // 8% tax
};

// Helper function to calculate estimate
export function calculateLandscapingEstimate(inputs: Record<string, any>): any {
  const {
    area = 1000,
    complexity = 'medium',
    lawnType = 'standard',
    planting = false,
    irrigation = false,
    hardscaping = false,
    maintenance = false,
    urgency = 'standard',
  } = inputs;

  // Calculate rates
  const baseLaborRate = {
    simple: 0.50,
    medium: 0.75,
    complex: 1.25,
  }[complexity] || 0.75;

  const materialCostRate = {
    standard: 1.50,
    premium: 2.50,
    artificial: 8.00,
    none: 0,
  }[lawnType] || 1.50;

  const urgencyMultiplier = {
    standard: 1.0,
    expedited: 1.25,
    emergency: 1.5,
  }[urgency] || 1.0;

  // Calculate costs
  const laborCost = area * baseLaborRate * urgencyMultiplier;
  const materialCost = area * materialCostRate;
  const plantingCost = planting ? area * 0.25 : 0;
  const irrigationCost = irrigation ? area * 1.50 : 0;
  const hardscapingCost = hardscaping ? area * 3.00 : 0;
  const maintenanceCost = maintenance ? area * 0.10 * 12 : 0;
  
  const additionalCosts = plantingCost + irrigationCost + hardscapingCost + maintenanceCost;
  const subtotal = laborCost + materialCost + additionalCosts;
  
  const markupAmount = subtotal * 0.30;
  const taxAmount = (subtotal + markupAmount) * 0.08;
  const total = subtotal + markupAmount + taxAmount;

  // Create breakdown
  const breakdown = [
    {
      id: 'labor',
      category: 'labor' as const,
      item: 'Labor',
      description: `${complexity} complexity landscaping`,
      quantity: area,
      unit: 'sq ft',
      unitPrice: baseLaborRate * urgencyMultiplier,
      total: laborCost,
      notes: `Urgency: ${urgency} (${urgencyMultiplier}x)`,
    },
    {
      id: 'materials-lawn',
      category: 'materials' as const,
      item: 'Lawn Materials',
      description: `${lawnType} lawn type`,
      quantity: area,
      unit: 'sq ft',
      unitPrice: materialCostRate,
      total: materialCost,
    },
  ];

  if (planting) {
    breakdown.push({
      id: 'materials-planting',
      category: 'materials' as const,
      item: 'Planting',
      description: 'Plants, shrubs, trees',
      quantity: area,
      unit: 'sq ft',
      unitPrice: 0.25,
      total: plantingCost,
    });
  }

  if (irrigation) {
    breakdown.push({
      id: 'materials-irrigation',
      category: 'materials' as const,
      item: 'Irrigation System',
      description: 'Sprinklers, pipes, controller',
      quantity: area,
      unit: 'sq ft',
      unitPrice: 1.50,
      total: irrigationCost,
    });
  }

  if (hardscaping) {
    breakdown.push({
      id: 'materials-hardscaping',
      category: 'materials' as const,
      item: 'Hardscaping',
      description: 'Patio, walkways, retaining walls',
      quantity: area,
      unit: 'sq ft',
      unitPrice: 3.00,
      total: hardscapingCost,
    });
  }

  if (maintenance) {
    breakdown.push({
      id: 'service-maintenance',
      category: 'labor' as const,
      item: 'Annual Maintenance',
      description: 'Monthly lawn care and maintenance',
      quantity: 12,
      unit: 'months',
      unitPrice: area * 0.10,
      total: maintenanceCost,
    });
  }

  // Add markup and tax as separate line items
  breakdown.push(
    {
      id: 'markup',
      category: 'overhead' as const,
      item: 'Business Overhead & Profit',
      description: '30% standard markup',
      quantity: 1,
      unit: 'item',
      unitPrice: markupAmount,
      total: markupAmount,
    },
    {
      id: 'tax',
      category: 'overhead' as const,
      item: 'Sales Tax',
      description: '8% sales tax',
      quantity: 1,
      unit: 'item',
      unitPrice: taxAmount,
      total: taxAmount,
    }
  );

  return {
    subtotal,
    labor: laborCost,
    materials: materialCost + additionalCosts,
    markup: markupAmount,
    tax: taxAmount,
    total,
    breakdown,
  };
}

// Template metadata for UI display
export const landscapingTemplateMetadata = {
  averageEstimate: 2500,
  commonUses: [
    'Residential lawn installation',
    'Commercial landscaping',
    'Garden design and planting',
    'Irrigation system installation',
    'Hardscaping projects',
  ],
  typicalClients: [
    'Homeowners',
    'Property managers',
    'Real estate developers',
    'Commercial property owners',
  ],
  industryStandards: {
    markupRange: '25-35%',
    laborRates: '$50-125 per hour',
    projectTimeline: '2-6 weeks',
    warranty: '1 year standard',
  },
};