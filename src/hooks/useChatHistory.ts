import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from './useUserSettings';
import { api } from '@/services/api'; 
import { ChatMessage, ChatSession, UseChatHistoryReturn } from '@/types/chatTypes';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Helper function to safely convert between JSON and ChatMessage[] types
const serializeMessages = (messages: ChatMessage[]): Json => {
  return JSON.parse(JSON.stringify(messages)) as Json;
};

// Helper function to safely convert JSON data to ChatMessage[]
const deserializeMessages = (data: Json | null): ChatMessage[] => {
  if (!data) return [];
  try {
    // Handle both array and string formats
    if (typeof data === 'string') {
      return JSON.parse(data) as ChatMessage[];
    } else if (Array.isArray(data)) {
      return data as unknown as ChatMessage[];
    }
    return [];
  } catch (e) {
    console.error('Error deserializing messages:', e);
    return [];
  }
};

export const useChatHistory = (): UseChatHistoryReturn => {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      
      // First try to get from API
      const chats = await api.getChats();
      
      // If user is authenticated, also sync with Supabase
      if (user) {
        try {
          // Get chats from Supabase for this user
          const { data: supabaseChats, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });
          
          if (error) throw error;
          
          // Combine chats from API and Supabase
          if (supabaseChats && supabaseChats.length > 0) {
            // Map Supabase data to our ChatSession format
            const mappedChats: ChatSession[] = supabaseChats.map(chat => ({
              id: chat.id,
              title: chat.title || 'Untitled Chat',
              messages: deserializeMessages(chat.messages),
              created_at: chat.created_at || new Date().toISOString(),
              updated_at: chat.updated_at || new Date().toISOString()
            }));
            
            // Combine with API chats, avoiding duplicates
            const combinedChats = [...mappedChats];
            chats.forEach(apiChat => {
              if (!combinedChats.some(chat => chat.id === apiChat.id)) {
                combinedChats.push(apiChat);
              }
            });
            
            setChatHistory(combinedChats);
          } else {
            setChatHistory(chats);
          }
        } catch (supabaseError) {
          console.error('Error fetching chats from Supabase:', supabaseError);
          // Fall back to API chats if Supabase fails
          setChatHistory(chats);
        }
      } else {
        // No user logged in, just use API chats
        setChatHistory(chats);
      }
      
      // If we have chats and no current chat is selected, get the current session
      if (chatHistory.length > 0 && !currentChat) {
        const currentSession = await api.getCurrentSession();
        if (currentSession.session_id) {
          const chatDetails = await api.getChatDetails(currentSession.session_id);
          setCurrentChat(chatDetails);
        }
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch chat history'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load chat history when component mounts or user changes
  useEffect(() => {
    fetchChatHistory();
  }, [user?.id]); // Re-fetch when user ID changes (login/logout)

  const createNewChat = async () => {
    try {
      setIsLoading(true);
      // Create a new chat via the API
      const newChat = await api.createChat(undefined, true); // force refresh
      
      // If user is authenticated, also save to Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('chat_history')
            .insert({
              id: newChat.id,
              user_id: user.id,
              title: newChat.title,
              messages: serializeMessages([]), // Empty messages array, serialized
              created_at: newChat.created_at,
              updated_at: newChat.updated_at
            });
            
          if (error) throw error;
        } catch (supabaseError) {
          console.error('Error saving chat to Supabase:', supabaseError);
          // Continue anyway since we have the API chat
        }
      }
      
      // Update local state
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatMessages = async (chatId: string, messages: ChatMessage[]) => {
    try {
      if (currentChat?.id === chatId) {
        // Update the current chat in state
        const updatedChat = { 
          ...currentChat, 
          messages,
          updated_at: new Date().toISOString()
        };
        setCurrentChat(updatedChat);
        
        // Update the chat in the history list
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === chatId ? updatedChat : chat
          )
        );
        
        // If user is authenticated, also save to Supabase
        if (user) {
          try {
            const { error } = await supabase
              .from('chat_history')
              .update({
                messages: serializeMessages(messages),
                title: updatedChat.title,
                updated_at: updatedChat.updated_at
              })
              .eq('id', chatId)
              .eq('user_id', user.id);
              
            if (error) throw error;
          } catch (supabaseError) {
            console.error('Error updating chat in Supabase:', supabaseError);
            // Continue anyway since we have the API update
          }
        }
      }
    } catch (err) {
      console.error('Error updating chat messages:', err);
      toast({
        title: "Failed to Update Chat",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const success = await api.deleteChat(chatId);

      if (success) {
        // Update local state
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
        }
        
        // If user is authenticated, also delete from Supabase
        if (user) {
          try {
            const { error } = await supabase
              .from('chat_history')
              .delete()
              .eq('id', chatId)
              .eq('user_id', user.id);
              
            if (error) throw error;
          } catch (supabaseError) {
            console.error('Error deleting chat from Supabase:', supabaseError);
            // Continue anyway since we deleted from API
          }
        }
        
        toast({
          title: "Chat Deleted",
          description: "The conversation has been removed from your history.",
        });
      }
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
    try {
      setIsLoading(true);
      
      // First try to get from API
      const chatDetails = await api.getChatDetails(chatId);
      
      // If user is authenticated, check if Supabase has a more recent version
      if (user) {
        try {
          const { data: supabaseChat, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('id', chatId)
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            // If not found in Supabase, add it
            if (error.code === 'PGRST116') {
              await supabase
                .from('chat_history')
                .insert({
                  id: chatDetails.id,
                  user_id: user.id,
                  title: chatDetails.title,
                  messages: serializeMessages(chatDetails.messages),
                  created_at: chatDetails.created_at,
                  updated_at: chatDetails.updated_at
                });
            } else {
              throw error;
            }
          } else if (supabaseChat) {
            // Use Supabase data if it exists and is more recent
            const supabaseDate = new Date(supabaseChat.updated_at || '').getTime();
            const apiDate = new Date(chatDetails.updated_at).getTime();
            
            if (supabaseDate > apiDate) {
              const mappedChat: ChatSession = {
                id: supabaseChat.id,
                title: supabaseChat.title || 'Untitled Chat',
                messages: deserializeMessages(supabaseChat.messages),
                created_at: supabaseChat.created_at || new Date().toISOString(),
                updated_at: supabaseChat.updated_at || new Date().toISOString()
              };
              
              setCurrentChat(mappedChat);
              return mappedChat;
            }
          }
        } catch (supabaseError) {
          console.error('Error checking Supabase for chat:', supabaseError);
          // Continue with API chat
        }
      }
      
      setCurrentChat(chatDetails);
      return chatDetails;
    } catch (err) {
      console.error('Error loading chat:', err);
      toast({
        title: "Failed to Load Chat",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllChatHistory = async () => {
    try {
      // We don't have a bulk delete API, so we delete chats one by one
      for (const chat of chatHistory) {
        await api.deleteChat(chat.id);
      }

      // If user is authenticated, also clear from Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('user_id', user.id);
            
          if (error) throw error;
        } catch (supabaseError) {
          console.error('Error clearing chats from Supabase:', supabaseError);
        }
      }

      // Clear local state
      setChatHistory([]);
      setCurrentChat(null);
      
      toast({
        title: "Chat History Cleared",
        description: "All conversations have been removed.",
      });
    } catch (err) {
      console.error('Error clearing chat history:', err);
      toast({
        title: "Failed to Clear History",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const exportChatData = async () => {
    if (!currentChat) {
      toast({
        title: "No Chat to Export",
        description: "Start a conversation first before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Format chat data
      const exportData = {
        title: currentChat.title,
        date: new Date().toLocaleDateString(),
        messages: currentChat.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          sources: msg.sources || []
        }))
      };

      // Create and download a file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Chat Exported",
        description: "Your conversation has been downloaded as a JSON file.",
      });
    } catch (err) {
      console.error('Error exporting chat:', err);
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const refetch = async () => {
    await fetchChatHistory();
  };

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
    refetch,
  };
};
