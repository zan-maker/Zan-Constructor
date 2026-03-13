// Landscaping estimate calculation logic

export const calculateLandscapingEstimate = (estimate: any) => {
  // Calculate materials cost
  const materialsCost = estimate.materials.reduce((total: number, material: any) => {
    const cost = material.quantity * material.unitCost;
    const markedUpCost = cost * (1 + material.markup);
    return total + markedUpCost;
  }, 0);

  // Calculate labor cost
  const laborCost = estimate.labor.reduce((total: number, laborItem: any) => {
    const cost = laborItem.hours * laborItem.hourlyRate * laborItem.crewSize;
    return total + cost;
  }, 0);

  // Additional costs
  const additionalCosts = 
    (estimate.equipmentRental || 0) + 
    (estimate.permitFees || 0) + 
    (estimate.wasteRemoval || 0);

  // Subtotal
  const subtotal = materialsCost + laborCost + additionalCosts;

  // Contingency
  const contingency = estimate.contingency || 0;
  const contingencyAmount = subtotal * contingency;

  // Markup
  const markup = estimate.markup || 0;
  const markupAmount = (subtotal + contingencyAmount) * markup;

  // Total
  const total = subtotal + contingencyAmount + markupAmount;

  return {
    id: estimate.id,
    clientName: estimate.clientName,
    projectName: estimate.projectName,
    projectType: estimate.projectType,
    industry: 'landscaping',
    location: estimate.location,
    date: estimate.date,
    
    materialsCost,
    laborCost,
    additionalCosts,
    subtotal,
    contingencyAmount,
    markupAmount,
    total,
    
    status: estimate.status || 'draft',
    version: estimate.version || 1,
    createdAt: estimate.createdAt,
    updatedAt: estimate.updatedAt,
  };
};