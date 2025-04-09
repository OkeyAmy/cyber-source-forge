
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type SearchPreferences = {
  focusArea: 'Research' | 'Social' | 'All';
  anonymousMode: boolean;
};

export type PrivacySettings = {
  saveHistory: boolean;
  dataCollection: boolean;
};

export type UserSettings = {
  id: string;
  display_name: string;
  email: string;
  search_preferences: SearchPreferences;
  privacy_settings: PrivacySettings;
  created_at: string;
  updated_at: string;
};

// Default settings to use when settings are null
const defaultSettings: Partial<UserSettings> = {
  display_name: 'Researcher',
  email: '',
  search_preferences: {
    focusArea: 'Research',
    anonymousMode: false,
  },
  privacy_settings: {
    saveHistory: true,
    dataCollection: true,
  }
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    if (!user) {
      setIsLoading(false);
      // Initialize with default settings even when user is not logged in
      setSettings(defaultSettings as UserSettings);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      // Parse JSON fields and initialize with defaults if needed
      const searchPrefs = typeof data.search_preferences === 'string' 
        ? JSON.parse(data.search_preferences) 
        : data.search_preferences || {};
        
      const privacyPrefs = typeof data.privacy_settings === 'string' 
        ? JSON.parse(data.privacy_settings) 
        : data.privacy_settings || {};

      // Initialize with default values if search_preferences doesn't match new structure
      const updatedData = {
        ...data,
        search_preferences: {
          focusArea: searchPrefs.focusArea || 'Research',
          anonymousMode: searchPrefs.anonymousMode !== undefined ? searchPrefs.anonymousMode : false
        },
        privacy_settings: {
          saveHistory: privacyPrefs.saveHistory !== undefined ? privacyPrefs.saveHistory : true,
          dataCollection: privacyPrefs.dataCollection !== undefined ? privacyPrefs.dataCollection : true
        }
      };

      setSettings(updatedData);
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user settings'));
      // Use default settings when fetch fails
      setSettings(defaultSettings as UserSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update settings",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local state with new settings
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully."
      });
    } catch (err) {
      console.error('Error updating user settings:', err);
      toast({
        title: "Failed to Save Settings",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Fetch settings when user changes
  useEffect(() => {
    fetchSettings();
  }, [user]);

  // Get settings with defaults for null values
  const getSettingsWithDefaults = () => {
    if (!settings) {
      return defaultSettings as UserSettings;
    }
    
    return {
      ...settings,
      search_preferences: {
        ...defaultSettings.search_preferences,
        ...settings.search_preferences
      },
      privacy_settings: {
        ...defaultSettings.privacy_settings,
        ...settings.privacy_settings
      }
    };
  };

  return {
    settings: getSettingsWithDefaults(),
    isLoading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};
