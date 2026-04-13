-- Migration to allow manual ID bypass for Dev Mode (Faz 10.6)

-- Ensure transaction_date column exists (Critical for PGRST204 Fix)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='transactions' AND column_name='transaction_date') THEN
        ALTER TABLE public.transactions ADD COLUMN transaction_date TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;
END $$;

-- DROP FK CONSTRAINT to allow manual UUIDs that are not in auth.users
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Update Categories policies
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view categories" ON public.categories;
CREATE POLICY "Users can view categories" ON public.categories FOR SELECT USING (true);

-- Update Transactions policies
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (true);
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (true);
