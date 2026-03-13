import { useState, useCallback, useEffect } from 'react';
import { A2UIRenderer, useA2UIAgent } from './A2UIIntegration';
import SimpleEstimateForm from './SimpleEstimateForm';

// AI-powered estimator with A2UI integration
export default function A2UIEstimator() {
  const [mode, setMode] = useState<'wizard' | 'form' | 'chat'>('wizard');
  const [formData, setFormData] = useState({
    projectType: '',
    areaSqFt: 0,
    location: '',
  });
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([
    {
      role: 'assistant',
      content: 'Hi! I\'m your landscaping estimate assistant. How can I help you today?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const { messages, isLoading, generateForm, chat } =
    useA2UIAgent();

  // Initialize form generation when wizard mode is selected
  useEffect(() => {
    if (mode === 'wizard' && messages.length === 0) {
      generateForm(formData);
    }
  }, [mode, messages.length, formData, generateForm]);

  // Handle A2UI actions
  const handleAction = useCallback(
    (action: string, payload?: any) => {
      console.log('A2UI Action:', action, payload);

      switch (action) {
        case 'add_material':
          console.log('Adding material:', payload);
          break;
        case 'apply_pricing':
          console.log('Applying pricing:', payload);
          break;
        case 'show_pricing':
          chat('What are typical pricing rates?');
          break;
        case 'calculate_materials':
          generateForm(formData);
          break;
        default:
          console.log('Unknown action:', action);
      }
    },
    [chat, generateForm, formData]
  );

  // Handle A2UI form changes
  const handleChange = useCallback(
    (id: string, value: any) => {
      console.log('A2UI Change:', id, value);

      if (id === 'project-type-select') {
        setFormData((prev) => ({ ...prev, projectType: value }));
        generateForm({ ...formData, projectType: value });
      } else if (id === 'area-input') {
        setFormData((prev) => ({ ...prev, areaSqFt: value }));
        generateForm({ ...formData, areaSqFt: value });
      }
    },
    [formData, generateForm]
  );

  // Handle chat submission
  const handleChatSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      setChatMessages((prev) => [
        ...prev,
        { role: 'user', content: chatInput },
      ]);

      await chat(chatInput);

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I've analyzed your request. Here are my suggestions.",
        },
      ]);

      setChatInput('');
    },
    [chatInput, chat, formData]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Landscaping Estimator
              </h1>
              <p className="text-gray-600">Powered by A2UI + InsForge</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('wizard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'wizard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🤖 AI Wizard
              </button>
              <button
                onClick={() => setMode('form')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📝 Standard Form
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  mode === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {mode === 'wizard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                {isLoading && (
                  <span className="text-sm text-blue-600 animate-pulse">Thinking...</span>
                )}
              </div>
              {messages.length > 0 ? (
                <A2UIRenderer
                  messages={messages}
                  onAction={handleAction}
                  onChange={handleChange}
                />
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600">Loading AI assistant...</p>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estimate Preview</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Type:</span>
                    <span className="font-medium">{formData.projectType || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">
                      {formData.areaSqFt > 0 ? `${formData.areaSqFt} sq ft` : 'Not specified'}
                    </span>
                  </div>
                  <button
                    onClick={() => setMode('form')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue to Full Form →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {mode === 'form' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Detailed Estimate Form</h2>
              <button onClick={() => setMode('wizard')} className="text-blue-600 hover:text-blue-800">
                ← Back to AI Wizard
              </button>
            </div>
            <SimpleEstimateForm />
          </div>
        )}
        {mode === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="border-t p-4 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about pricing, materials, or labor..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}