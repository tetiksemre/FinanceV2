-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create transaction_tags junction table
CREATE TABLE IF NOT EXISTS public.transaction_tags (
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;

-- Tags RLS Policies
CREATE POLICY "Users can manage own tags" 
ON public.tags FOR ALL 
USING (auth.uid() = user_id);

-- Transaction Tags RLS Policies (Users can manage tags for their OWN transactions)
CREATE POLICY "Users can manage own transaction tags" 
ON public.transaction_tags FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.transactions 
        WHERE id = transaction_id 
        AND user_id = auth.uid()
    )
);

-- Rule 1 Comment
COMMENT ON COLUMN public.tags.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
