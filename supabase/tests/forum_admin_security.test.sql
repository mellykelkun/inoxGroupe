begin;
select plan(7);

select has_table('public', 'forum_blocked_emails', 'La liste de blocage du forum existe');

select ok(
  not has_table_privilege('anon', 'public.forum_blocked_emails', 'select,insert,update,delete'),
  'anon ne peut pas lire ou modifier les adresses bloquees'
);
select ok(
  not has_table_privilege('authenticated', 'public.forum_blocked_emails', 'select,insert,update,delete'),
  'authenticated ne peut pas lire ou modifier directement les adresses bloquees'
);
select ok(
  has_table_privilege('service_role', 'public.forum_blocked_emails', 'select,insert,update,delete'),
  'service_role peut administrer la liste de blocage'
);

select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.forum_blocked_emails'::regclass$$,
  array[true],
  'RLS est activee et forcee pour la liste de blocage'
);

select has_trigger(
  'public',
  'forum_contacts',
  'forum_contacts_reject_blocked_email',
  'Le controle de blocage est branche avant chaque contribution'
);

insert into public.forum_blocked_emails (email, reason)
values ('blocked@example.com', 'Test de moderation');

select throws_ok(
  $$
    insert into public.forum_contacts (first_name, last_name, email, fingerprint_hash)
    values ('Test', 'Bloque', 'BLOCKED@example.com', repeat('a', 64))
  $$,
  'P0001',
  'EMAIL_BLOCKED',
  'Une adresse bloquee ne peut plus contribuer'
);

select * from finish();
rollback;
