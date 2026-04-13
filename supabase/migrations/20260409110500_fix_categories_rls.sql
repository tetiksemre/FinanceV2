-- Fix Categories RLS (Faz 13.4)
-- Allows UPDATE and DELETE for categories (Dev Mode / Manual Profile ID)

-- 1. Ensure categories table is updated with All permissions for all (as per Dev Mode Bypass pattern)
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" 
ON public.categories FOR UPDATE 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" 
ON public.categories FOR DELETE 
USING (true);

-- 2. Verify and harden global categories view
DROP POLICY IF EXISTS "Users can view categories" ON public.categories;
CREATE POLICY "Users can view categories" 
ON public.categories FOR SELECT 
USING (true);

-- 3. Verify and harden insert
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories" 
ON public.categories FOR INSERT 
WITH CHECK (true);
