-- Dev-Mode Bypass for Assets and Rules (Faz 12.1 & 12.5)

-- 1. Drop FK Constraints to allow Manual Profile ID (0000...)
ALTER TABLE public.assets DROP CONSTRAINT IF EXISTS assets_user_id_fkey;
ALTER TABLE public.rules DROP CONSTRAINT IF EXISTS rules_user_id_fkey;

-- 2. Rules Bypass
DROP POLICY IF EXISTS "Users can view own rules" ON public.rules;
CREATE POLICY "Users can view own rules" ON public.rules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own rules" ON public.rules;
CREATE POLICY "Users can manage own rules" ON public.rules FOR ALL USING (true) WITH CHECK (true);

-- 3. Assets Bypass
DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own assets" ON public.assets;
CREATE POLICY "Users can manage own assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
