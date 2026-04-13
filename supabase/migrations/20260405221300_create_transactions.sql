-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS Policies (Rule 21)
-- Users can see their own transactions
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can manage their own transactions
CREATE POLICY "Users can manage own transactions" 
ON public.transactions FOR ALL 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER on_transactions_updated
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Rule 1 Comment
COMMENT ON COLUMN public.transactions.metadata IS 'Mandatory metadata for extensibility (Rule 1)';
