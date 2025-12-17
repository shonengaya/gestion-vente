-- =====================================================
-- CORRECTION DE L'ERREUR DE CRÉATION DE DÉPENSE (ERREUR 409)
-- =====================================================
-- Ce script supprime toutes les contraintes d'unicité (UNIQUE) 
-- sur la table 'expenses' qui pourraient bloquer l'ajout de dépenses.
--
-- Les dépenses ne doivent jamais avoir de contraintes d'unicité 
-- (on peut avoir deux dépenses identiques le même jour).
-- =====================================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    -- Parcourt toutes les contraintes uniques de la table expenses
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.expenses'::regclass 
        AND contype = 'u'  -- 'u' signifie contrainte UNIQUE
    ) LOOP 
        -- Supprime la contrainte trouvée
        RAISE NOTICE 'Suppression de la contrainte bloquante : %', r.conname;
        EXECUTE 'ALTER TABLE public.expenses DROP CONSTRAINT ' || quote_ident(r.conname); 
    END LOOP; 
END $$;

-- =====================================================
-- FIN DU SCRIPT
-- Essayez de recréer votre dépense après avoir exécuté ceci.
-- =====================================================
