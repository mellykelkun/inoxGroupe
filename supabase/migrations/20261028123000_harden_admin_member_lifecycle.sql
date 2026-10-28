-- Le compte Supabase Auth peut être supprimé sans effacer l'identité métier
-- historique. Les actions déjà auditées restent donc attribuables, tandis que
-- les identifiants, sessions et facteurs MFA sont supprimés d'Auth.
alter table private.admin_members
  add column if not exists deleted_at timestamptz;

alter table private.admin_members
  drop constraint if exists forum_admin_members_user_id_fkey;

create or replace function private.sync_admin_member_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := new.raw_app_meta_data ->> 'inox_admin_role';
  v_active boolean := coalesce((new.raw_app_meta_data ->> 'inox_admin_active')::boolean, false);
  v_display_name text := nullif(btrim(new.raw_app_meta_data ->> 'inox_admin_display_name'), '');
  v_invited_by uuid;
  v_activated_at timestamptz;
begin
  if v_role is null then
    return new;
  end if;

  if v_role not in ('owner', 'administrator', 'moderator', 'editor', 'viewer') then
    raise exception 'INVALID_INOX_ADMIN_ROLE';
  end if;

  if (new.raw_app_meta_data ->> 'inox_admin_invited_by')
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  then
    v_invited_by := (new.raw_app_meta_data ->> 'inox_admin_invited_by')::uuid;
  end if;

  begin
    v_activated_at := nullif(new.raw_app_meta_data ->> 'inox_admin_activated_at', '')::timestamptz;
  exception when others then
    v_activated_at := null;
  end;

  if v_display_name is null then
    v_display_name := split_part(coalesce(new.email, 'Membre INOX'), '@', 1);
  end if;

  insert into private.admin_members (
    user_id,
    display_name,
    role,
    active,
    invited_by_user_id,
    invited_at,
    activated_at,
    deleted_at
  ) values (
    new.id,
    left(v_display_name, 100),
    v_role,
    v_active,
    v_invited_by,
    case when v_invited_by is not null then now() else null end,
    v_activated_at,
    null
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    role = excluded.role,
    active = excluded.active,
    invited_by_user_id = coalesce(private.admin_members.invited_by_user_id, excluded.invited_by_user_id),
    invited_at = coalesce(private.admin_members.invited_at, excluded.invited_at),
    activated_at = coalesce(private.admin_members.activated_at, excluded.activated_at),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_inox_admin_member on auth.users;
create trigger sync_inox_admin_member
after insert or update of raw_app_meta_data on auth.users
for each row execute function private.sync_admin_member_from_auth();

create or replace function private.mark_admin_member_deleted_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.admin_members
  set active = false,
      deleted_at = coalesce(deleted_at, now()),
      updated_at = now()
  where user_id = old.id;
  return old;
end;
$$;

drop trigger if exists mark_inox_admin_member_deleted on auth.users;
create trigger mark_inox_admin_member_deleted
after delete on auth.users
for each row execute function private.mark_admin_member_deleted_from_auth();

revoke all on function private.sync_admin_member_from_auth()
  from public, anon, authenticated;
grant execute on function private.sync_admin_member_from_auth() to service_role;
revoke all on function private.mark_admin_member_deleted_from_auth()
  from public, anon, authenticated;
grant execute on function private.mark_admin_member_deleted_from_auth() to service_role;

comment on column private.admin_members.deleted_at is
  'Date de suppression du compte Auth. La ligne métier reste une trace d audit sans identifiants de connexion.';
comment on function private.sync_admin_member_from_auth() is
  'Synchronise les autorisations Auth. L activation est confirmée explicitement après vérification MFA.';
comment on function private.mark_admin_member_deleted_from_auth() is
  'Conserve une identité métier inactive lorsque le compte Auth, ses sessions et ses facteurs sont supprimés.';

-- Index des clés étrangères relevées par le conseiller de performance.
create index if not exists journal_articles_created_by_idx
  on private.journal_articles (created_by)
  where created_by is not null;
create index if not exists journal_articles_updated_by_idx
  on private.journal_articles (updated_by)
  where updated_by is not null;
create index if not exists editorial_posts_created_by_idx
  on public.editorial_posts (created_by)
  where created_by is not null;
create index if not exists forum_blocked_emails_blocked_by_idx
  on public.forum_blocked_emails (blocked_by)
  where blocked_by is not null;
