-- Retire exclusivement l'ancien jeu de démonstration identifiable par sa
-- plage d'identifiants, ses dates fixes et ses pseudonymes communautaires.
-- Les contributions réelles antérieures (identifiants 2 et 3) sont conservées.
delete from public.forum_messages
where id between 4 and 96
  and created_at >= timestamptz '2026-09-13 00:00:00+00'
  and created_at < timestamptz '2026-09-29 00:00:00+00'
  and display_name ~ '^(Communauté|Community|Comunidade) ';

delete from public.forum_contacts as contact
where contact.created_at >= timestamptz '2026-09-13 00:00:00+00'
  and contact.created_at < timestamptz '2026-09-29 00:00:00+00'
  and contact.first_name in ('Communauté', 'Community', 'Comunidade')
  and not exists (
    select 1
    from public.forum_messages as message
    where message.contact_id = contact.id
  );
