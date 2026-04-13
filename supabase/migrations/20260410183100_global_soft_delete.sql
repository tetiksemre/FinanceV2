-- Migration: Add Soft Delete and Asset Balance
-- File: supabase/migrations/20260410183100_global_soft_delete.sql

-- 1. Add deleted_at column to main tables
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Add balance column to assets table
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS balance NUMERIC(15, 2) DEFAULT 0 NOT NULL;

-- 3. Update existing assets' balance from metadata if possible (Optional but good)
-- Logic: If metadata->'balance' exists, use it.
UPDATE public.assets 
SET balance = (metadata->>'balance')::numeric 
WHERE metadata ? 'balance' AND metadata->>'balance' ~ '^[0-9.]+$';

-- 4. Rule 45 & 46 Compliance Comments
COMMENT ON COLUMN public.transactions.deleted_at IS 'Soft delete timestamp (Phase 1.12)';
COMMENT ON COLUMN public.assets.deleted_at IS 'Soft delete timestamp (Phase 1.12)';
COMMENT ON COLUMN public.assets.balance IS 'Current balance for performance and history tracking';
