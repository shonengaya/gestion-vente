-- =====================================================
-- GESTION DE TRÉSORERIE (APPROVISIONNEMENT)
-- =====================================================

-- 1. Table pour les entrées d'argent hors ventes (Apports)
CREATE TABLE IF NOT EXISTS public.funding_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT, -- Ex: "Apport personnel", "Prêt", "Fond de caisse"
    payment_method TEXT NOT NULL, -- 'Cash', 'Mobile Money', 'Virement'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Sécurité (RLS)
ALTER TABLE public.funding_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own funding" ON public.funding_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own funding" ON public.funding_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own funding" ON public.funding_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own funding" ON public.funding_entries FOR DELETE USING (auth.uid() = user_id);

-- 3. Fonction pour récupérer le solde de trésorerie global
-- Calcule : (Total Ventes + Total Apports) - Total Dépenses
CREATE OR REPLACE FUNCTION get_cash_balance()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_sales NUMERIC;
    total_funding NUMERIC;
    total_expenses NUMERIC;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_sales FROM public.sales WHERE user_id = auth.uid();
    SELECT COALESCE(SUM(amount), 0) INTO total_funding FROM public.funding_entries WHERE user_id = auth.uid();
    SELECT COALESCE(SUM(amount), 0) INTO total_expenses FROM public.expenses WHERE user_id = auth.uid();

    RETURN (total_sales + total_funding) - total_expenses;
END;
$$;
