-- Enhanced RLS for Family Support (Rule 21)

-- Helper function to get the current user's family_id
CREATE OR REPLACE FUNCTION public.get_my_family_id()
RETURNS UUID AS $$
    SELECT family_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Update Assets Policy
DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
CREATE POLICY "Users can view same family assets" 
ON public.assets FOR SELECT 
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = public.assets.user_id 
        AND family_id = public.get_my_family_id()
    )
);

-- Update Transactions Policy
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view same family transactions" 
ON public.transactions FOR SELECT 
USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = public.transactions.user_id 
        AND family_id = public.get_my_family_id()
    )
);

-- Update Schedules Policy
DROP POLICY IF EXISTS "Users can view own schedules" ON public.schedules;
CREATE POLICY "Users can view family schedules" 
ON public.schedules FOR SELECT 
USING (
    auth.uid() = responsible_user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = public.schedules.responsible_user_id
        AND family_id = public.get_my_family_id()
    )
);

-- Update Tags Policy
DROP POLICY IF EXISTS "Users can manage own tags" ON public.tags;
CREATE POLICY "Users can view family tags"
ON public.tags FOR SELECT
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = public.tags.user_id
        AND family_id = public.get_my_family_id()
    )
);

-- NOTE: Manage (Insert/Update/Delete) remains restricted to OWN record for security, 
-- unless family admins are implemented later.
