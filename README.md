# INOX Technologies — prototype institutionnel

MVP indépendant du site WordPress de production d’INOX Technologies.

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
- `composants/Revelation.js` : apparition progressive au défilement.
- `composants/PiedDePage.js` : coordonnées et footer.

Le projet utilise Next.js App Router, React, JavaScript et CSS classique. Aucun backend, CMS ou contenu de production n’est connecté.
