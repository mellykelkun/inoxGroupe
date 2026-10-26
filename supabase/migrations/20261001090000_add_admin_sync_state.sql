-- Curseur léger utilisé par le flux SSE de l'interface d'administration.
-- Le navigateur ne reçoit jamais les données métier par ce canal : il reçoit
-- uniquement un signal lui demandant de recharger ses routes authentifiées.
create table public.admin_sync_state (
  scope text primary key check (scope = 'all'),
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.admin_sync_state (scope)
values ('all');

alter table public.admin_sync_state enable row level security;
alter table public.admin_sync_state force row level security;

revoke all on public.admin_sync_state from public, anon, authenticated;
grant select on public.admin_sync_state to service_role;

create or replace function private.bump_admin_sync_state()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_sync_state (scope, revision, updated_at)
  values ('all', 1, now())
  on conflict (scope) do update
    set revision = public.admin_sync_state.revision + 1,
        updated_at = excluded.updated_at;

  return coalesce(new, old);
end;
$$;

revoke all on function private.bump_admin_sync_state() from public, anon, authenticated;
grant execute on function private.bump_admin_sync_state() to service_role;

create trigger contact_requests_admin_sync
after insert or update or delete on public.contact_requests
for each statement execute function private.bump_admin_sync_state();

create trigger forum_messages_admin_sync
after insert or update or delete on public.forum_messages
for each statement execute function private.bump_admin_sync_state();

create trigger forum_blocked_emails_admin_sync
after insert or update or delete on public.forum_blocked_emails
for each statement execute function private.bump_admin_sync_state();

create trigger admin_members_admin_sync
after insert or update or delete on private.admin_members
for each statement execute function private.bump_admin_sync_state();

comment on table public.admin_sync_state is
  'Curseur interne d invalidation pour les interfaces d administration INOX.';
