-- Create rules table for Task 12.5
CREATE TABLE IF NOT EXISTS public.rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- Rules RLS Policies
CREATE POLICY "Users can view own rules" 
ON public.rules FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own rules" 
ON public.rules FOR ALL 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER on_rules_updated
    BEFORE UPDATE ON public.rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Rule 1 Comment
COMMENT ON COLUMN public.rules.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
