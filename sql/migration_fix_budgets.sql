-- =====================================================
-- MIGRATION POUR CORRIGER LES PROBLÈMES DE BUDGET
-- =====================================================
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase
-- Il corrige les problèmes suivants :
-- 1. Pas de contrainte UNIQUE sur les budgets (permet les doublons)
-- 2. La fonction get_budget_summary ne retourne pas l'ID du budget
-- =====================================================

-- ÉTAPE 1: Supprimer les doublons existants (CRITIQUE : Nécessaire car vous avez déjà des doublons)
-- On garde uniquement le budget le plus récent pour chaque catégorie/période
DELETE FROM public.budgets 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, category_id, period_type, start_date) id
    FROM public.budgets
    ORDER BY user_id, category_id, period_type, start_date, created_at DESC
);

-- ÉTAPE 2: Ajouter la contrainte UNIQUE pour empêcher les doublons futurs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'budgets_unique_period'
    ) THEN
        ALTER TABLE public.budgets 
        ADD CONSTRAINT budgets_unique_period UNIQUE (user_id, category_id, period_type, start_date);
    END IF;
END $$;

-- ÉTAPE 3: Recréer la fonction get_budget_summary avec le budget_id
-- On doit d'abord supprimer l'ancienne fonction car on change son type de retour
DROP FUNCTION IF EXISTS get_budget_summary(text, date, date);

CREATE OR REPLACE FUNCTION get_budget_summary(
    p_period_type TEXT,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    budget_id UUID,
    category_id UUID,
    category_name TEXT,
    category_color TEXT,
    planned_amount NUMERIC,
    spent_amount NUMERIC,
    remaining_amount NUMERIC,
    percentage_used NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH current_user_budgets AS (
        SELECT 
            b.id,
            b.category_id,
            b.amount as budget_amount
        FROM public.budgets b
        WHERE b.user_id = auth.uid()
        AND b.period_type = p_period_type
        AND b.start_date = p_start_date -- Exact match for budget period start
    ),
    current_period_expenses AS (
        SELECT 
            e.category_id,
            COALESCE(SUM(e.amount), 0) as expense_total
        FROM public.expenses e
        WHERE e.user_id = auth.uid()
        AND e.date >= p_start_date 
        AND e.date <= p_end_date
        GROUP BY e.category_id
    )
    SELECT 
        b.id as budget_id,
        c.id,
        c.name,
        c.color,
        COALESCE(b.budget_amount, 0) as planned_amount,
        COALESCE(e.expense_total, 0) as spent_amount,
        (COALESCE(b.budget_amount, 0) - COALESCE(e.expense_total, 0)) as remaining_amount,
        CASE 
            WHEN COALESCE(b.budget_amount, 0) > 0 THEN (COALESCE(e.expense_total, 0) / b.budget_amount) * 100
            ELSE 0 
        END as percentage_used
    FROM public.categories c
    LEFT JOIN current_user_budgets b ON b.category_id = c.id
    LEFT JOIN current_period_expenses e ON e.category_id = c.id
    WHERE c.user_id = auth.uid()
    ORDER BY c.name;
END;
$$;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
-- Après avoir exécuté ce script, vos budgets devraient fonctionner correctement
-- Vous pourrez :
-- - Créer des budgets sans créer de doublons
-- - Modifier des budgets existants
-- - Supprimer des budgets
-- - Les limites journalières/mensuelles seront bien prises en compte
-- =====================================================
