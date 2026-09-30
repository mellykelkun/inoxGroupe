# inox-admin

Interface d’administration locale d’INOX Technologies.

```bash
npm run dev --workspace=@inox/inox-admin
```

L’application écoute volontairement sur `http://localhost:3002`.

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
npm run auth:bootstrap -w @inox/inox-admin -- --email=proprietaire@inox.ci --name="Nom du propriétaire"
```

Le lien retourné est confidentiel et à usage unique. Après cette exception
d’amorçage, tous les autres comptes sont créés depuis **Équipe & accès** par un
propriétaire ou un administrateur déjà connecté en AAL2.

## Démarrage

```bash
npm run dev -w @inox/inox-admin
```

Sans configuration Supabase, `/` reste verrouillée. L’interface statique reste
consultable en développement sur `/apercu`, sans aucune autorisation métier.
