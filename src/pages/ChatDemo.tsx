
import React, { useState, useCallback } from 'react';
import { ChatMessage, SourceType } from '@/types/chatTypes';
import EnhancedChatInterface from '@/components/EnhancedChatInterface';
import { api } from '@/services/api';
import { GeminiService } from '@/services/gemini';
import { toast } from 'sonner';

// You'll need to set this API key - add an input field or use environment
const GEMINI_API_KEY = ''; // User will provide this

function ChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [allSources, setAllSources] = useState<SourceType[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState(GEMINI_API_KEY);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!GEMINI_API_KEY);

  const handleSendMessage = useCallback(async (userMessage: string) => {
    if (!geminiApiKey) {
      toast.error('Please enter your Gemini API key first');
      setShowApiKeyInput(true);
      return;
    }

    try {
      // Add user message immediately
      const userMsg: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      setLoadingMessage('Processing your query...');
      setLoadingPhase(0);

      // Phase 1: Get sources from SourceFinder API
      setLoadingMessage('Gathering sources...');
      setLoadingPhase(1);
      
      const sourceResponse = await api.processQuery(userMessage);
      
      // Phase 2: Generate AI response using Gemini
      setLoadingMessage('Generating AI response...');
      setLoadingPhase(2);
      
      const gemini = new GeminiService(geminiApiKey);
      
      // Create context from sources for Gemini
      const sourceContext = sourceResponse.sources
        .map(source => `[${source.num}] ${source.title}: ${source.preview}`)
        .join('\n\n');
      
      const contextualPrompt = `
Based on the following sources, please provide a comprehensive answer to the user's question: "${userMessage}"

Sources:
${sourceContext}

Please reference the sources using numbers like [1], [2], etc. when relevant in your response.
      `;
      
      const aiResponse = await gemini.generateContent(
        contextualPrompt,
        messages.map(msg => ({ role: msg.role, content: msg.content }))
      );
      
      // Create AI response message
      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        sources: sourceResponse.sources
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Update all sources
      setAllSources(prev => {
        const newSources = sourceResponse.sources.filter(
          newSource => !prev.some(existing => existing.link === newSource.link)
        );
        return [...prev, ...newSources];
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process message');
      
      // Add error message
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setLoadingPhase(0);
    }
  }, [geminiApiKey, messages]);

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-white mb-4">Enter Gemini API Key</h2>
          <p className="text-gray-300 text-sm mb-4">
            Please enter your Google Gemini API key to use the AI chat functionality.
          </p>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Enter your Gemini API key..."
            className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-md mb-4"
          />
          <button
            onClick={() => {
              if (geminiApiKey.trim()) {
                setShowApiKeyInput(false);
                toast.success('API key set successfully!');
              } else {
                toast.error('Please enter a valid API key');
              }
            }}
            className="w-full bg-cyber-green hover:bg-cyber-green/80 text-black font-medium py-2 px-4 rounded-md"
          >
            Continue
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Get your API key from{' '}
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyber-green hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedChatInterface
      messages={messages}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      loadingPhase={loadingPhase}
      onSendMessage={handleSendMessage}
      allSources={allSources}
    />
  );
}

export default ChatDemo;
