-- Les secrets TOTP restent exclusivement dans Supabase Auth. Cette migration
-- ne stocke que l'identité métier et la chaîne d'invitation des administrateurs.
alter table private.admin_members
  add column if not exists invited_by_user_id uuid
    references private.admin_members(user_id) on delete set null,
  add column if not exists invited_at timestamptz,
  add column if not exists activated_at timestamptz;

create index if not exists admin_members_invited_by_idx
  on private.admin_members (invited_by_user_id, created_at desc)
  where invited_by_user_id is not null;

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
    activated_at
  ) values (
    new.id,
    left(v_display_name, 100),
    v_role,
    v_active,
    v_invited_by,
    case when v_invited_by is not null then now() else null end,
    case when new.last_sign_in_at is not null then new.last_sign_in_at else null end
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
after insert or update of raw_app_meta_data, last_sign_in_at on auth.users
for each row execute function private.sync_admin_member_from_auth();

revoke all on function private.sync_admin_member_from_auth()
  from public, anon, authenticated;
grant execute on function private.sync_admin_member_from_auth() to service_role;

comment on function private.sync_admin_member_from_auth() is
  'Synchronise les métadonnées d autorisation Supabase Auth vers la table privée INOX. Ne stocke aucun secret MFA.';
