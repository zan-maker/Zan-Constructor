// A2UI Integration for Landscaping Estimator
// This component uses A2UI principles to create dynamic, agent-generated UIs

import { useState, useCallback } from 'react';

// A2UI Message Types (simplified version)
interface A2UIMessage {
  id: string;
  type: 'card' | 'form' | 'button' | 'text' | 'number' | 'select';
  content?: string;
  label?: string;
  value?: any;
  options?: Array<{ label: string; value: any }>;
  actions?: Array<{ label: string; action: string; payload?: any }>;
  children?: A2UIMessage[];
}

// Mock AI agent that generates A2UI messages
class EstimatorAIAgent {
  async generateForm(context: {
    projectType?: string;
    location?: string;
    areaSqFt?: number;
  }): Promise<A2UIMessage[]> {
    const messages: A2UIMessage[] = [];

    // Dynamic form generation based on context
    if (!context.projectType) {
      messages.push({
        id: 'project-type-card',
        type: 'card',
        content: 'What type of landscaping project are you planning?',
        children: [
          {
            id: 'project-type-select',
            type: 'select',
            label: 'Project Type',
            options: [
              { label: 'Lawn Installation', value: 'lawn-installation' },
              { label: 'Garden Design', value: 'garden-design' },
              { label: 'Hardscaping', value: 'hardscaping' },
              { label: 'Irrigation System', value: 'irrigation' },
              { label: 'Tree & Shrub Planting', value: 'tree-shrub' },
            ],
          },
        ],
      });
    }

    if (context.projectType && !context.areaSqFt) {
      messages.push({
        id: 'area-card',
        type: 'card',
        content: `Great! Let's estimate your ${context.projectType} project.`,
        children: [
          {
            id: 'area-input',
            type: 'number',
            label: 'Project Area (sq ft)',
            value: context.areaSqFt || 500,
          },
        ],
      });
    }

    if (context.projectType && context.areaSqFt) {
      // Generate material suggestions based on project type
      const materials = this.getMaterialSuggestions(
        context.projectType,
        context.areaSqFt
      );

      messages.push({
        id: 'materials-card',
        type: 'card',
        content: `Based on ${context.areaSqFt} sq ft, here are recommended materials:`,
        children: materials.map((material, index) => ({
          id: `material-${index}`,
          type: 'card',
          content: `${material.name}: ${material.quantity} ${material.unit} @ $${material.price}/${material.unit}`,
          actions: [
            {
              label: 'Add to Estimate',
              action: 'add_material',
              payload: material,
            },
          ],
        })),
      });
    }

    return messages;
  }

  private getMaterialSuggestions(
    projectType: string,
    areaSqFt: number
  ): Array<{ name: string; quantity: number; unit: string; price: number }> {
    switch (projectType) {
      case 'lawn-installation':
        return [
          { name: 'Sod', quantity: areaSqFt, unit: 'sq ft', price: 2.5 },
          { name: 'Topsoil', quantity: Math.ceil(areaSqFt / 500), unit: 'cubic yards', price: 40 },
          { name: 'Fertilizer', quantity: Math.ceil(areaSqFt / 1000), unit: 'bags', price: 25 },
        ];
      case 'garden-design':
        return [
          { name: 'Plants', quantity: Math.ceil(areaSqFt / 10), unit: 'each', price: 15 },
          { name: 'Mulch', quantity: Math.ceil(areaSqFt / 100), unit: 'cubic yards', price: 35 },
          { name: 'Edging', quantity: Math.ceil(areaSqFt / 50), unit: 'feet', price: 3 },
        ];
      case 'hardscaping':
        return [
          { name: 'Pavers', quantity: areaSqFt, unit: 'sq ft', price: 8 },
          { name: 'Base Material', quantity: Math.ceil(areaSqFt / 100), unit: 'tons', price: 50 },
          { name: 'Sand', quantity: Math.ceil(areaSqFt / 200), unit: 'cubic yards', price: 30 },
        ];
      default:
        return [
          { name: 'Sod', quantity: areaSqFt, unit: 'sq ft', price: 2.5 },
        ];
    }
  }

