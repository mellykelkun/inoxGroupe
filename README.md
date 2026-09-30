# Plateforme INOX Groupe

Dépôt central des applications web d’INOX Groupe.

## Applications

- `apps/inoxgroupe` : site institutionnel actuellement déployé sur Vercel.
- `apps/inoxgroupe-v2` : site INOX Expertises, déployé séparément.
- `apps/inox-admin` : administration sécurisée des demandes, du forum, du futur Journal et des accès ; port local `3002`.

## Infrastructure

- npm workspaces centralise les dépendances dans un seul `package-lock.json`.
- Turborepo orchestre les vérifications et les builds indépendants.
- `supabase/` contient l’unique historique de migrations de la base partagée.
- Chaque application est reliée à un projet Vercel distinct avec son propre répertoire racine.

## Commandes

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Pour travailler sur une seule application :

```bash
npm run dev --workspace=@inox/inoxgroupe
npm run dev --workspace=@inox/inoxgroupe-v2
npm run dev --workspace=@inox/inox-admin
```

## Déploiements Vercel

| Projet | Répertoire racine | État |
| --- | --- | --- |
| `inox-groupe` | `apps/inoxgroupe` | Production active |
| `inox-expertises` | `apps/inoxgroupe-v2` | Production active |
| `inox-admin` | `apps/inox-admin` | Projet privé, authentification Supabase et 2FA |

Le site principal reste déployé par son projet Vercel historique `inox-groupe`, sur son URL publique inchangée.
