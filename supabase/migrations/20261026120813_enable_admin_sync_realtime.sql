-- Le site public n'a besoin que des changements éditoriaux. L'administration
-- conserve le curseur global pour actualiser ses modules protégés.
alter table public.admin_sync_state
drop constraint admin_sync_state_scope_check;

alter table public.admin_sync_state
add constraint admin_sync_state_scope_check
check (scope in ('all', 'editorial'));

insert into public.admin_sync_state (scope)
values ('editorial')
on conflict (scope) do nothing;

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

  if tg_table_schema = 'public' and tg_table_name = 'editorial_posts' then
    insert into public.admin_sync_state (scope, revision, updated_at)
    values ('editorial', 1, now())
    on conflict (scope) do update
      set revision = public.admin_sync_state.revision + 1,
          updated_at = excluded.updated_at;
  end if;

  return coalesce(new, old);
end;
$$;

drop policy if exists admin_sync_state_public_read
on public.admin_sync_state;

create policy admin_sync_state_editorial_read
on public.admin_sync_state for select
to anon, authenticated
using (scope = 'editorial');

create policy admin_sync_state_admin_read
on public.admin_sync_state for select
to authenticated
using (scope = 'all');

-- Supabase Realtime diffuse uniquement ces curseurs d'invalidation. Les
-- données métier restent chargées par les routes de chaque application.
alter publication supabase_realtime
add table public.admin_sync_state;
