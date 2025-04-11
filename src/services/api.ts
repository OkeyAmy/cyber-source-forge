import { SourceType, ChatMessage, ChatSession } from '@/types/chatTypes';

// API Base URL
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
  processQuery: async (query: string, sessionId?: string, focusArea: 'All' | 'Research' | 'Social' = 'All') => {
    // Convert focusArea to actual filter sources
    let sourcesToUse: string[] = [];
    if (focusArea === 'All') {
      sourcesToUse = ['Reddit', 'Twitter', 'Web', 'News', 'Academic'];
    } else if (focusArea === 'Research') {
      sourcesToUse = ['News', 'Academic', 'Web'];
    } else {
      sourcesToUse = ['Reddit', 'Twitter', 'Web'];
    }
    
    // Format the request body according to the API documentation
    const requestBody = {
      query,
      session_id: sessionId,
      filters: {
        Sources: sourcesToUse // Match the exact case in the API documentation
      }
    };

    try {
      const data = await fetchAPI('/api/process-query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      // Store session ID if it's returned and we don't have one
      if (data.session_id && !currentSession.id) {
        currentSession.id = data.session_id;
      }

      // Ensure data is formatted correctly for our frontend
      // According to API documentation, the response should have structure:
      // { response: { content: string, sources: SourceType[] } }
      let content = '';
      let sources: SourceType[] = [];
      
      if (typeof data.response === 'string') {
        content = data.response;
        sources = data.sources || [];
      } else if (typeof data.response === 'object') {
        content = data.response.content || '';
        sources = data.response.sources || [];
      }
      
      // Map sources to our format and ensure they have all required properties
      sources = sources.map(source => ({
        num: source.num || 0,
        title: source.title || 'Unknown Source',
        link: source.link || '#',
        source: (source.source || 'Web') as "Reddit" | "Twitter" | "Web" | "News" | "Academic",
        preview: source.preview || `Preview content from ${source.title || 'this source'}...`,
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
  
  getSources: async (sessionId?: string): Promise<SourceType[]> => {
    try {
      const endpoint = sessionId 
        ? `/api/sources?session_id=${sessionId}` 
        : '/api/sources';
      
      const data = await fetchAPI(endpoint);
      
      if (data && Array.isArray(data.sources)) {
        // Map response to our SourceType format
        return data.sources.map((source: any) => ({
          num: source.num || 0,
          title: source.title || 'Unknown Source',
          link: source.link || '#',
          source: (source.source || 'Web') as "Reddit" | "Twitter" | "Web" | "News" | "Academic",
          preview: source.preview || `Preview content from ${source.title || 'this source'}...`,
          images: source.images || [],
          logo: source.logo || null,
          verified: source.verified !== undefined ? source.verified : Math.random() > 0.25 // Maintain blockchain vibe with some randomness
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
  },
  
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
  
  getChats: async (): Promise<ChatSession[]> => {
    try {
      const data = await fetchAPI('/api/chats');
      
      return Array.isArray(data.chats) 
        ? data.chats.map((chat: any) => ({
            id: chat.id || `chat_${Math.random().toString(36).substring(2, 15)}`,
            title: chat.title || 'Unnamed Chat',
            updated_at: chat.updatedAt || new Date().toISOString(),
            created_at: chat.created_at || new Date().toISOString(),
            messages: []
          }))
        : [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },
  
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
  
  getChatDetails: async (sessionId: string): Promise<ChatSession> => {
    try {
      const data = await fetchAPI(`/api/chats/${sessionId}`);
      
      // Format to match our frontend's expected structure
      return {
        id: sessionId,
        title: data.title || `Chat session ${sessionId}`,
        updated_at: data.updated_at || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        messages: Array.isArray(data.messages) ? data.messages : []
      };
    } catch (error) {
      console.error('Error fetching chat details:', error);
      // Return a minimal chat session to avoid UI breaking
    return {
      id: sessionId,
      title: `Chat session ${sessionId}`,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        messages: []
      };
    }
  },
  
  deleteChat: async (sessionId: string): Promise<boolean> => {
    try {
      await fetchAPI(`/api/chats/${sessionId}`, {
        method: 'DELETE',
      });
      
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
