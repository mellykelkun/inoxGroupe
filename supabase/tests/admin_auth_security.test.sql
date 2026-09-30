begin;
select plan(10);

select has_column('private', 'admin_members', 'invited_by_user_id', 'Le membre conserve l identifiant de son invitant');
select has_column('private', 'admin_members', 'invited_at', 'La date d invitation est conservee');
select has_column('private', 'admin_members', 'activated_at', 'La date d activation est conservee');

select has_function('private', 'sync_admin_member_from_auth', array[]::text[], 'La fonction de synchronisation Auth existe');
select function_lang_is('private', 'sync_admin_member_from_auth', array[]::text[], 'plpgsql', 'La synchronisation utilise plpgsql');
select ok(
  (
    select procedure.prosecdef
    from pg_proc as procedure
    join pg_namespace as namespace on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'private'
      and procedure.proname = 'sync_admin_member_from_auth'
      and procedure.pronargs = 0
  ),
  'La synchronisation est executee avec des droits controles'
);

select ok(
  exists (
    select 1
    from pg_trigger as trigger
    join pg_class as relation on relation.oid = trigger.tgrelid
    join pg_namespace as relation_namespace on relation_namespace.oid = relation.relnamespace
    join pg_proc as procedure on procedure.oid = trigger.tgfoid
    join pg_namespace as procedure_namespace on procedure_namespace.oid = procedure.pronamespace
    where relation_namespace.nspname = 'auth'
      and relation.relname = 'users'
      and trigger.tgname = 'sync_inox_admin_member'
      and procedure_namespace.nspname = 'private'
      and procedure.proname = 'sync_admin_member_from_auth'
  ),
  'Le profil prive est synchronise depuis Supabase Auth'
);

select ok(
  not has_function_privilege('anon', 'private.sync_admin_member_from_auth()', 'execute'),
  'anon ne peut pas executer la synchronisation'
);
select ok(
  not has_function_privilege('authenticated', 'private.sync_admin_member_from_auth()', 'execute'),
  'authenticated ne peut pas executer la synchronisation'
);
select ok(
  has_function_privilege('service_role', 'private.sync_admin_member_from_auth()', 'execute'),
  'service_role peut executer la synchronisation'
);

select * from finish();
rollback;
