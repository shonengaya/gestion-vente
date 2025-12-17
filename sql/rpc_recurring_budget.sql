-- Fonction pour créer des budgets récurrents intelligemment
CREATE OR REPLACE FUNCTION create_recurring_budgets(
    p_category_id UUID,
    p_amount NUMERIC,
    p_start_date DATE,
    p_end_date DATE,
    p_selected_weekdays INTEGER[] -- Tableau d'entiers : 0=Dimanche, 1=Lundi, ..., 6=Samedi
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    curr_date DATE := p_start_date;
BEGIN
    -- Boucle jour par jour de la date de début à la date de fin
    WHILE curr_date <= p_end_date LOOP
        -- Vérifie si le jour de la semaine actuel est dans la liste des jours sélectionnés
        -- EXTRACT(DOW FROM date) renvoie 0 pour Dimanche, 1 pour Lundi, etc.
        IF EXTRACT(DOW FROM curr_date) = ANY(p_selected_weekdays) THEN
            -- Insère ou met à jour le budget pour ce jour-là
            INSERT INTO public.budgets (
                user_id, 
                category_id, 
                amount, 
                period_type, 
                start_date
            )
            VALUES (
                auth.uid(), 
                p_category_id, 
                p_amount, 
                'day', 
                curr_date
            )
            ON CONFLICT (user_id, category_id, period_type, start_date) 
            DO UPDATE SET amount = EXCLUDED.amount;
        END IF;

        -- Passe au jour suivant
        curr_date := curr_date + 1;
    END LOOP;
END;
$$;
