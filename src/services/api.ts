
import { SourceType } from '@/components/SourceCard';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceType[];
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages?: ChatMessage[];
};

// This is a mock implementation that simulates API calls
// In production, this would be replaced with actual fetch calls

const API_BASE_URL = 'https://source-finder-hoic.onrender.com';

// Simulate a delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random sources
const generateRandomSources = (count: number, types?: string[]): SourceType[] => {
  const sourceTypes = types || ['Reddit', 'Twitter', 'Web', 'News', 'Academic'];
  const sources: SourceType[] = [];
  
  for (let i = 0; i < count; i++) {
    const sourceType = sourceTypes[Math.floor(Math.random() * sourceTypes.length)] as "Reddit" | "Twitter" | "Web" | "News" | "Academic";
    sources.push({
      num: i + 1,
      title: `Source ${i + 1}: ${sourceType} information about the topic`,
      link: `https://example.com/${sourceType.toLowerCase()}/article-${i + 1}`,
      source: sourceType,
      preview: `This is a preview of the content from this ${sourceType} source. It provides valuable information related to the query that was asked. The content is relevant and has been analyzed by our AI systems.`,
      images: Math.random() > 0.5 ? [`https://picsum.photos/seed/${i}/300/200`] : undefined,
      verified: Math.random() > 0.25
    });
  }
  
  return sources;
};

// Mock session ID generation
const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substring(2, 15);
};

// Store current session in memory
let currentSession: { id: string | null } = { id: null };

export const api = {
  processQuery: async (query: string, focusArea: 'All' | 'Research' | 'Social' = 'All') => {
    await delay(1500);
    
    let sourcesToUse: string[] = [];
    if (focusArea === 'All') {
      sourcesToUse = ['Reddit', 'Twitter', 'Web', 'News', 'Academic'];
    } else if (focusArea === 'Research') {
      sourcesToUse = ['News', 'Academic', 'Web'];
    } else {
      sourcesToUse = ['Reddit', 'Twitter', 'Web'];
    }
    
    const sources = generateRandomSources(Math.floor(Math.random() * 3) + 2, sourcesToUse);
    
    return {
      content: `Here's a response about "${query}" based on the ${focusArea} focus area. I've found ${sources.length} relevant sources to support this information.`,
      sources
    };
  },
  
  getSources: async (sessionId?: string) => {
    await delay(1000);
    return generateRandomSources(Math.floor(Math.random() * 8) + 5);
  },
  
  getChats: async (): Promise<ChatSession[]> => {
    await delay(1000);
    return Array(5).fill(0).map((_, i) => ({
      id: `chat_${i}`,
      title: `Query about topic ${i + 1}`,
      updatedAt: new Date(Date.now() - i * 86400000).toISOString()
    }));
  },
  
  createChat: async (query: string): Promise<ChatSession> => {
    await delay(1000);
    const sessionId = generateSessionId();
    currentSession.id = sessionId;
    
    // Derive title from query (limited characters)
    let title = query;
    if (title.length > 30) {
      title = title.substring(0, 27) + '...';
    }
    
    return {
      id: sessionId,
      title,
      updatedAt: new Date().toISOString(),
      messages: [
        { role: 'user', content: query }
      ]
    };
  },
  
  getChatDetails: async (sessionId: string): Promise<ChatSession> => {
    await delay(1000);
    // Generate some random messages
    const messageCount = Math.floor(Math.random() * 6) + 2;
    const messages: ChatMessage[] = [];
    
    for (let i = 0; i < messageCount; i++) {
      if (i % 2 === 0) {
        messages.push({
          role: 'user',
          content: `This is user message ${i/2 + 1}`
        });
      } else {
        const sources = Math.random() > 0.3 ? generateRandomSources(Math.floor(Math.random() * 3) + 1) : undefined;
        messages.push({
          role: 'assistant',
          content: `This is assistant response ${Math.floor(i/2) + 1}`,
          sources
        });
      }
    }
    
    return {
      id: sessionId,
      title: `Chat session ${sessionId}`,
      updatedAt: new Date().toISOString(),
      messages
    };
  },
  
  getCurrentSession: async (): Promise<{ session_id: string | null, title?: string, updated_at?: string }> => {
    await delay(500);
    if (!currentSession.id) {
      return { session_id: null };
    }
    
    return {
      session_id: currentSession.id,
      title: `Current active session`,
      updated_at: new Date().toISOString()
    };
  },
  
  deleteChat: async (sessionId: string): Promise<boolean> => {
    await delay(800);
    if (currentSession.id === sessionId) {
      currentSession.id = null;
    }
    return true;
  }
};
