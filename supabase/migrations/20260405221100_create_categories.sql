-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'income', 'expense'
    icon TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null for global categories
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories RLS Policies
-- Users can see global categories OR their own categories
CREATE POLICY "Users can view categories" 
ON public.categories FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories" 
ON public.categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER on_categories_updated
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Rule 1 Comment
COMMENT ON COLUMN public.categories.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
