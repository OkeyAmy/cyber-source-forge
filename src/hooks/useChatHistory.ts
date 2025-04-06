
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: { url: string; title: string; verified?: boolean }[];
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

      setChatHistory(data || []);
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

      // Add to local state
      setChatHistory(prev => [data, ...prev]);
      setCurrentChat(data);
      
      toast({
        title: "New Conversation Started",
        description: "Your research session has been reset.",
      });
      
      return data;
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

      setCurrentChat(data);
      return data;
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
    refetch: fetchChatHistory,
  };
};
