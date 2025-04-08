
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from './useUserSettings';
import { SourceType } from '@/components/SourceCard';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceType[];
};

export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
};

export const useChatHistory = () => {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChatHistory = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Parse the messages JSON field
      const formattedData: ChatSession[] = (data || []).map(item => ({
        ...item,
        messages: Array.isArray(item.messages) 
          ? item.messages 
          : typeof item.messages === 'string' 
            ? JSON.parse(item.messages) 
            : item.messages || []
      }));

      setChatHistory(formattedData);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch chat history'));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a new chat",
        variant: "destructive",
      });
      return null;
    }

    // Check if anonymous mode is enabled
    const isAnonymous = settings?.search_preferences?.anonymousMode || false;
    
    // If anonymous mode is enabled, create a temporary chat that won't be saved
    if (isAnonymous) {
      const tempChat: ChatSession = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        title: 'Anonymous Chat',
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCurrentChat(tempChat);
      return tempChat;
    }

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([
          { user_id: user.id, title: 'New Chat', messages: [] }
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to local state with parsed messages
      const newChat: ChatSession = {
        ...data,
        messages: Array.isArray(data.messages) 
          ? data.messages 
          : typeof data.messages === 'string' 
            ? JSON.parse(data.messages) 
            : data.messages || []
      };

      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      
      toast({
        title: "New Conversation Started",
        description: "Your research session has been reset.",
      });
      
      return newChat;
    } catch (err) {
      console.error('Error creating new chat:', err);
      toast({
        title: "Failed to Create New Chat",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateChatMessages = async (chatId: string, messages: ChatMessage[]) => {
    if (!user) return;
    
    // Check if this is a temporary chat (anonymous mode)
    if (chatId.startsWith('temp-')) {
      // Just update the local state without saving to the database
      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, messages, updated_at: new Date().toISOString() } : null);
      }
      return;
    }

    try {
      // Update in database
      const { error } = await supabase
        .from('chat_history')
        .update({
          messages,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, messages, updated_at: new Date().toISOString() } : chat
        )
      );
      
      if (currentChat?.id === chatId) {
        setCurrentChat(prev => prev ? { ...prev, messages, updated_at: new Date().toISOString() } : null);
      }
    } catch (err) {
      console.error('Error updating chat messages:', err);
      toast({
        title: "Failed to Save Chat",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    // Check if this is a temporary chat (anonymous mode)
    if (chatId.startsWith('temp-')) {
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      
      toast({
        title: "Chat Deleted",
        description: "The conversation has been removed from your history.",
      });
    } catch (err) {
      console.error('Error deleting chat:', err);
      toast({
        title: "Failed to Delete Chat",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const loadChat = async (chatId: string) => {
    if (!user) return;
    
    // Check if this is a temporary chat (anonymous mode)
    if (chatId.startsWith('temp-') && currentChat?.id === chatId) {
      return currentChat;
    }

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      // Parse the messages JSON field
      const formattedChat: ChatSession = {
        ...data,
        messages: Array.isArray(data.messages) 
          ? data.messages 
          : typeof data.messages === 'string' 
            ? JSON.parse(data.messages) 
            : data.messages || []
      };

      setCurrentChat(formattedChat);
      return formattedChat;
    } catch (err) {
      console.error('Error loading chat:', err);
      toast({
        title: "Failed to Load Chat",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  const clearAllChatHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setChatHistory([]);
      setCurrentChat(null);
      
      toast({
        title: "Chat History Cleared",
        description: "All your conversations have been removed.",
      });
    } catch (err) {
      console.error('Error clearing chat history:', err);
      toast({
        title: "Failed to Clear Chat History",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const exportChatData = async () => {
    if (!user || !settings) {
      toast({
        title: "Error",
        description: "You must be logged in to export data",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch all chat history
      const { data: chatData, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id);

      if (chatError) {
        throw chatError;
      }

      // Create export data object
      const exportData = {
        user: {
          id: user.id,
          email: settings.email,
          display_name: settings.display_name
        },
        settings: {
          search_preferences: settings.search_preferences,
          privacy_settings: settings.privacy_settings
        },
        chat_history: chatData
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      toast({
        title: "Failed to Export Data",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch chat history when user changes
  useEffect(() => {
    fetchChatHistory();
  }, [user]);

  return {
    chatHistory,
    currentChat,
    isLoading,
    error,
    createNewChat,
    updateChatMessages,
    deleteChat,
    loadChat,
    clearAllChatHistory,
    exportChatData,
    refetch: fetchChatHistory,
  };
};
