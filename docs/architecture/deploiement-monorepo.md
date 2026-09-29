# Déploiement du monorepo

## Garde-fous

- Le tag `production-before-monorepo-2026-09-29` désigne le code précédant la migration.
- La production existante continue d’utiliser son dernier déploiement valide tant que le nouveau build n’est pas promu.
- Aucune migration de base n’est appliquée automatiquement par un build Vercel.
- Les Previews ne doivent jamais utiliser les secrets de la base de production.

## Ordre de mise en ligne

1. Valider `npm run check` et les tests Supabase.
2. Publier la branche `chore/monorepo` sans la fusionner.
3. Créer le projet Vercel `inox-expertises` avec `apps/site-expertises` comme répertoire racine.
4. Créer une Preview temporaire du site principal avec `apps/site-principal` comme répertoire racine.
5. Vérifier les routes, le forum, les métadonnées, `robots.txt` et `sitemap.xml`.
6. Fusionner la branche après validation.
7. Configurer le projet existant `inox-groupe` avec `apps/site-principal` comme répertoire racine.
8. Redéployer le commit validé puis promouvoir ce déploiement.

Le projet d’administration est explicitement exclu de cette phase.