  async chat(message: string, context: any): Promise<A2UIMessage> {
    // Simple AI responses based on message content
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return {
        id: 'pricing-response',
        type: 'card',
        content: 'Based on current market rates, here are typical pricing ranges:',
        children: [
          {
            id: 'labor-rate',
            type: 'text',
            content: '• Labor: $45-65/hour',
          },
          {
            id: 'sod-price',
            type: 'text',
            content: '• Sod: $2.50-3.50/sq ft installed',
          },
          {
            id: 'equipment-rental',
            type: 'text',
            content: '• Equipment: $150-300/day',
          },
        ],
        actions: [
          {
            label: 'Use These Rates',
            action: 'apply_pricing',
            payload: { laborRate: 50, sodPrice: 2.75 },
          },
        ],
      };
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return {
        id: 'help-response',
        type: 'card',
        content: 'I can help you with:',
        children: [
          {
            id: 'help-1',
            type: 'text',
            content: '• Calculating material quantities',
          },
          {
            id: 'help-2',
            type: 'text',
            content: '• Estimating labor hours',
          },
          {
            id: 'help-3',
            type: 'text',
            content: '• Suggesting pricing rates',
          },
          {
            id: 'help-4',
            type: 'text',
            content: '• Reviewing your estimate',
          },
        ],
      };
    }

    // Default response
    return {
      id: 'default-response',
      type: 'card',
      content: `I understand you're asking about "${message}". How can I assist with your landscaping estimate?`,
      actions: [
        {
          label: 'Get Pricing Help',
          action: 'show_pricing',
        },
        {
          label: 'Calculate Materials',
          action: 'calculate_materials',
        },
      ],
    };
  }
}

// A2UI Renderer Component
export function A2UIRenderer({
  messages,
  onAction,
  onChange,
}: {
  messages: A2UIMessage[];
  onAction: (action: string, payload?: any) => void;
  onChange: (id: string, value: any) => void;
}) {
  const renderMessage = (message: A2UIMessage): React.ReactNode => {
    switch (message.type) {
      case 'card':
        return (
          <div
            key={message.id}
            className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200"
          >
            {message.content && (
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {message.content}
              </h3>
            )}
            {message.children && (
              <div className="space-y-3">
                {message.children.map((child) => renderMessage(child))}
              </div>
            )}
            {message.actions && (
              <div className="flex gap-2 mt-4">
                {message.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => onAction(action.action, action.payload)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'form':
        return (
          <form
            key={message.id}
            className="bg-gray-50 rounded-lg p-4 mb-4"
            onSubmit={(e) => e.preventDefault()}
          >
            {message.children?.map((child) => renderMessage(child))}
          </form>
        );

      case 'text':
        return (
          <p key={message.id} className="text-gray-700">
            {message.content}
          </p>
        );

      case 'number':
        return (
          <div key={message.id} className="mb-3">
            {message.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {message.label}
              </label>
            )}
            <input
              type="number"
              value={message.value || ''}
              onChange={(e) => onChange(message.id, parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'select':
        return (
          <div key={message.id} className="mb-3">
            {message.label && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {message.label}
              </label>
            )}
            <select
              value={message.value || ''}
              onChange={(e) => onChange(message.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              {message.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'button':
        return (
          <button
            key={message.id}
            onClick={() => onAction(message.id, message.value)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {message.label || message.content}
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="a2ui-renderer space-y-4">
      {messages.map((message) => renderMessage(message))}
    </div>
  );
}

// Hook for using the AI agent
export function useA2UIAgent() {
  const [messages, setMessages] = useState<A2UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const agent = new EstimatorAIAgent();

  const generateForm = useCallback(
    async (context: {
      projectType?: string;
      location?: string;
      areaSqFt?: number;
    }) => {
      setIsLoading(true);
      try {
        const newMessages = await agent.generateForm(context);
        setMessages(newMessages);
      } finally {
        setIsLoading(false);
      }
    },
    [agent]
  );

  const chat = useCallback(
    async (message: string, context?: any) => {
      setIsLoading(true);
      try {
        const response = await agent.chat(message, context);
        setMessages((prev) => [...prev, response]);
      } finally {
        setIsLoading(false);
      }
    },
    [agent]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    generateForm,
    chat,
    clearMessages,
  };
}

export type { A2UIMessage };