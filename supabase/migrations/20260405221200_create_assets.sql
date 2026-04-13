-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'bank_account', 'wallet', 'crypto', 'asset'
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Assets RLS Policies (Rule 21)
-- Users can see their own assets
CREATE POLICY "Users can view own assets" 
ON public.assets FOR SELECT 
USING (auth.uid() = user_id);

-- Users can manage their own assets
CREATE POLICY "Users can manage own assets" 
ON public.assets FOR ALL 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER on_assets_updated
    BEFORE UPDATE ON public.assets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Rule 1 Comment
COMMENT ON COLUMN public.assets.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
