# Inventaire des variables Vercel

Cet inventaire contient uniquement les noms observés. Aucune valeur ni aucun secret n’est conservé dans Git.

## Convention cible

Variables nécessaires au site principal :

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `FORUM_HASH_SECRET`

Variable temporaire du formulaire actuel :

- `NEXT_PUBLIC_ENDPOINT_CONTACT`

## Variables générées par l’intégration existante

Les alias préfixés ci-dessous restent acceptés temporairement par le code du forum afin de ne pas interrompre la production :

- `inoxstorage_SUPABASE_URL`
- `inoxstorage_SUPABASE_SECRET_KEY`
- `inoxstorage_SUPABASE_PUBLISHABLE_KEY`
- `inoxstorage_SUPABASE_ANON_KEY`
- `inoxstorage_SUPABASE_SERVICE_ROLE_KEY`
- `inoxstorage_POSTGRES_URL`
- `inoxstorage_POSTGRES_URL_NON_POOLING`
- `inoxstorage_POSTGRES_PRISMA_URL`
- `inoxstorage_POSTGRES_HOST`
- `inoxstorage_POSTGRES_DATABASE`
- `inoxstorage_POSTGRES_USER`
- `inoxstorage_POSTGRES_PASSWORD`

## Procédure de transition

1. Ajouter les noms cibles dans les environnements Preview et Production de `inoxgroupe`.
2. Déployer et vérifier le forum avec les noms cibles.
3. Retirer les fallbacks préfixés du code dans une modification séparée.
4. Révoquer uniquement les anciennes variables devenues inutiles.

Les variables `VERCEL_*`, `TURBO_*` et `NX_*` observées localement sont générées par les plateformes ou les outils et ne doivent pas être copiées dans le dépôt.
