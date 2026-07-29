# 🧠 Cerveau de l'Application : Ztefu SAAS (Landing Enchère Pro)

Ce fichier `GEMINI.md` sert de document de référence pour comprendre instantanément l'état, l'architecture et les décisions de design de l'application "Landing-enchere-pro". Il doit être lu par tout modèle IA avant de commencer une nouvelle tâche.

## 🎯 1. Ce que l'application fait

Il s'agit d'une plateforme SaaS B2B2C dédiée à l'organisation de **ventes privées et aux enchères haut de gamme**. 
L'application se divise en deux grandes parties :
- **Côté Client (B2C)** : Une *Landing Page* très premium pour présenter la prochaine vente, afficher un aperçu du catalogue (lots), et permettre aux visiteurs de s'inscrire et de payer des frais de réservation pour participer à l'événement.
- **Côté Administrateur (B2B)** : Un *Tableau de bord (Dashboard)* complet permettant à l'organisateur de gérer ses ventes, ses lots, de suivre les inscriptions, de valider les paiements et de paramétrer sa landing page.

## ✨ 2. Fonctionnalités implémentées (État actuel)

À ce stade (Front-end statique avec gestion d'état locale), voici ce qui est opérationnel :

### Côté Client (Marketing & Inscription)
- **Landing Page Complète** : Sections Hero, "Comment ça marche", Avantages, Aperçu des Lots (avec galerie), FAQ, Témoignages, et Footer. Le design est luxueux (Dark mode dominé par le noir, l'or et l'émeraude).
- **Système d'inscription (`/inscription`)** : Tunnel en 3 étapes :
  1. Formulaire de renseignements (Nom, email, téléphone avec indicatif).
  2. Paiement factice (simulation d'empreinte bancaire).
  3. Écran de confirmation de succès.

### Côté Administrateur (Tableau de Bord)
L'état de l'application est centralisé via le **`AdminContext`**.
- **Gestion des Ventes (`/admin/ventes`)** : Liste des ventes avec filtres. Création de nouvelles ventes, modification de statut, et suppression.
- **Gestion des Lots (`/admin/ventes/[id]/lots`)** : Interface pour ajouter, modifier et réorganiser les lots spécifiques d'une vente.
- **Gestion des Inscriptions (`/admin/inscriptions`)** : Tableau de bord des participants. Validation manuelle des paiements, envoi des accès, et radiation de participants.
- **Paramètres (`/admin/parametres`)** : Configuration des frais d'inscription et des informations de l'entreprise.
- **Global** : Les modifications dans le dashboard (ex: ajout d'une vente, changement de paramètre) sont instantanément répercutées dans l'interface tant que la page n'est pas rafraîchie.

## 📂 3. Structure des fichiers principale

L'application utilise le **App Router** de Next.js.

```text
src/
├── app/
│   ├── (marketing)/         # Landing page et pages légales (B2C)
│   ├── admin/               # Espace Tableau de Bord (B2B)
│   │   ├── inscriptions/    # Gestion des participants
│   │   ├── parametres/      # Configuration globale
│   │   └── ventes/          # Gestion des ventes et des lots
│   ├── inscription/         # Tunnel d'inscription (B2C)
│   └── globals.css          # Styles globaux (Tailwind CSS)
├── components/
│   ├── admin/               # Composants spécifiques au Dashboard (Sidebar, Header, etc.)
│   ├── landing/             # Composants de la Landing Page (Hero, FAQ, etc.)
│   ├── shared/              # Composants réutilisables (ex: Logo)
│   └── ui/                  # Composants de base Shadcn UI (Boutons, Cartes, etc.)
├── context/
│   └── AdminContext.tsx     # Gestionnaire d'état global (Données fictives, CRUD)
└── lib/
    └── utils.ts             # Fonctions utilitaires (ex: fusion de classes CSS)
```

## 🛠️ 4. Technologies Utilisées

- **Framework** : Next.js 15 (React 19) avec TurboPack.
- **Styling** : Tailwind CSS v4, Lucide React (Icônes).
- **Composants UI** : Shadcn UI (basé sur Radix UI / Base UI).
- **Gestion d'état** : React Context API (`AdminContext`).
- **Utilitaires** : `date-fns` (gestion des dates), `framer-motion` (animations), `react-phone-number-input`.

## 🎨 5. Décisions de Design et Instructions pour l'IA

### Lignes directrices de Design (Règles strictes)
- L'application suit un système de design **strictement dicté par le fichier `design.md`** que l'utilisateur a défini dans ses règles (`<user_rules>`).
- **Couleurs & Arrière-plans** : L'interface utilise une palette très premium avec des arrière-plans floutés (`backdrop-blur`), des bordures subtiles (`border-border/50`), et des effets de *glassmorphism*.
- **Badges de Statut** : **NE JAMAIS** utiliser de couleurs pleines (solid) pour les statuts. Il faut toujours utiliser un motif translucide. 
  - Exemple de Succès : `bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20`.
- **Typographie** : Les titres utilisent `font-heading font-bold tracking-tight`.

### Instructions pour la suite du développement
1. **Éviter le code mort / mock data en dur** : Lors de l'ajout de nouvelles pages (côté Admin), toujours utiliser le `AdminContext` pour récupérer et muter les données, plutôt que de coder des constantes statiques dans les fichiers de page.
2. **Ne jamais faire de `git push`** : Conformément aux règles de l'utilisateur (`AGENTS.md`), il est strictement interdit de faire un `git push` de manière autonome. Toujours demander l'accord.
3. **Erreurs Next.js 15 (Params)** : Les pages dynamiques (comme `[id]/page.tsx`) nécessitent désormais de "déballer" la promesse `params` avec la fonction `use(params)` de React 19 pour éviter l'erreur de synchronisation des API dynamiques.
4. **Prochaines étapes** : Le projet est prêt pour l'intégration Back-end (Authentication + Supabase). Il faudra remplacer la logique interne du `AdminContext` par de vrais appels réseaux via le client Supabase.
