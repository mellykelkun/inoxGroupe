begin;
select plan(27);

select has_table('private', 'admin_members', 'La table commune des administrateurs existe');
select has_table('private', 'contact_requests', 'La table des demandes de contact existe');
select has_table('private', 'newsletter_subscribers', 'La table des abonnés existe');
select has_table('private', 'newsletter_campaigns', 'La table des campagnes existe');
select has_table('private', 'newsletter_deliveries', 'La table des livraisons existe');
select has_table('private', 'audit_logs', 'La table d’audit existe');

select ok(
  not has_table_privilege('anon', 'private.contact_requests', 'select,insert,update,delete'),
  'anon ne peut pas accéder aux demandes de contact'
);
select ok(
  not has_table_privilege('authenticated', 'private.contact_requests', 'select,insert,update,delete'),
  'authenticated ne peut pas accéder directement aux demandes de contact'
);
select ok(
  not has_table_privilege('anon', 'private.newsletter_subscribers', 'select,insert,update,delete'),
  'anon ne peut pas accéder aux abonnés'
);
select ok(
  not has_table_privilege('authenticated', 'private.newsletter_subscribers', 'select,insert,update,delete'),
  'authenticated ne peut pas accéder directement aux abonnés'
);
select ok(
  not has_table_privilege('anon', 'private.newsletter_campaigns', 'select,insert,update,delete'),
  'anon ne peut pas accéder aux campagnes'
);
select ok(
  not has_table_privilege('authenticated', 'private.newsletter_campaigns', 'select,insert,update,delete'),
  'authenticated ne peut pas accéder directement aux campagnes'
);
select ok(
  not has_table_privilege('anon', 'private.newsletter_deliveries', 'select,insert,update,delete'),
  'anon ne peut pas accéder aux livraisons'
);
select ok(
  not has_table_privilege('authenticated', 'private.newsletter_deliveries', 'select,insert,update,delete'),
  'authenticated ne peut pas accéder directement aux livraisons'
);
select ok(
  not has_table_privilege('anon', 'private.audit_logs', 'select,insert,update,delete'),
  'anon ne peut pas accéder au journal d’audit'
);
select ok(
  not has_table_privilege('authenticated', 'private.audit_logs', 'select,insert,update,delete'),
  'authenticated ne peut pas accéder directement au journal d’audit'
);

select ok(has_table_privilege('service_role', 'private.contact_requests', 'select,insert,update,delete'), 'service_role gère les contacts');
select ok(has_table_privilege('service_role', 'private.newsletter_subscribers', 'select,insert,update,delete'), 'service_role gère les abonnés');
select ok(has_table_privilege('service_role', 'private.newsletter_campaigns', 'select,insert,update,delete'), 'service_role gère les campagnes');
select ok(has_table_privilege('service_role', 'private.newsletter_deliveries', 'select,insert,update,delete'), 'service_role gère les livraisons');
select ok(has_table_privilege('service_role', 'private.audit_logs', 'select,insert'), 'service_role peut lire et ajouter des audits');
select ok(not has_table_privilege('service_role', 'private.audit_logs', 'update,delete'), 'le journal d’audit est append-only');

select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'private.contact_requests'::regclass$$,
  array[true],
  'RLS est activée et forcée pour les contacts'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'private.newsletter_subscribers'::regclass$$,
  array[true],
  'RLS est activée et forcée pour les abonnés'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'private.newsletter_campaigns'::regclass$$,
  array[true],
  'RLS est activée et forcée pour les campagnes'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'private.newsletter_deliveries'::regclass$$,
  array[true],
  'RLS est activée et forcée pour les livraisons'
);
select results_eq(
  $$select relrowsecurity and relforcerowsecurity from pg_class where oid = 'private.audit_logs'::regclass$$,
  array[true],
  'RLS est activée et forcée pour les audits'
);

select * from finish();
rollback;
