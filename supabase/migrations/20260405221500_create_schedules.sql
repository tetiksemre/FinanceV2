-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rotation_type TEXT NOT NULL, -- e.g., 'weekly', 'monthly'
    responsible_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Schedules RLS Policies (Rule 21)
-- Users can see schedules they are responsible for
CREATE POLICY "Users can view own schedules" 
ON public.schedules FOR SELECT 
USING (auth.uid() = responsible_user_id);

-- Trigger for updated_at
CREATE TRIGGER on_schedules_updated
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Rule 1 Comment
COMMENT ON COLUMN public.schedules.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
