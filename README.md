# Asso Shop Starter — Next.js + Stripe + Supabase

Mini-boutique pour association : paiement CB (Stripe Checkout) + collecte d’adresse + enregistrement de commande dans Supabase, sans webhook pour la v1 (enregistré à la page de succès).

## 1) Prérequis
- Node.js 18+ (recommandé via nvm)
- Un compte Stripe (mode Test)
- Un projet Supabase (gratuit)

## 2) Installation
```bash
# macOS (via Homebrew + nvm)
brew install nvm
mkdir -p ~/.nvm && echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc && echo 'source $(brew --prefix nvm)/nvm.sh' >> ~/.zshrc && source ~/.zshrc
nvm install --lts
node -v

# Dans le dossier du projet
npm install
cp .env.example .env.local
# puis édite .env.local avec tes vraies clés
```

## 3) Configurer Supabase
1. Crée un projet, récupère `SUPABASE_URL` et `SERVICE_ROLE_KEY` (depuis **Project Settings → API**).
2. Dans la section **SQL**, exécute `supabase.sql` (fourni dans ce repo) pour créer les tables.

## 4) Configurer Stripe
- Récupère les clés **test** : `STRIPE_SECRET_KEY` (server) et `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client).
- Laisse `NEXT_PUBLIC_BASE_URL=http://localhost:3000` pour les tests locaux.

## 5) Lancer en local
```bash
npm run dev
# http://localhost:3000
```
Ajoute des produits au panier, clique "Payer". Utilise une carte de test Stripe :
- 4242 4242 4242 4242 — n’importe quelle date future / CVC / ZIP

Après paiement, tu arrives sur `/success?session_id=...` ; la page enregistre la commande + adresse dans Supabase.

## 6) Admin
- Va sur `/admin?token=VOTRE_TOKEN` (défini dans `.env.local` → `ADMIN_TOKEN`)
- Liste les commandes + bouton d’export CSV.

## 7) Déploiement (Vercel)
- Push sur GitHub puis "Import" dans Vercel, ou `vercel` en CLI
- Ajoute les variables d’environnement dans Vercel (comme `.env.local`)
- Mets `NEXT_PUBLIC_BASE_URL=https://votre-domaine.tld`
- Passe Stripe en **Live** quand prêt et remplace les clés.

## 8) Étape suivante (optionnelle)
- Remplacer l’enregistrement sur `/success` par un **Webhook Stripe** pour plus de robustesse.
