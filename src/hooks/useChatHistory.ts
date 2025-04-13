import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from './useUserSettings';
import { api } from '@/services/api'; 
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatSession, UseChatHistoryReturn } from '@/types/chatTypes';

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
      // Get chat sessions from the API
      const chats = await api.getChats();
      
      // If user is logged in, sync with Supabase
      if (user) {
        // Store chat data in Supabase for persistence
        await syncWithSupabase(chats);
      }
      
      setChatHistory(chats);
      
      // If we have chats and no current chat is selected, get the current session
      if (chats.length > 0 && !currentChat) {
        const currentSession = await api.getCurrentSession();
        if (currentSession.session_id) {
          try {
            const chatDetails = await api.getChatDetails(currentSession.session_id);
            setCurrentChat(chatDetails);
          } catch (err) {
            console.error("Error loading current chat details:", err);
            // If current chat can't be loaded, set the most recent chat as current
            if (chats.length > 0) {
              // Sort chats by updated_at date
              const sortedChats = [...chats].sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
              setCurrentChat(sortedChats[0]);
            }
          }
        } else if (chats.length > 0) {
          // If no current session, set the most recent chat as current
          const sortedChats = [...chats].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
          setCurrentChat(sortedChats[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch chat history'));
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sync chat data with Supabase
  const syncWithSupabase = async (chats: ChatSession[]) => {
    if (!user) return;
    
    try {
      // For each chat, store or update in Supabase
      for (const chat of chats) {
        // Check if chat exists in Supabase
        const { data: existingChat } = await supabase
          .from('chats')
          .select('*')
          .eq('chat_id', chat.id)
          .eq('user_id', user.id)
          .single();
        
        if (existingChat) {
          // Update existing chat
          await supabase
            .from('chats')
            .update({
              title: chat.title,
              messages: chat.messages,
              updated_at: new Date().toISOString()
            })
            .eq('chat_id', chat.id)
            .eq('user_id', user.id);
        } else {
          // Insert new chat
          await supabase
            .from('chats')
            .insert({
              chat_id: chat.id,
              user_id: user.id,
              title: chat.title,
              messages: chat.messages,
              created_at: chat.created_at,
              updated_at: chat.updated_at
            });
        }
      }
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  };
  
  // Function to load chats from Supabase
  const loadChatsFromSupabase = async () => {
    if (!user) return;
    
    try {
      const { data: supabaseChats, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (supabaseChats && supabaseChats.length > 0) {
        // Convert Supabase chats to ChatSession format
        const formattedChats: ChatSession[] = supabaseChats.map(chat => ({
          id: chat.chat_id,
          title: chat.title,
          messages: chat.messages || [],
          created_at: chat.created_at,
          updated_at: chat.updated_at
        }));
        
        setChatHistory(formattedChats);
        
        // Set current chat if not already set
        if (!currentChat && formattedChats.length > 0) {
          setCurrentChat(formattedChats[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chats from Supabase:', error);
    }
  };

  // Load chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
    
    // Also try to load from Supabase in case user is returning
    if (user) {
      loadChatsFromSupabase();
    }
  }, [user]);

  const createNewChat = async () => {
    try {
      setIsLoading(true);
      // Create a new chat via the API
      const newChat = await api.createChat(undefined, true); // force refresh
      
      // Update local state
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      
      // Sync with Supabase if user is logged in
      if (user) {
        await syncWithSupabase([newChat]);
      }
      
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
      
      // Create a local fallback chat if API fails
      const fallbackChat: ChatSession = {
        id: `local_${Date.now()}`,
        title: "New Chat",
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setChatHistory(prev => [fallbackChat, ...prev]);
      setCurrentChat(fallbackChat);
      
      return fallbackChat;
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
        
        // Set the title based on the first user message if title is "New Chat"
        if (updatedChat.title === "New Chat" && messages.length > 0) {
          const firstUserMessage = messages.find(m => m.role === 'user');
          if (firstUserMessage) {
            // Truncate long messages for the title
            const title = firstUserMessage.content.length > 50 
              ? firstUserMessage.content.slice(0, 50) + "..." 
              : firstUserMessage.content;
            
            updatedChat.title = title;
          }
        }
        
        // Update the chat in the history list
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === chatId ? updatedChat : chat
          )
        );
        
        // Sync with Supabase if user is logged in
        if (user) {
          await syncWithSupabase([updatedChat]);
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
      // First, try to delete via API
      let success = false;
      try {
        success = await api.deleteChat(chatId);
      } catch (apiError) {
        console.error('API Error deleting chat:', apiError);
        // Continue with local deletion even if API fails
        success = true;
      }

      if (success) {
        // Update local state
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        if (currentChat?.id === chatId) {
          // If we deleted the current chat, set a new current chat
          const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
          if (remainingChats.length > 0) {
            setCurrentChat(remainingChats[0]);
          } else {
            setCurrentChat(null);
          }
        }
          
        // Delete from Supabase if user is logged in
        if (user) {
          await supabase
            .from('chats')
            .delete()
            .eq('chat_id', chatId)
            .eq('user_id', user.id);
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
      // Attempt to load chat details from API
      let chatDetails: ChatSession;
      
      try {
        chatDetails = await api.getChatDetails(chatId);
      } catch (apiError) {
        console.error('Error loading chat from API:', apiError);
        
        // Fallback to local state if API fails
        const localChat = chatHistory.find(chat => chat.id === chatId);
        if (!localChat) {
          throw new Error(`Chat with ID ${chatId} not found`);
        }
        
        chatDetails = localChat;
      }
      
      setCurrentChat(chatDetails);
      
      // Sync with Supabase if user is logged in
      if (user) {
        await syncWithSupabase([chatDetails]);
      }
      
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

      // Clear local state
      setChatHistory([]);
      setCurrentChat(null);
      
      // Delete all chats from Supabase if user is logged in
      if (user) {
        await supabase
          .from('chats')
          .delete()
          .eq('user_id', user.id);
      }
      
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
