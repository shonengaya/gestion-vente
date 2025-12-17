# Migration de la Base de Données - Module Budget

## Prérequis
Vous devez avoir accès à votre tableau de bord Supabase (SQL Editor).

## Instructions d'exécution

### Étape 1: Créer les Tables (Schema)
Allez dans **Supabase Dashboard > SQL Editor** et exécutez le fichier `sql/budget_schema.sql` :

```sql
-- Ce fichier contient:
-- 1. Table categories (id, user_id, name, color, icon)
-- 2. Modification de table expenses (ajout de category_id)
-- 3. Table budgets (id, user_id, category_id, amount, period_type, start_date)
-- 4. Politiques RLS pour toutes les tables
```

**Actions:**
1. Ouvrez `sql/budget_schema.sql`
2. Copiez tout le contenu
3. Collez dans le SQL Editor de Supabase
4. Cliquez sur "Run"

### Étape 2: Créer la Fonction RPC
Exécutez le fichier `sql/rpc_budget.sql` :

```sql
-- Cette fonction permet d'obtenir un résumé budgétaire agrégé
-- Elle retourne: category_id, category_name, planned_amount, spent_amount, percentage_used, etc.
```

**Actions:**
1. Ouvrez `sql/rpc_budget.sql`
2. Copiez tout le contenu
3. Collez dans le SQL Editor de Supabase
4. Cliquez sur "Run"

### Étape 3: (Optionnel) Créer une Catégorie par Défaut
Pour les dépenses existantes qui n'ont pas de catégorie, vous pouvez créer une catégorie "Général" :

```sql
-- Remplacez 'YOUR_USER_ID' par votre ID utilisateur
INSERT INTO categories (user_id, name, color, icon)
VALUES ('YOUR_USER_ID', 'Général', '#94a3b8', '📦');
```

### Étape 4: Activer Realtime pour les nouvelles tables

1. Allez dans **Database > Replication**
2. Activez les publications Realtime pour:
   - `categories`
   - `budgets`

## Vérification

Testez que tout fonctionne:

```sql
-- Vérifier les tables
SELECT * FROM categories LIMIT 5;
SELECT * FROM budgets LIMIT 5;
SELECT * FROM expenses LIMIT 5;

-- Tester la fonction RPC (remplacez les dates)
SELECT * FROM get_budget_summary('month', '2025-12-01', '2025-12-31');
```

## Rollback (En cas de problème)

Si vous devez annuler :

```sql
-- ATTENTION: Ceci supprime toutes les données budgétaires
DROP FUNCTION IF EXISTS get_budget_summary;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
ALTER TABLE expenses DROP COLUMN IF EXISTS category_id;
```

## Notes Importantes

- ⚠️ **Backup**: Faites une sauvegarde avant d'exécuter les migrations
- ✅ **RLS**: Les politiques de sécurité (RLS) sont automatiquement créées
- 🔄 **Realtime**: Activez-le manuellement pour les nouvelles tables
- 📊 **Données Existantes**: Les dépenses existantes auront `category_id = NULL` (ce qui est OK)

---

## 🔧 Correction d'Erreur: Suppression de Catégorie (409 Conflict)

Si vous obtenez cette erreur lors de la suppression d'une catégorie:
```
DELETE 409 (Conflict)
code: '23503', details: 'Key is still referenced from table "budgets"'
```

**Solution:** Exécutez le script `sql/fix_cascade_delete.sql` dans Supabase :

```sql
-- Ce script modifie la contrainte de clé étrangère 
-- pour permettre la suppression en cascade
```

Après cette correction, supprimer une catégorie supprimera automatiquement tous les budgets associés (avec un avertissement dans l'UI).

