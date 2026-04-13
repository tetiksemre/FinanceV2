-- Savings Goals Table
CREATE TABLE public.savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    family_id UUID,
    name TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    target_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own or family goals"
ON public.savings_goals FOR SELECT
USING (
    user_id = auth.uid() OR
    family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert their own goals"
ON public.savings_goals FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own or family goals"
ON public.savings_goals FOR UPDATE
USING (
    user_id = auth.uid() OR
    family_id = (SELECT family_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their own goals"
ON public.savings_goals FOR DELETE
USING (user_id = auth.uid());
