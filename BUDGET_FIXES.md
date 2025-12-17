# Correctifs appliqués pour les budgets

## Problèmes identifiés et résolus :

### 1. ✅ Contrainte UNIQUE manquante sur les budgets
**Problème** : La table `budgets` permettait de créer plusieurs budgets pour la même catégorie et la même période.

**Solution** : Ajout d'une contrainte UNIQUE sur `(user_id, category_id, period_type, start_date)` dans le fichier `sql/fix_budget_constraints.sql`.

**Action requise** : Exécuter le script SQL dans Supabase :
```sql
ALTER TABLE public.budgets 
ADD CONSTRAINT budgets_unique_period UNIQUE (user_id, category_id, period_type, start_date);
```

### 2. ✅ Fonction `addBudget` au lieu d'UPSERT
**Problème** : Lors de l'édition d'un budget, la fonction `addBudget` était appelée, créant un nouveau budget au lieu de mettre à jour l'existant.

**Solution** : 
- Création d'une fonction `upsertBudget` dans `services/api.ts` qui utilise la fonction `.upsert()` de Supabase
- Mise à jour de `BudgetDashboard.tsx` pour utiliser `upsertBudget` au lieu de `addBudget`

### 3. ✅ Manque d'ID de budget dans le résumé
**Problème** : La fonction RPC `get_budget_summary` ne retournait pas l'ID du budget, rendant impossible la mise à jour ou la suppression.

**Solution** :
- Modification de `sql/rpc_budget.sql` pour retourner `budget_id`
- Mise à jour de l'interface `BudgetSummary` dans `types.ts` pour inclure `budget_id?: string`

### 4. ✅ Pas de bouton de suppression
**Problème** : Il n'y avait pas de moyen visible de supprimer un budget.

**Solution** :
- Ajout d'une fonction `handleDeleteBudget` dans `BudgetDashboard.tsx`
- Ajout d'un bouton de suppression dans `BudgetCard.tsx` (icône corbeille)
- Le bouton n'apparaît que si un budget existe (planned_amount > 0)

## Actions requises pour finaliser :

1. **Exécuter le script SQL dans Supabase** :
   - Aller dans l'éditeur SQL de Supabase
   - Exécuter le contenu de `sql/fix_budget_constraints.sql`
   - Puis exécuter le contenu mis à jour de `sql/rpc_budget.sql` pour recréer la fonction RPC

2. **Tester les fonctionnalités** :
   - Créer un nouveau budget pour une période
   - Modifier le budget existant (vérifier qu'il met à jour au lieu de créer un doublon)
   - Supprimer le budget (cliquer sur l'icône corbeille)
   - Vérifier que les limites journalières/mensuelles sont bien prises en compte

## Fichiers modifiés :
- ✅ `sql/fix_budget_constraints.sql` (nouveau)
- ✅ `sql/rpc_budget.sql` (modifié)
- ✅ `types.ts` (modifié)
- ✅ `services/api.ts` (modifié)
- ✅ `hooks/useBudget.ts` (modifié)
- ✅ `components/budget/BudgetDashboard.tsx` (modifié)
- ✅ `components/budget/BudgetCard.tsx` (modifié)
