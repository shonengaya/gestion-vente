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
