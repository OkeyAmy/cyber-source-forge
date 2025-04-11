// This file manages the Supabase client configuration.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These values can be used in both development and production
// They're public keys that are safe to expose in client-side code
const SUPABASE_URL = "https://dfjeyuttyjzypuqiwoqy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmamV5dXR0eWp6eXB1cWl3b3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4ODgzMDUsImV4cCI6MjA1OTQ2NDMwNX0.EKXXs55jo_iss0_bSQlwxzz9BAJ1Akx_UJhXeGPXmzQ";

// Optional: Allow for environment-specific configuration
// Check if we have environment variables defined
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;

// Create and initialize the Supabase client - simplified config to avoid TypeScript errors
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Helper function to check if Supabase is connected
export const checkSupabaseConnection = async () => {
  try {
    // Simple ping to verify connection works
    const { data, error } = await supabase.from('chat_history').select('count').limit(1);
    if (error) throw error;
    return { connected: true, message: 'Connected to Supabase' };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { connected: false, message: error instanceof Error ? error.message : 'Failed to connect to Supabase' };
  }
};