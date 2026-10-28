# inox-admin

Interface d’administration locale d’INOX Technologies.

```bash
npm run dev --workspace=@inox/inox-admin
```

L’application écoute volontairement sur `http://localhost:3002`.

En production, `ADMIN_URL` doit contenir l’origine HTTPS publique du panel
(par exemple `https://inox-admin.vercel.app`). Les QR d’invitation sont générés
sur cette origine et le callback vérifie directement le jeton à usage unique ;
ils ne dépendent donc pas de l’URL de site Supabase, souvent configurée sur
`localhost` pour le développement.

L’interface utilise la base Supabase partagée. Elle reçoit les demandes du site principal, modère le forum public et protège chaque session par une identité nominative et un second facteur TOTP.
# INOX Admin

Application interne, lancée localement sur le port `3002`. Elle est fermée par
défaut et exige une session Supabase Auth au niveau `aal2` (mot de passe + TOTP).

## Configuration locale

1. Copier `.env.example` vers `.env.local` dans ce dossier.
2. Renseigner les trois clés du projet Supabase partagé.
3. Appliquer les migrations Supabase.
4. Amorcer une seule fois le premier propriétaire :

```bash
npm run auth:bootstrap -w @inox/inox-admin -- --email=KevinA@inox-group.net --name="Nom du propriétaire" --admin-url=https://inox-admin.vercel.app
```

Le lien retourné est confidentiel et à usage unique. Après cette exception
d’amorçage, tous les autres comptes sont créés depuis **Équipe & accès** par un
propriétaire ou un administrateur déjà connecté en AAL2.

Tous les comptes de cette administration doivent utiliser une adresse nominative
du domaine `@inox-group.net`. Cette restriction ne concerne pas les formulaires
clients et publics, qui continuent d’accepter les adresses e-mail externes valides.

## Démarrage

```bash
npm run dev -w @inox/inox-admin
```

Sans configuration Supabase, `/` reste verrouillée. L’interface statique reste
consultable en développement sur `/apercu`, sans aucune autorisation métier.

## Synchronisation temps réel

L’admin s’abonne directement au curseur `admin_sync_state` avec Supabase
Realtime. Le canal ne transporte aucune donnée métier : il signale seulement
une modification, puis l’interface recharge ses routes authentifiées. Aucune
fonction Vercel n’est maintenue ouverte pour cette synchronisation.

La migration `20261001090000_add_admin_sync_state.sql` doit être appliquée au
projet Supabase partagé pour activer les signaux provenant des sites publics.

Le Journal INOX permet de rédiger et publier des contenus avec jusqu’à dix
illustrations par publication. Les fichiers sont stockés dans le bucket
`editorial-media`, dont l’écriture est réservée à l’admin, puis servis par le
site Expertises.
La migration `20261001131822_editorial_post_images.sql` prépare ce stockage.
