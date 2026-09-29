# Plateforme INOX Groupe

Dépôt central des applications web d’INOX Groupe.

## Applications

- `apps/inoxgroupe` : site institutionnel actuellement déployé sur Vercel.
- `apps/inoxgroupe-v2` : second site éditorial et SEO, pas encore publié.
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
npm run dev --workspace=@inox/inoxgroupe
npm run dev --workspace=@inox/inoxgroupe-v2
```

## Déploiements Vercel

| Projet | Répertoire racine | État |
| --- | --- | --- |
| `inox-groupe` | `apps/inoxgroupe` | Production active |
| `inox-expertises` | `apps/inoxgroupe-v2` | Créé et relié à ce dépôt ; accès protégé avant publication |

Le site principal reste déployé par son projet Vercel historique `inox-groupe`, sur son URL publique inchangée.
