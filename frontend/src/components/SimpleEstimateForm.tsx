import { useState, useEffect } from 'react';
import OpenRAGAssistant from './OpenRAGAssistant';
import { useInsForge } from '../hooks/useInsForge';
import type { Estimate } from '../types/estimate';

interface SimpleEstimateFormProps {
  onEstimateUpdate?: (estimate: any) => void;
}

const SimpleEstimateForm: React.FC<SimpleEstimateFormProps> = ({ onEstimateUpdate }) => {
  // Form state
  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    projectType: 'lawn-installation',
    location: '',
    
    // Measurements
    areaSqFt: 500,
    soilType: 'loam',
    
    // Materials
    sodQuantity: 500,
    sodUnitCost: 0.45,
    mulchQuantity: 5,
    mulchUnitCost: 35,
    plantsQuantity: 10,
    plantsUnitCost: 15,
    
    // Labor
    prepHours: 8,
    prepHourlyRate: 30,
    plantingHours: 12,
    plantingHourlyRate: 30,
    
    // Additional costs
    equipmentRental: 200,
    permitFees: 100,
    wasteRemoval: 150,
    
    // Markup & contingency
    markup: 0.25,
    contingency: 0.10,
  });

  // Calculated totals
  const [totals, setTotals] = useState({
    materialsCost: 0,
    laborCost: 0,
    additionalCosts: 0,
    subtotal: 0,
    contingencyAmount: 0,
    markupAmount: 0,
    total: 0,
  });

  // Calculate totals on form change
  useEffect(() => {
    const calculateTotals = () => {
      // Materials
      const sodCost = formData.sodQuantity * formData.sodUnitCost;
      const mulchCost = formData.mulchQuantity * formData.mulchUnitCost;
      const plantsCost = formData.plantsQuantity * formData.plantsUnitCost;
      const materialsCost = sodCost + mulchCost + plantsCost;
      
      // Labor
      const prepCost = formData.prepHours * formData.prepHourlyRate;
      const plantingCost = formData.plantingHours * formData.plantingHourlyRate;
      const laborCost = prepCost + plantingCost;
      
      // Additional costs
      const additionalCosts = formData.equipmentRental + formData.permitFees + formData.wasteRemoval;
      
      // Subtotal
      const subtotal = materialsCost + laborCost + additionalCosts;
      
      // Contingency
      const contingencyAmount = subtotal * formData.contingency;
      
      // Markup
      const markupAmount = (subtotal + contingencyAmount) * formData.markup;
      
      // Total
      const total = subtotal + contingencyAmount + markupAmount;
      
      setTotals({
        materialsCost,
        laborCost,
        additionalCosts,
        subtotal,
        contingencyAmount,
        markupAmount,
        total,
      });
      
      // Notify parent
      if (onEstimateUpdate) {
        onEstimateUpdate({
          ...formData,
          ...totals,
          total,
        });
      }
    };
    
    calculateTotals();
  }, [formData, onEstimateUpdate]);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle AI suggestion
  const handleAiSuggestion = (suggestion: string) => {
    console.log('AI Suggestion:', suggestion);
    
    // Parse pricing suggestions
    if (suggestion.includes('sod') && suggestion.includes('sq ft')) {
      const match = suggestion.match(/\$(\d+\.?\d*)/);
      if (match) {
        const price = parseFloat(match[1]);
        handleInputChange('sodUnitCost', price);
      }
    }
  };

  // Handle document processed data
  const handleDocumentProcessed = (data: any) => {
    console.log('Document processed:', data);
    
    // Auto-fill form with extracted data
    if (data.area_sq_ft) {
      handleInputChange('areaSqFt', data.area_sq_ft);
      handleInputChange('sodQuantity', data.area_sq_ft);
    }
    
    if (data.materials) {
      data.materials.forEach((material: any) => {
        if (material.name.toLowerCase().includes('sod')) {
          handleInputChange('sodQuantity', material.quantity);
        }
        if (material.name.toLowerCase().includes('mulch')) {
          handleInputChange('mulchQuantity', material.quantity);
        }
        if (material.name.toLowerCase().includes('plant')) {
          handleInputChange('plantsQuantity', material.quantity);
        }
      });
    }
  };

  // InsForge integration
  const insforge = useInsForge();

  // Save estimate
  const handleSave = async () => {
    try {
      const estimateData: Omit<Estimate, 'id' | 'createdAt' | 'updatedAt'> = {
        clientName: formData.clientName,
        projectName: formData.projectName,
        projectType: formData.projectType,
        location: formData.location,
        areaSqFt: formData.areaSqFt,
        sodQuantity: formData.sodQuantity,
        sodUnitCost: formData.sodUnitCost,
        prepHours: formData.prepHours,
        prepHourlyRate: formData.prepHourlyRate,
        equipmentRental: formData.equipmentRental,
        markup: formData.markup,
        contingency: formData.contingency,
        materialsTotal: totals.materialsCost,
        laborTotal: totals.laborCost,
        subtotal: totals.subtotal,
        finalTotal: totals.total,
      };

      if (insforge.isConnected && insforge.isAuthenticated) {
        // Save to InsForge backend
        const savedEstimate = await insforge.saveEstimate(estimateData);
        console.log('Saved to InsForge:', savedEstimate);
        alert(`Estimate saved to cloud!\nTotal: $${totals.total.toFixed(2)}\nID: ${savedEstimate.id}`);
      } else {
        // Fallback to localStorage
        const localData = {
          ...estimateData,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
        };
        localStorage.setItem(`estimate_${localData.id}`, JSON.stringify(localData));
        console.log('Saved locally:', localData);
        alert(`Estimate saved locally!\nTotal: $${totals.total.toFixed(2)}\nSign in to save to cloud.`);
      }
    } catch (error) {
      console.error('Failed to save estimate:', error);
      alert('Failed to save estimate. Please try again.');
    }
  };

  // Reset form
  const handleReset = () => {
    if (confirm('Reset form? All data will be lost.')) {
      setFormData({
        clientName: '',
        projectName: '',
        projectType: 'lawn-installation',
        location: '',
        areaSqFt: 500,
        soilType: 'loam',
        sodQuantity: 500,
        sodUnitCost: 0.45,
        mulchQuantity: 5,
        mulchUnitCost: 35,
        plantsQuantity: 10,
        plantsUnitCost: 15,
        prepHours: 8,
        prepHourlyRate: 30,
        plantingHours: 12,
        plantingHourlyRate: 30,
        equipmentRental: 200,
        permitFees: 100,
        wasteRemoval: 150,
        markup: 0.25,
        contingency: 0.10,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Landscaping Estimate Calculator</h1>
          <p className="text-gray-600 mt-2">
            Create professional estimates with AI assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Estimate Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Backyard Lawn Installation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="lawn-installation">Lawn Installation</option>
                    <option value="garden-design">Garden Design</option>
                    <option value="irrigation-system">Irrigation System</option>
                    <option value="hardscaping">Hardscaping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Measurements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area (sq ft)
                  </label>
                  <input
                    type="number"
                    value={formData.areaSqFt}
                    onChange={(e) => handleInputChange('areaSqFt', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will auto-update sod quantity
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soil Type
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => handleInputChange('soilType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="loam">Loam (Best)</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Materials</h2>
              <div className="space-y-4">
                {/* Sod */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sod (sq ft)
                    </label>
                    <input
                      type="number"
                      value={formData.sodQuantity}
                      onChange={(e) => handleInputChange('sodQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        value={formData.sodUnitCost}
                        onChange={(e) => handleInputChange('sodUnitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right w-full">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold">
                        ${(formData.sodQuantity * formData.sodUnitCost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mulch */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mulch (cubic yards)
                    </label>
                    <input
                      type="number"
                      value={formData.mulchQuantity}
                      onChange={(e) => handleInputChange('mulchQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        value={formData.mulchUnitCost}
                        onChange={(e) => handleInputChange('mulchUnitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right w-full">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold">
                        ${(formData.mulchQuantity * formData.mulchUnitCost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plants */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plants (each)
                    </label>
                    <input
                      type="number"
                      value={formData.plantsQuantity}
                      onChange={(e) => handleInputChange('plantsQuantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        value={formData.plantsUnitCost}
                        onChange={(e) => handleInputChange('plantsUnitCost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right w-full">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold">
                        ${(formData.plantsQuantity * formData.plantsUnitCost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Labor */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Labor</h2>
              <div className="space-y-4">
                {/* Site Preparation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Prep (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.prepHours}
                      onChange={(e) => handleInputChange('prepHours', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        value={formData.prepHourlyRate}
                        onChange={(e) => handleInputChange('prepHourlyRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right w-full">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold">
                        ${(formData.prepHours * formData.prepHourlyRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Planting */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Planting (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.plantingHours}
                      onChange={(e) => handleInputChange('plantingHours', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate
                    </label>
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        value={formData.plantingHourlyRate}
                        onChange={(e) => handleInputChange('plantingHourlyRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right w-full">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold">
                        ${(formData.plantingHours * formData.plantingHourlyRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Costs */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Costs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Rental
                  </label>
                  <div className="flex items-center">
                    <span className="mr-1">$</span>
                    <input
                      type="number"
                      value={formData.equipmentRental}
                      onChange={(e) => handleInputChange('equipmentRental', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permit Fees
                  </label>
                  <div className="flex items-center">
                    <span className="mr-1">$</span>
                    <input
                      type="number"
                      value={formData.permitFees}
                      onChange={(e) => handleInputChange('permitFees', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste Removal
                  </label>
                  <div className="flex items-center">
                    <span className="mr-1">$</span>
                    <input
                      type="number"
                      value={formData.wasteRemoval}
                      onChange={(e) => handleInputChange('wasteRemoval', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Markup & Contingency */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Markup ({Math.round(formData.markup * 100)}%)
                  </label>
                  <input
                    type="range"
                    value={formData.markup * 100}
                    onChange={(e) => handleInputChange('markup', parseFloat(e.target.value) / 100)}
                    className="w-full"
                    min="0"
                    max="50"
                    step="5"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contingency ({Math.round(formData.contingency * 100)}%)
                  </label>
                  <input
                    type="range"
                    value={formData.contingency * 100}
                    onChange={(e) => handleInputChange('contingency', parseFloat(e.target.value) / 100)}
                    className="w-full"
                    min="0"
                    max="30"
                    step="5"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>10%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {/* Authentication Status */}
            {insforge.isConnected && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                {insforge.user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {insforge.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{insforge.user.name}</p>
                        <p className="text-sm text-gray-600">{insforge.user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={insforge.logout}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-700 mb-3">Sign in to save estimates to the cloud</p>
                    <button
                      onClick={insforge.loginWithGoogle}
                      className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={insforge.isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {insforge.isLoading ? 'Saving...' : 'Save Estimate'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right Column: AI Assistant & Summary */}
          <div className="space-y-6">
            {/* OpenRAG Assistant */}
            <OpenRAGAssistant
              industry="landscaping"
              projectType={formData.projectType}
              onSuggestion={handleAiSuggestion}
              onDocumentProcessed={handleDocumentProcessed}
            />

            {/* Estimate Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estimate Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Materials</span>
                  <span className="font-medium">${totals.materialsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Labor</span>
                  <span className="font-medium">${totals.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Costs</span>
                  <span className="font-medium">${totals.additionalCosts.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Contingency ({Math.round(formData.contingency * 100)}%)
                  </span>
                  <span className="font-medium">${totals.contingencyAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Markup ({Math.round(formData.markup * 100)}%)
                  </span>
                  <span className="font-medium">${totals.markupAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price per sq ft */}
              {formData.areaSqFt > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Per sq ft</span>
                    <span className="text-lg font-semibold text-green-600">
                      ${(totals.total / formData.areaSqFt).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEstimateForm;