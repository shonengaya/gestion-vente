-- Fix: Permettre la suppression en cascade des catégories
-- Cela supprimera automatiquement les budgets liés quand une catégorie est supprimée

-- 1. Supprimer la contrainte existante
ALTER TABLE public.budgets 
DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

-- 2. Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE public.budgets 
ADD CONSTRAINT budgets_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.categories(id) 
ON DELETE CASCADE;

-- Note: Maintenant, quand vous supprimez une catégorie, 
-- tous les budgets associés seront automatiquement supprimés
