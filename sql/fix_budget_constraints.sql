-- Add unique constraint to prevent duplicate budgets for the same category, period type, and start date
ALTER TABLE public.budgets 
ADD CONSTRAINT budgets_unique_period UNIQUE (user_id, category_id, period_type, start_date);

-- This will ensure that only one budget can exist for a given category, period type, and start date per user
