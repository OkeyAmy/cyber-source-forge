export interface SourceReference {
  num: number;
  title: string;
  link: string;
  source: string;
  preview: string;
  images?: string[];
  logo?: string;
  verified?: boolean;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  sources?: SourceReference[];
}

export interface ChatSession {
  id: string;
  title?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ProcessQueryResponse {
  response: {
    content: string;
    sources: SourceType[];
  };
}

export interface SourceType {
  num: number;
  title: string;
  link: string;
  source: "Reddit" | "Twitter" | "Web" | "News" | "Academic";
  preview: string;
  images?: string[];
  logo?: string;
  verified?: boolean;
}

// Type for the chat history hook
export interface ChatHistoryHook {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  addMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  deleteMessage: (messageId: string) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  exportChatHistory: () => string;
}

// Update the hook interface to match our implementation
export interface UseChatHistoryReturn {
  chatHistory: ChatSession[];
  currentChat: ChatSession | null;
  isLoading: boolean;
  error: Error | null;
  createNewChat: () => Promise<ChatSession | null>;
  updateChatMessages: (chatId: string, messages: ChatMessage[]) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  loadChat: (chatId: string) => Promise<ChatSession | null>;
  clearAllChatHistory: () => Promise<void>;
  exportChatData: () => Promise<void>;
  refetch: () => Promise<void>;
}

// Add a simpler interface for component use
export interface SimpleChatHistoryHook {
  chatHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  exportChatHistory: () => string;
}
