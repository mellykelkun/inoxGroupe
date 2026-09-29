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
5. Vérifier les routes, le forum, les métadonnées, `robots.txt` et `sitemap.xml`. Fait sur le candidat Production puis sur le domaine public.
6. Fusionner la branche après validation. Fait par avance rapide de `main` vers `124b156`.
7. Configurer le projet existant `inox-groupe` avec `apps/inoxgroupe` comme répertoire racine. Fait.
8. Redéployer le commit validé puis promouvoir ce déploiement. Fait automatiquement par l’intégration Git Vercel après réussite du build.

Le projet d’administration est explicitement exclu de cette phase.

Le tag `production-before-monorepo-2026-09-29` reste disponible pour retrouver immédiatement le code précédant la bascule.
