# Prolow5 Design System

## 1. Identité de la Marque

*   **Nom** : Prolow5
*   **Slogan** : "Gestion de ventes et de budget"
*   **Logo** : Grille de 4 points (Carré arrondi)
    *   Haut-Gauche : `bg-blue-500`
    *   Haut-Droite : `bg-gray-400`
    *   Bas-Gauche : `bg-gray-600`
    *   Bas-Droite : `bg-gray-800`

## 2. Palette de Couleurs

L'interface utilise une palette inspirée de ChartMogul, sobre et professionnelle, avec des accents fonctionnels forts.

### Couleurs Principales
*   **Primary Dark (Navigation & Actions)** : `Slate-900` (Sombre, élégant)
    *   Utilisé pour : Sidebar Desktop, Boutons Principaux (CTA), Titres forts.
*   **Background (Fond d'écran)** : `#F5F6FA` (Gris très clair légèrement bleuté)
    *   Utilisé pour : Le fond principal de l'application (Main Content).
*   **Surface (Cartes)** : `White` ou `Gray-50`
    *   Utilisé pour : Les conteneurs, cartes de statistiques, tableaux.

### Couleurs Fonctionnelles
*   **Action / Brand Blue** : `Blue-600` (`text-blue-600`, `bg-blue-600`)
    *   Utilisé pour : Liens, États actifs, Focus rings, Icônes d'information.
*   **Ventes / Succès (Emerald)** : `Emerald-600`
    *   Utilisé pour : Montants positifs (Ventes), Indicateurs de hausse, Boutons de confirmation.
*   **Dépenses / Danger (Red)** : `Red-600`
    *   Utilisé pour : Montants négatifs (Dépenses), Boutons de suppression.

### Nuances de Gris
*   **Text Principal** : `Slate-900` ou `Gray-900`.
*   **Text Secondaire** : `Gray-500` ou `Gray-400` (Labels, Sous-titres).
*   **Bordures** : `Gray-100` ou `Gray-200` (Subtil).

## 3. Typographie

*   **Famille** : Sans-Serif (Inter ou System Font stack).
*   **Titres** : `font-bold`, souvent avec `tracking-tight` (lettrage serré) pour un look moderne.
*   **Chiffres** : `font-sans` ou monospaced pour les tableaux financiers si nécessaire (actuellement sans-serif bold).

## 4. Composants UI (User Interface)

### Cartes (Cards)
*   **Forme** : `rounded-xl` (Coins très arrondis).
*   **Style** : `bg-white` ou `bg-gray-50`, bordure fine `border-gray-100`.
*   **Ombre** : Légère (`shadow-sm`) ou aucune si sur fond blanc.

### Boutons (Buttons)
*   **Forme** : `rounded-xl` (ou `rounded-lg` pour les petits éléments).
*   **Primaire** : `bg-slate-900` text `white`.
*   **Secondaire** : `bg-white` border `gray-200` text `slate-700`.
*   **Icônes** : Souvent accompagnés d'une icône SVG simple (Heroicons style).

### Champs de Saisie (Inputs)
*   **Fond** : `bg-gray-50`.
*   **Bordure** : `border-gray-200`.
*   **Focus** : `ring-2 ring-blue-500/20 border-blue-500`.
*   **Forme** : `rounded-xl`.

### Modales & Popovers
*   **Overlay** : `backdrop-blur-sm bg-black/50`.
*   **Animation** : `animate-fade-in` (Apparition douce).
*   **Conteneur** : `rounded-2xl`, `shadow-2xl`.

## 5. Layout & Responsivité

### Desktop
*   **Sidebar** : Fixe à gauche, largeur `w-64`, couleur `Slate-900` ou Foncé (`#1c1e2d`).
*   **Header** : Sticky top, fond blanc, contient la recherche et le profil.

### Mobile
*   **Navigation** : Bottom Navigation Bar ou Header simplifié.
*   **Vues** : Les tableaux complexes sont transformés en **Cartes (Card Views)** pour la lisibilité ("Mobile-first Cards").
*   **Menu** : Logo visible en haut à gauche avec sous-titre.
