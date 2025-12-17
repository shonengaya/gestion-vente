-- =====================================================
-- SMART BUDGET ROLLUP
-- =====================================================
-- Cette fonction remplace l'ancienne get_budget_summary.
-- Elle est "intelligente" : si aucun budget n'est défini pour la période demandée (ex: Mois),
-- elle vérifie s'il existe un budget JOURNALIER et le multiplie par le nombre de jours.
-- Cela évite d'avoir "0 Ar" de budget quand on a pourtant défini une limite journalière.

-- IMPORTANT : On supprime d'abord l'ancienne fonction car on change le type de données retourné
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
    percentage_used NUMERIC,
    is_extrapolated BOOLEAN -- Indique si le budget a été calculé depuis une limite journalière
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    days_count INTEGER;
BEGIN
    -- Calcul du nombre de jours inclus dans la période (ex: 7 pour hebdo, 30/31 pour mois)
    days_count := (p_end_date - p_start_date) + 1;

    RETURN QUERY
    WITH 
    -- 1. Budget exact pour la période demandée (ex: Le budget "Mensuel" explicite)
    exact_period_budgets AS (
        SELECT 
            b.id,
            b.category_id,
            b.amount
        FROM public.budgets b
        WHERE b.user_id = auth.uid()
        AND b.period_type = p_period_type
        AND b.start_date = p_start_date
    ),
    -- 2. Budget journalier (fallback) actif à cette date
    daily_budgets AS (
        SELECT DISTINCT ON (b.category_id)
            b.id,
            b.category_id,
            b.amount
        FROM public.budgets b
        WHERE b.user_id = auth.uid()
        AND b.period_type = 'day'
        AND b.start_date <= p_end_date 
        ORDER BY b.category_id, b.start_date DESC -- Prend le dernier budget journalier défini
    ),
    -- 3. Total des dépenses sur la période
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
        -- On retourne l'ID du budget exact s'il existe, sinon celui du journalier
        COALESCE(eb.id, db.id) as budget_id,
        c.id as category_id,
        c.name as category_name,
        c.color,
        
        -- C'est ici que la magie opère (Logique de priorité)
        CASE 
            WHEN eb.amount IS NOT NULL THEN eb.amount -- Priorité 1 : Budget défini explicitement pour cette période
            WHEN db.amount IS NOT NULL AND p_period_type != 'day' THEN (db.amount * days_count) -- Priorité 2 : Budget journalier x Jours
            ELSE 0 
        END as planned_amount,
        
        COALESCE(e.expense_total, 0) as spent_amount,
        
        -- Calcul du reste
        (
            CASE 
                WHEN eb.amount IS NOT NULL THEN eb.amount
                WHEN db.amount IS NOT NULL AND p_period_type != 'day' THEN (db.amount * days_count)
                ELSE 0 
            END
            - COALESCE(e.expense_total, 0)
        ) as remaining_amount,
        
        -- Calcul du pourcentage
        CASE 
            WHEN (
                CASE 
                    WHEN eb.amount IS NOT NULL THEN eb.amount
                    WHEN db.amount IS NOT NULL AND p_period_type != 'day' THEN (db.amount * days_count)
                    ELSE 0 
                END
            ) > 0 THEN 
                (COALESCE(e.expense_total, 0) / (
                    CASE 
                        WHEN eb.amount IS NOT NULL THEN eb.amount
                        WHEN db.amount IS NOT NULL AND p_period_type != 'day' THEN (db.amount * days_count)
                        ELSE 1 -- Evite division par zéro
                    END
                )) * 100
            ELSE 0 
        END as percentage_used,

        -- Flag pour le front-end (savoir si c'est une estimation)
        CASE 
            WHEN eb.amount IS NULL AND db.amount IS NOT NULL AND p_period_type != 'day' THEN TRUE 
            ELSE FALSE 
        END as is_extrapolated

    FROM public.categories c
    LEFT JOIN exact_period_budgets eb ON eb.category_id = c.id
    LEFT JOIN daily_budgets db ON db.category_id = c.id
    LEFT JOIN current_period_expenses e ON e.category_id = c.id
    WHERE c.user_id = auth.uid()
    ORDER BY c.name;
END;
$$;
