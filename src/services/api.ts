
import { SourceType } from '@/components/SourceCard';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceType[];
};

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

// Use the real API endpoint
const API_BASE_URL = 'https://source-finder-hoic.onrender.com';

// Helper function for API calls with improved error handling
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

export const api = {
  processQuery: async (query: string, focusArea: 'All' | 'Research' | 'Social' = 'All', sessionId?: string) => {
    // Map focus area to relevant sources
    let sources: string[] = [];
    if (focusArea === 'All') {
      sources = ['Reddit', 'Twitter', 'Web', 'News', 'Academic'];
    } else if (focusArea === 'Research') {
      sources = ['News', 'Academic', 'Web'];
    } else { // Social
      sources = ['Reddit', 'Twitter', 'Web'];
    }
    
    // API call to process query
    const requestBody = {
      query,
      session_id: sessionId,
      filters: {
        Sources: sources
      }
    };

    try {
      const data = await fetchApi('/api/process-query', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      return {
        content: data.response.content,
        sources: data.response.sources
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  },
  
  getSources: async (sessionId?: string) => {
    let endpoint = '/api/sources';
    if (sessionId) {
      endpoint += `?session_id=${sessionId}`;
    }
    
    try {
      const data = await fetchApi(endpoint);
      return data.sources;
    } catch (error) {
      console.error('Error getting sources:', error);
      throw error;
    }
  },
  
  getChats: async (): Promise<ChatSession[]> => {
    try {
      const data = await fetchApi('/api/chats');
      return data.chats.map((chat: any) => ({
        id: chat.id || chat.session_id,
        title: chat.title,
        updatedAt: chat.updatedAt || chat.updated_at,
        messages: [] // Initialize with empty messages array
      }));
    } catch (error) {
      console.error('Error getting chats:', error);
      throw error;
    }
  },
  
  createChat: async (query: string, refresh: boolean = false): Promise<ChatSession> => {
    let endpoint = '/api/chats';
    if (refresh) {
      endpoint += '?refresh=true';
    }
    
    const requestBody = {
      query
    };
    
    try {
      const data = await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      return {
        id: data.session_id,
        title: data.title || 'New Chat',
        updatedAt: data.updated_at || new Date().toISOString(),
        messages: query ? [{ role: 'user', content: query }] : []
      };
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },
  
  getChatDetails: async (sessionId: string): Promise<ChatSession> => {
    try {
      const data = await fetchApi(`/api/chats/${sessionId}`);
      
      return {
        id: sessionId,
        title: data.title || 'Chat',
        updatedAt: data.updated_at || new Date().toISOString(),
        messages: data.messages || []
      };
    } catch (error) {
      console.error('Error getting chat details:', error);
      throw error;
    }
  },
  
  getCurrentSession: async (): Promise<{ session_id: string | null; title?: string; updated_at?: string }> => {
    try {
      const data = await fetchApi('/api/current-session');
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
  
  deleteChat: async (sessionId: string): Promise<boolean> => {
    try {
      await fetchApi(`/api/chats/${sessionId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }
};
