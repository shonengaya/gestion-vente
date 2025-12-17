# 🧪 Suite de Tests - Module Budget

## Informations de Connexion
- **URL**: http://localhost:3000
- **Email**: andriahasina186@gmail.com
- **Mot de passe**: Fenohasina05

---

## ✅ TEST 1: Gestion des Catégories

### Objectif
Vérifier la création, affichage et suppression de catégories.

### Étapes
1. ✅ Se connecter à l'application
2. ✅ Cliquer sur "Budgets" dans le sidebar
3. ✅ Cliquer sur "Gérer Catégories"
4. ✅ Ajouter 3 catégories :
   - **Nourriture** (couleur par défaut)
   - **Transport** (couleur par défaut)
   - **Logement** (couleur par défaut)
5. ✅ Vérifier qu'elles apparaissent dans la liste
6. ✅ Fermer le modal

### Résultat Attendu
- ✅ Les 3 catégories sont créées sans erreur
- ✅ Elles s'affichent dans le modal
- ✅ Pas d'erreur 409 ou 23503

---

## ✅ TEST 2: Création de Budgets

### Objectif
Créer des budgets pour différentes catégories et périodes.

### Préconditions
- Période sélectionnée: **Mensuel**
- Date affichée: **Décembre 2025**

### Étapes
1. ✅ Cliquer sur "Nouveau Budget"
2. ✅ Sélectionner "Nourriture"
3. ✅ Entrer **100 000 Ar**
4. ✅ Cliquer "Enregistrer"
5. ✅ Répéter pour:
   - **Transport**: 50 000 Ar
   - **Logement**: 200 000 Ar

### Résultat Attendu
- ✅ 3 cartes de budget apparaissent
- ✅ Budget Total KPI = **350 000 Ar**
- ✅ Dépensé = **0 Ar**
- ✅ Utilisation = **0%**
- ✅ Chaque carte affiche:
  - Nom de catégorie
  - Budget: XXX Ar
  - 0 Ar dépensé
  - Barre de progression verte à 0%

---

## ✅ TEST 3: Ajout de Dépenses avec Catégories

### Objectif
Ajouter des dépenses et vérifier qu'elles impactent les budgets.

### Étapes
1. ✅ Aller dans l'onglet **"Dépenses"**
2. ✅ Cliquer "Nouvelle Dépense"
3. ✅ Ajouter:
   - Description: **Courses supermarché**
   - Catégorie: **Nourriture**
   - Montant: **25 000 Ar**
   - Date: Aujourd'hui
4. ✅ Répéter pour:
   - **Taxi ville** → Transport → **15 000 Ar**
   - **Loyer Décembre** → Logement → **180 000 Ar**

### Résultat Attendu
- ✅ 3 dépenses créées sans erreur
- ✅ Elles apparaissent dans l'historique
- ✅ Les catégories sont bien affichées dans chaque ligne

---

## ✅ TEST 4: Vérification des Calculs Budgétaires

### Objectif
Retourner aux Budgets et vérifier que les calculs sont corrects.

### Étapes
1. ✅ Retourner sur l'onglet **"Budgets"**
2. ✅ Vérifier chaque carte

### Résultats Attendus

#### Carte "Nourriture"
- Budget: 100 000 Ar
- Dépensé: **25 000 Ar**
- % utilisé: **25%**
- Restant: **75 000 Ar**
- Couleur barre: **Vert** (< 80%)
- Statut: OK

#### Carte "Transport"
- Budget: 50 000 Ar
- Dépensé: **15 000 Ar**
- % utilisé: **30%**
- Restant: **35 000 Ar**
- Couleur barre: **Vert** (< 80%)
- Statut: OK

#### Carte "Logement"
- Budget: 200 000 Ar
- Dépensé: **180 000 Ar**
- % utilisé: **90%**
- Restant: **20 000 Ar**
- Couleur barre: **ROUGE** (> 100% considéré, ou orange si 80-100%)
- Statut: ⚠️ Attention ou dépassement

#### KPI Globaux (en haut)
- Budget Total: **350 000 Ar**
- Dépensé: **220 000 Ar**
- Utilisation: **62.9%**
- Couleur globale: **Vert/Orange**

---

## ✅ TEST 5: Navigation entre Périodes

### Objectif
Tester que les budgets sont bien isolés par période.

### Étapes
1. ✅ Actuellement sur **"Mensuel"** (Décembre 2025)
2. ✅ Cliquer sur l'onglet **"Hebdo"** (Hebdomadaire)
3. ✅ Observer les cartes de budget
4. ✅ Cliquer sur **"Journalier"**
5. ✅ Observer les cartes
6. ✅ Revenir à **"Mensuel"**

### Résultats Attendus
- ✅ **Hebdo**: Budgets vides (0 Ar) car aucun budget hebdomadaire n'a été créé
  - Mais dépenses de la semaine en cours s'affichent quand même
- ✅ **Journalier**: Budgets vides (0 Ar) car aucun budget quotidien
  - Dépenses du jour s'affichent
- ✅ **Mensuel**: Retour aux budgets créés (350k Ar total)
- ✅ Les totaux changent selon la période

---

## ✅ TEST 6: Tutoriel Interactif

### Objectif
Vérifier que le tutoriel fonctionne et guide correctement.

