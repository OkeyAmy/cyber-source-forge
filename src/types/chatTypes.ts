
export interface SourceReference {
  url: string;
  title: string;
  verified?: boolean;
  source?: string;
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
  createdAt: string;
  updatedAt: string;
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
