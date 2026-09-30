begin;
select plan(24);

select has_table('private', 'admin_members', 'La table commune des administrateurs existe');
select has_table('public', 'contact_requests', 'La table des demandes de recontact existe');
select has_table('private', 'journal_articles', 'La table du futur Journal existe');
select has_table('public', 'audit_logs', 'La table d audit existe');

select ok(to_regclass('private.newsletter_subscribers') is null, 'Aucune table d abonnes newsletter');
select ok(to_regclass('private.newsletter_campaigns') is null, 'Aucune table de campagnes newsletter');
select ok(to_regclass('private.newsletter_deliveries') is null, 'Aucune table de livraisons newsletter');

select ok(
  not has_table_privilege('anon', 'public.contact_requests', 'select,insert,update,delete'),
  'anon ne peut pas acceder aux demandes de recontact'
);
select ok(
  not has_table_privilege('authenticated', 'public.contact_requests', 'select,insert,update,delete'),
  'authenticated ne peut pas acceder directement aux demandes de recontact'
);
select ok(
  not has_table_privilege('anon', 'private.journal_articles', 'select,insert,update,delete'),
  'anon ne peut pas acceder aux brouillons du Journal'
);
select ok(
  not has_table_privilege('authenticated', 'private.journal_articles', 'select,insert,update,delete'),
  'authenticated ne peut pas acceder directement aux brouillons du Journal'
);
select ok(
  not has_table_privilege('anon', 'public.audit_logs', 'select,insert,update,delete'),
  'anon ne peut pas acceder au journal d audit'
);
select ok(
  not has_table_privilege('authenticated', 'public.audit_logs', 'select,insert,update,delete'),
  'authenticated ne peut pas acceder directement au journal d audit'
);

select ok(has_table_privilege('service_role', 'public.contact_requests', 'select,insert,update,delete'), 'service_role gere les contacts');
select ok(has_table_privilege('service_role', 'private.journal_articles', 'select,insert,update,delete'), 'service_role gere le Journal');
select ok(has_table_privilege('service_role', 'public.audit_logs', 'select,insert'), 'service_role peut lire et ajouter des audits');
select ok(not has_table_privilege('service_role', 'public.audit_logs', 'update,delete'), 'le journal d audit est append-only');

select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.contact_requests'::regclass$$,
  array[true],
  'RLS est activee et forcee pour les contacts'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'private.journal_articles'::regclass$$,
  array[true],
  'RLS est activee et forcee pour le Journal'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.audit_logs'::regclass$$,
  array[true],
  'RLS est activee et forcee pour les audits'
);

select has_column('public', 'contact_requests', 'location', 'La localisation du demandeur est conservee');
select has_column('public', 'contact_requests', 'project_stage', 'L avancement du projet est conserve');
select has_column('public', 'contact_requests', 'desired_timeline', 'L echeance souhaitee est conservee');
select has_column('public', 'contact_requests', 'preferred_time', 'Le creneau de recontact est conserve');

select * from finish();
rollback;
