# État de la sauvegarde Supabase

La sauvegarde distante n’a pas été exécutée automatiquement pendant la centralisation du dépôt.

Les variables récupérées depuis Vercel sont présentes localement sous la forme `[SENSITIVE]`, le projet n’est pas lié à Supabase CLI et aucun jeton Supabase n’est disponible dans cette session. Aucune tentative d’écriture distante n’a donc été effectuée.

Avant d’appliquer la migration `create_inox_operations_core` en production :

1. Créer ou vérifier un snapshot depuis le tableau de bord Supabase.
2. Authentifier Supabase CLI avec un profil autorisé.
3. Lier explicitement le projet de production.
4. Exécuter un export de schéma et de données dans un emplacement chiffré hors du dépôt.
5. Exécuter les migrations et tests sur un projet Supabase de staging.

Les migrations existantes du forum sont conservées sans modification et le tag Git de pré-migration permet de restaurer leur état source.
