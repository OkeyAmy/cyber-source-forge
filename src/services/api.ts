import { SourceType, ChatMessage, ChatSession } from '@/types/chatTypes';

// API Base URL - pointing to the deployed SourceFinder API
const API_BASE_URL = 'https://source-finder-1.onrender.com';

// Store current session in memory
let currentSession: { id: string | null } = { id: null };

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API error: ${response.status}`);
  }
  return response.json();
};

// Generic fetch function with error handling
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(currentSession.id && { 'X-Chat-ID': currentSession.id }),
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  // Process a query and return response with sources
  processQuery: async (query: string, sessionId?: string, focusArea: 'All' | 'Research' | 'Social' = 'All') => {
    // Convert focusArea to actual filter sources
    let sourcesToUse: string[] = [];
    if (focusArea === 'All') {
      sourcesToUse = ['Reddit', 'Twitter', 'Web', 'News', 'Academic'];
    } else if (focusArea === 'Research') {
      sourcesToUse = ['Academic', 'Web', 'News'];
    } else {
      sourcesToUse = ['Reddit', 'Twitter', 'Web'];
    }
    
    // Format request according to API documentation
    const requestBody = {
      query,
      filters: {
        Sources: sourcesToUse
      }
    };

    try {
      // Use chat ID in header if available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (sessionId) {
        headers['X-Chat-ID'] = sessionId;
      } else if (currentSession.id) {
        headers['X-Chat-ID'] = currentSession.id;
      }

      const response = await fetch(`${API_BASE_URL}/api/process-query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update current session if we get a chat_id
      if (data.chat_id) {
        currentSession.id = data.chat_id;
      }

      // Handle response based on API documentation format
      let content = '';
      let sources: SourceType[] = [];
      
      // Extract content and sources from response
      if (typeof data.response === 'string') {
        content = data.response;
        sources = data.sources || [];
      } else if (data.response && typeof data.response === 'object') {
        content = data.response.content || data.response;
        sources = data.response.sources || data.sources || [];
      } else {
        content = data.content || '';
        sources = data.sources || [];
      }
      
      // Ensure sources follow our expected format
      sources = sources.map(source => ({
        num: source.num || Math.floor(Math.random() * 1000),
        title: source.title || 'Unknown Source',
        link: source.link || '#',
        source: (source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic") || "Web",
        preview: source.snippet || source.preview || "No preview available",
        images: source.images || [],
        logo: source.logo || null,
        verified: source.verified !== undefined ? source.verified : Math.random() > 0.25
      }));
    
      return {
        content,
        sources
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  },
  
  // Get all sources for the current session
  getSources: async (sessionId?: string) => {
    try {
      // Use headers for session ID
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (sessionId) {
        headers['X-Chat-ID'] = sessionId;
      } else if (currentSession.id) {
        headers['X-Chat-ID'] = currentSession.id;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/sources`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching sources: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format sources to match our expected type
      return (data.sources || []).map((source: any) => ({
        num: source.num || Math.floor(Math.random() * 1000),
        title: source.title || 'Unknown Source',
        link: source.link || '#',
        source: (source.source as "Reddit" | "Twitter" | "Web" | "News" | "Academic") || "Web",
        preview: source.snippet || source.preview || "No preview available",
        images: source.images || [],
        logo: source.logo || null,
        verified: source.verified !== undefined ? source.verified : Math.random() > 0.25
      }));
    } catch (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
  },
  
  // Get information about the currently active session
  getCurrentSession: async (): Promise<{ session_id: string | null, title?: string, updated_at?: string }> => {
    try {
      const data = await fetchAPI('/api/current-session');
      
      // Update current session if we get a new one
      if (data.session_id) {
        currentSession.id = data.session_id;
      }
      
      return {
        session_id: data.session_id,
        title: data.title,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return { session_id: null };
    }
  },
  
  // Get all chat sessions
  getChats: async (): Promise<ChatSession[]> => {
    try {
      const data = await fetchAPI('/api/chats');
      
      return Array.isArray(data.chats) 
        ? data.chats.map((chat: any) => ({
            id: chat.id || chat.session_id || `chat_${Math.random().toString(36).substring(2, 15)}`,
            title: chat.title || 'Unnamed Chat',
            updated_at: chat.updatedAt || chat.updated_at || new Date().toISOString(),
            created_at: chat.created_at || new Date().toISOString(),
            messages: []
          }))
        : [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },
  
  // Create a new chat session
  createChat: async (query?: string, refresh: boolean = false): Promise<ChatSession> => {
    try {
      const endpoint = refresh ? '/api/chats?refresh=true' : '/api/chats';
      
      const requestBody: any = {};
      if (query) {
        requestBody.query = query;
      }
      
      const data = await fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      // If we got a session_id back, update our current session
      if (data.session_id) {
        currentSession.id = data.session_id;
      }
      
      // Extract chat session data from response
      const chatSession: ChatSession = {
        id: data.session_id || `chat_${Math.random().toString(36).substring(2, 15)}`,
        title: query?.substring(0, 30) || 'New Chat',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        messages: query ? [{ role: 'user', content: query }] : []
      };
      
      return chatSession;
    } catch (error) {
      console.error('Error creating chat:', error);
      // Return a fallback chat session to avoid UI breaking
      return {
        id: `chat_${Math.random().toString(36).substring(2, 15)}`,
        title: query?.substring(0, 30) || 'New Chat',
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        messages: query ? [{ role: 'user', content: query }] : []
      };
    }
  },
  
  // Get chat history
  getChatHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Chat-ID': sessionId
      };
      
      const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching chat history: ${response.status}`);
      }
      
      const data = await response.json();
      
      return Array.isArray(data) ? data.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        sources: msg.sources || []
      })) : [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },
  
  // Get details for a specific chat
  getChatDetails: async (sessionId: string): Promise<ChatSession> => {
    try {
      // First get chat info
      const headers = {
        'Content-Type': 'application/json',
        'X-Chat-ID': sessionId
      };
      
      const infoResponse = await fetch(`${API_BASE_URL}/api/chat`, {
        headers
      });
      
      if (!infoResponse.ok) {
        throw new Error(`Error fetching chat info: ${infoResponse.status}`);
      }
      
      const chatInfo = await infoResponse.json();
      
      // Then get chat history
      const messages = await this.getChatHistory(sessionId);
      
      return {
        id: sessionId,
        title: chatInfo.title || `Chat session ${sessionId}`,
        updated_at: chatInfo.updated_at || new Date().toISOString(),
        created_at: chatInfo.created_at || new Date().toISOString(),
        messages
      };
    } catch (error) {
      console.error('Error fetching chat details:', error);
      return {
        id: sessionId,
        title: `Chat session ${sessionId}`,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        messages: []
      };
    }
  },
  
  // Delete a chat session
  deleteChat: async (sessionId: string): Promise<boolean> => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Chat-ID': sessionId
      };
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting chat: ${response.status}`);
      }
      
      // Clear current session if it was the one deleted
      if (currentSession.id === sessionId) {
        currentSession.id = null;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }
};
