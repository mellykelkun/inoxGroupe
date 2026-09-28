# INOX Technologies

[![Verification continue](https://github.com/mellykelkun/inoxGroupe/actions/workflows/ci.yml/badge.svg)](https://github.com/mellykelkun/inoxGroupe/actions/workflows/ci.yml)

Site institutionnel indépendant du site WordPress de production d’INOX Technologies.

Prototype déployé : [inox-groupe.vercel.app](https://inox-groupe.vercel.app)

## Démarrer le projet

```bash
npm install
npm run dev
```

Le site est ensuite disponible sur [http://localhost:3000](http://localhost:3000).

## Structure actuelle

- `app/` : routes, métadonnées, manifeste, styles et police locale.
- `app/ecosysteme/` : présentation des expertises et technologies.
- `app/partenaires/` : références clients et partenaires technologiques.
- `app/immersion-core/` : expérience interactive Immersion Core.
- `composants/` : composants partagés et comportements côté client.
- `public/` : images, logos, icônes, carte de visite et carte géographique.
- `licenses/` : licence de la police locale Perfograma.

Le projet utilise Next.js App Router, React, JavaScript et CSS classique. Aucun backend ni CMS n’est connecté.

## CI/CD

- GitHub Actions exécute `npm ci`, ESLint et le build Next.js sur les push et pull requests vers `main`.
- Vercel est connecté au dépôt GitHub : les branches peuvent produire des aperçus et `main` alimente la production.
- Le formulaire utilise actuellement la messagerie du visiteur. Il enverra du JSON au backend lorsque `NEXT_PUBLIC_ENDPOINT_CONTACT` sera configuré.
