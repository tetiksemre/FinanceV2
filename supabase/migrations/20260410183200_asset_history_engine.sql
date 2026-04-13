-- Migration: Create Asset History Table
-- File: supabase/migrations/20260410183200_asset_history_engine.sql

CREATE TABLE IF NOT EXISTS public.asset_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

-- Asset History RLS Policies
CREATE POLICY "Users can view own asset history" 
ON public.asset_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own asset history" 
ON public.asset_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Rule 47 Compliance: Immutable History (Only Select and Insert)
COMMENT ON TABLE public.asset_history IS 'Snapshot history for assets. Immutable (Phase 1.13)';
COMMENT ON COLUMN public.asset_history.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
