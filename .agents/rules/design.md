---
trigger: always_on
---

# Dashboard Design System & UI Guidelines
**Toutes les nouvelles pages, composants, et interfaces créés pour cette application doivent OBLIGATOIREMENT suivre ce Design System (basé sur le Dashboard).**

## 1. Couleurs et Fonds
- **Arrière-plan principal** : `bg-background`
- **Cartes et Conteneurs** : `bg-card`
- **Bordures** : `border-border/50` (toujours subtil, avec l'opacité /50)
- **Ombres** : `shadow-sm` pour les cartes.
- **Textes** : `text-foreground` pour le texte principal, `text-muted-foreground` pour les textes secondaires ou descriptions.

## 2. Badges et Statuts (Style Soft/Translucide)
Ne jamais utiliser de couleurs pleines (solid) pour les statuts. Toujours utiliser le motif translucide avec bordure :
- **Succès/Confirmé** : `bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20`
- **En attente/Avertissement** : `bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20`
- **Erreur/Annulé** : `bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20`
- **Info/Action** : `bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20`
- **Brouillon/Neutre** : `bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20`

## 3. Typographie
- **Polices des Titres** : Toujours utiliser `font-heading` couplé à `font-bold tracking-tight`.
- **Header de page** : `font-heading text-3xl font-bold tracking-tight text-foreground`.
- **Titres de cartes (CardTitle)** : `text-sm font-medium text-muted-foreground`.

## 4. Tableaux et Listes
- **En-tête (thead)** : `text-xs text-muted-foreground uppercase bg-muted/50`.
- **Corps (tbody)** : Séparateur `divide-y divide-border/50`.
- **Survol de ligne (Hover)** : Toujours ajouter `hover:bg-muted/30 transition-colors`.

## 5. Animations et Overlays
- **Transitions** : Utiliser systématiquement `transition-colors` sur les boutons/liens et `transition-transform duration-300` pour les mouvements.
- **Overlays (Modals, Sidebars)** : `bg-background/80 backdrop-blur-sm`.

## 6. Layouts et Alignements (Responsivité)
- **Espacements standard (padding main)** : `p-4 sm:p-6 lg:p-8`.
- **Grilles de KPIs (Stats)** : `grid gap-6 md:grid-cols-2 lg:grid-cols-4`.
- Ne pas hésiter à utiliser des îcones Lucide (avec `w-5 h-5 text-primary`) dans de petits conteneurs `bg-primary/10 rounded-lg`.