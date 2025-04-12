-- Create chats table for storing user conversations
-- This table relies on Row Level Security (RLS) to ensure users can only access their own chats
CREATE TABLE IF NOT EXISTS public.chats (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    chat_id text NOT NULL,
    user_id text NOT NULL,
    title text,
    messages jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create policy for chat access
-- Users can only see and modify their own chats
CREATE POLICY "Users can only access their own chats" 
ON public.chats
FOR ALL
USING (auth.uid()::text = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS chats_user_id_idx ON public.chats (user_id);
CREATE INDEX IF NOT EXISTS chats_chat_id_idx ON public.chats (chat_id);

-- Add functions for updated_at management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at management
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 