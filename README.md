# INOX Technologies — prototype institutionnel

[![Verification continue](https://github.com/mellykelkun/inoxGroupe/actions/workflows/ci.yml/badge.svg)](https://github.com/mellykelkun/inoxGroupe/actions/workflows/ci.yml)

MVP indépendant du site WordPress de production d’INOX Technologies.

Prototype déployé : [inox-groupe.vercel.app](https://inox-groupe.vercel.app)

## Démarrer le projet

```bash
npm install
npm run dev
```

Le site est ensuite disponible sur [http://localhost:3000](http://localhost:3000).

## Structure actuelle

- `app/page.js` : structure et contenu de la page d’accueil.
- `app/layout.js` : métadonnées et structure globale Next.js.
- `app/globals.css` : identité visuelle, responsive et animations CSS.
- `composants/Entete.js` : navigation et comportement du header.
- `composants/FormulaireContact.js` : formulaire entreprise/particulier prêt à être relié au futur espace d’administration.
- `composants/CarteCoteIvoire.js` : carte et repère géographique d’Angré.
- `composants/Revelation.js` : apparition progressive au défilement.
- `composants/PiedDePage.js` : coordonnées et footer.

Le projet utilise Next.js App Router, React, JavaScript et CSS classique. Aucun backend, CMS ou contenu de production n’est connecté.

## CI/CD

- GitHub Actions exécute `npm ci`, ESLint et le build Next.js sur les push et pull requests vers `main`.
- Vercel est connecté au dépôt GitHub : les branches peuvent produire des aperçus et `main` alimente la production.
- Le formulaire utilise actuellement la messagerie du visiteur. Il enverra du JSON au backend lorsque `NEXT_PUBLIC_ENDPOINT_CONTACT` sera configuré.
