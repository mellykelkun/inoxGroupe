# Déploiement de la plateforme INOX

## État actuel

- Le site principal est relié au projet Vercel historique `inox-groupe`.
- Son répertoire racine Vercel est `apps/inoxgroupe`.
- Son URL publique reste `https://inox-groupe.vercel.app/`.
- Le second site est relié séparément au projet `inox-expertises`, avec `apps/inoxgroupe-v2` comme répertoire racine.
- Le projet d’administration est exclu de cette phase.

## Garde-fous

- Chaque site conserve son propre projet Vercel et son propre cycle de déploiement.
- La production existante continue d’utiliser son dernier déploiement valide jusqu’à la réussite du nouveau build.
- Aucune migration de base n’est appliquée automatiquement par un build Vercel.
- Les déploiements de prévisualisation ne doivent jamais recevoir les secrets de la base de production.

## Vérifications avant mise en ligne

1. Exécuter `npm run check` et les tests Supabase.
2. Vérifier le build de l’application concernée.
3. Contrôler les routes, le forum, les métadonnées, `robots.txt` et `sitemap.xml`.
4. Confirmer que le projet Vercel ciblé et son répertoire racine sont corrects avant toute promotion.

Un repère Git de sauvegarde conserve l’état du code précédant la réorganisation.