### Étapes
1. ✅ Cliquer sur **"📚 Tutoriel"** (bouton vert)
2. ✅ Lire l'étape 1
3. ✅ Cliquer **"Suivant"** 3-4 fois
4. ✅ Vérifier que:
   - Les éléments sont surlignés (bordure bleue)
   - La page scroll automatiquement
   - La barre de progression avance
5. ✅ Tester les **points de navigation** en bas
6. ✅ Cliquer **"Passer le tutoriel"**

### Résultats Attendus
- ✅ Modal s'ouvre correctement
- ✅ Texte clair et en français
- ✅ Highlight bleu visible sur éléments ciblés
- ✅ Navigation fonctionnelle (Précédent/Suivant)
- ✅ Fermeture propre du tutoriel

---

## ✅ TEST 7: Modification de Budget

### Objectif
Modifier un budget existant et vérifier la mise à jour.

### Étapes
1. ✅ Sur la carte "Nourriture" (100 000 Ar)
2. ✅ Cliquer sur l'icône **crayon** (édition)
3. ✅ Changer le montant à **120 000 Ar**
4. ✅ Cliquer "Enregistrer"

### Résultats Attendus
- ✅ La carte se met à jour immédiatement
- ✅ Nouveau budget: **120 000 Ar**
- ✅ Dépensé: toujours **25 000 Ar**
- ✅ % utilisé: recalculé à **20.83%** (25k/120k)
- ✅ KPI Global mis à jour: Total = **370 000 Ar**

---

## ✅ TEST 8: Navigation Temporelle

### Objectif
Naviguer entre différents mois et vérifier l'isolation.

### Étapes
1. ✅ Sur **Mensuel - Décembre 2025**
2. ✅ Cliquer sur la **flèche droite** (→)
3. ✅ Vérifier qu'on est sur **Janvier 2026**
4. ✅ Observer les budgets (doivent être vides car pas encore créés)
5. ✅ Cliquer **flèche gauche** (←) 2 fois
6. ✅ Vérifier qu'on est sur **Novembre 2025**
7. ✅ Revenir à Décembre 2025

### Résultats Attendus
- ✅ Navigation fluide entre les mois
- ✅ Titre central (date) se met à jour
- ✅ Budgets affichés = budgets du mois sélectionné
- ✅ Pas de "fuite" de données entre périodes

---

## ✅ TEST 9: Suppression de Catégorie (Cascade)

### Objectif
Vérifier que la suppression d'une catégorie supprime aussi ses budgets.

### ATTENTION: Ce test est destructif !

### Étapes
1. ✅ Ouvrir "Gérer Catégories"
2. ✅ Créer une nouvelle catégorie **"Test Delete"**
3. ✅ Fermer modal
4. ✅ Créer un budget de **10 000 Ar** pour "Test Delete"
5. ✅ Vérifier que la carte apparaît
6. ✅ Rouvrir "Gérer Catégories"
7. ✅ Cliquer sur l'icône **poubelle** de "Test Delete"
8. ✅ Confirmer la suppression

### Résultats Attendus
- ✅ Message de confirmation apparaît (avertissement cascade)
- ✅ Après confirmation:
  - Catégorie disparaît du modal
  - Carte de budget "Test Delete" disparaît de la page
  - Total budgétaire se met à jour (-10k)
- ✅ Pas d'erreur 409 ou 23503

---

## ✅ TEST 10: Realtime Update

### Objectif
Vérifier que les mises à jour sont en temps réel.

### Prérequis
Ouvrir 2 onglets avec l'application (même compte).

### Étapes
1. ✅ **Onglet 1**: Sur page Budgets, Mensuel Décembre
2. ✅ **Onglet 2**: Aller sur Dépenses
3. ✅ **Onglet 2**: Ajouter une nouvelle dépense:
   - Nourriture, 5000 Ar, aujourd'hui
4. ✅ **Onglet 1**: Observer la carte "Nourriture"

### Résultat Attendu
- ✅ La carte "Nourriture" se met à jour **automatiquement**
- ✅ Nouveau montant dépensé: 30 000 Ar (25k + 5k)
- ✅ % mis à jour en temps réel
- ✅ Pas besoin de rafraîchir la page

---

## 📊 Rapport de Tests

### Grille de Résultats

| Test | Description | Statut | Commentaires |
|------|-------------|--------|--------------|
| 1 | Gestion Catégories | ⬜ À tester | |
| 2 | Création Budgets | ⬜ À tester | |
| 3 | Ajout Dépenses | ⬜ À tester | |
| 4 | Calculs Budgétaires | ⬜ À tester | |
| 5 | Navigation Périodes | ⬜ À tester | |
| 6 | Tutoriel Interactif | ⬜ À tester | |
| 7 | Modification Budget | ⬜ À tester | |
| 8 | Navigation Temporelle | ⬜ À tester | |
| 9 | Suppression Cascade | ⬜ À tester | |
| 10 | Realtime Updates | ⬜ À tester | |

### Légende
- ✅ Passé
- ❌ Échoué
- ⚠️ Bugs mineurs
- ⬜ Non testé

---

## 🐛 Bugs Connus à Vérifier

1. ❓ Erreur 409 lors suppression catégorie → **CORRIGÉ** (voir fix_cascade_delete.sql)
2. ❓ Budget affiché 0 Ar malgré création → **CORRIGÉ** (normalisation start_date)
3. ❓ Timeout navigateur lors tests auto → À investiguer

---

## 📝 Notes de Test

*Complétez ici vos observations durant les tests :*

- 
- 
- 

