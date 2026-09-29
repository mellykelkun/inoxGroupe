# Plateforme INOX Groupe

Monorepo officiel des applications web d’INOX Groupe.

## Applications

- `apps/site-principal` : site institutionnel actuellement déployé sur Vercel.
- `apps/site-expertises` : second site éditorial et SEO, pas encore en production.
- Le site d’administration est volontairement différé et ne fait pas partie de cette étape.

## Infrastructure

- npm workspaces centralise les dépendances dans un seul `package-lock.json`.
- Turborepo orchestre les vérifications et les builds indépendants.
- `supabase/` contient l’unique historique de migrations de la base partagée.
- Chaque application sera reliée à un projet Vercel distinct avec son propre répertoire racine.

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
npm run dev --workspace=@inox/site-principal
npm run dev --workspace=@inox/site-expertises
```

## Déploiements Vercel

| Projet | Répertoire racine | État |
| --- | --- | --- |
| `inox-groupe` | `apps/site-principal` | Production existante |
| `inox-expertises` | `apps/site-expertises` | À créer après validation |

La modification du répertoire racine du projet de production ne doit intervenir qu’après validation d’une Preview du monorepo.
