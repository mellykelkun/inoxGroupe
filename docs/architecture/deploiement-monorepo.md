# Déploiement du monorepo

## Garde-fous

- Le tag `production-before-monorepo-2026-09-29` désigne le code précédant la migration.
- La production existante continue d’utiliser son dernier déploiement valide tant que le nouveau build n’est pas promu.
- Aucune migration de base n’est appliquée automatiquement par un build Vercel.
- Les Previews ne doivent jamais utiliser les secrets de la base de production.

## Ordre de mise en ligne

1. Valider `npm run check` et les tests Supabase.
2. Publier la branche `chore/monorepo` sans la fusionner. Fait le 29 septembre 2026.
3. Créer le projet Vercel `inox-expertises` avec `apps/inoxgroupe-v2` comme répertoire racine. Fait ; le projet est relié au dépôt central et reste protégé avant publication.
4. Créer une Preview temporaire du site principal avec `apps/inoxgroupe` comme répertoire racine. Fait dans le projet isolé `inox-groupe-monorepo-preview`.
5. Vérifier les routes, le forum, les métadonnées, `robots.txt` et `sitemap.xml`.
6. Fusionner la branche après validation.
7. Configurer le projet existant `inox-groupe` avec `apps/inoxgroupe` comme répertoire racine.
8. Redéployer le commit validé puis promouvoir ce déploiement.

Le projet d’administration est explicitement exclu de cette phase.

Tant que l’étape 7 n’est pas exécutée, une Preview Git automatique de `inox-groupe` sur la branche monorepo peut échouer parce qu’elle cherche encore `.next` à la racine. Ce comportement est attendu et n’affecte pas le dernier déploiement Production valide.
