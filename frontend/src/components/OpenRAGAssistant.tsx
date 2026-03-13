import { useState, useRef, useEffect } from 'react';
import { openragService, type EstimationContext } from '../services/openrag';

interface OpenRAGAssistantProps {
  industry: string;
  projectType: string;
  onSuggestion?: (suggestion: string) => void;
  onDocumentProcessed?: (data: any) => void;
}

const OpenRAGAssistant: React.FC<OpenRAGAssistantProps> = ({
  industry,
  projectType,
  onSuggestion,
  onDocumentProcessed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serviceStatus, setServiceStatus] = useState<{
    available: boolean;
    baseUrl: string;
    initialized: boolean;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check service status on mount
  useEffect(() => {
    const status = openragService.getStatus();
    setServiceStatus(status);
    
    // Add welcome message if service is available
    if (status.available && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI estimation assistant for ${industry} ${projectType} projects. I can help with pricing, regulations, and document analysis. How can I assist you today?`,
        },
      ]);
    }
  }, [industry, projectType]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      const context: EstimationContext = {
        industry,
        projectType,
        location: 'United States', // Default, could be made configurable
      };

      const response = await openragService.chat(userMessage, context, messages);
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.response },
      ]);

      // If there are suggestions, notify parent component
      if (response.suggestions && response.suggestions.length > 0 && onSuggestion) {
        onSuggestion(response.suggestions[0]);
      }
    } catch (error) {
      console.error('Error getting chat response:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or check if the OpenRAG service is running.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const context: EstimationContext = {
        industry,
        projectType,
      };

      const result = await openragService.processDocument(file, industry, context);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add message about processed document
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I've processed your ${file.name}. I found ${Object.keys(result.extractedData).length} data points with ${result.confidence}% confidence. Here are my suggestions: ${result.suggestions.join(', ')}`,
        },
      ]);

      // Notify parent component
      if (onDocumentProcessed) {
        onDocumentProcessed(result.extractedData);
      }

      // If there are warnings, show them
      if (result.warnings.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Warnings: ${result.warnings.join(', ')}`,
          },
        ]);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      clearInterval(progressInterval);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Failed to process ${file.name}. Please make sure it's a supported format (PDF, image, etc.).`,
        },
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadProgress(0), 1000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    `What's the average cost for ${projectType} in ${industry}?`,
    `What regulations apply to ${industry} projects?`,
    `How can I optimize my ${projectType} estimate?`,
    `What materials are best for ${industry} projects?`,
  ];

  if (!serviceStatus?.available) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800">AI Assistant Unavailable</h3>
        </div>
        <p className="text-yellow-700 mt-2">
          The OpenRAG AI service is not currently available. Please start the OpenRAG server to enable AI-powered assistance.
        </p>
        <div className="mt-3 text-sm text-yellow-600">
          <p>Server URL: {serviceStatus?.baseUrl || 'Not configured'}</p>
          <p>Status: {serviceStatus?.initialized ? 'Initialized' : 'Not initialized'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Estimation Assistant</h3>
            <p className="text-sm text-gray-600">Powered by OpenRAG • {industry} • {projectType}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4">
          {/* Quick Questions */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="mb-4 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${message.role === 'user' ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
              </div>
            ))}
            {isProcessing && uploadProgress === 0 && (
              <div className="text-center text-gray-500">
                <div className="inline-flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dwg,.dxf"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Document (PDF, Image, Blueprint)
            </button>
            
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about pricing, regulations, or upload a document..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Send'
              )}
            </button>
          </div>

          {/* Status */}
          <div className="mt-3 text-xs text-gray-500 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${serviceStatus?.available ? 'bg-green-500' : 'bg-red-500'}`} />
            {serviceStatus?.available ? 'AI Assistant Online' : 'AI Assistant Offline'}
            <span className="mx-2">•</span>
            <span>OpenRAG: {serviceStatus?.baseUrl}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenRAGAssistant;