drop policy if exists admin_sync_state_editorial_read
on public.admin_sync_state;

drop policy if exists admin_sync_state_admin_read
on public.admin_sync_state;

create policy admin_sync_state_read
on public.admin_sync_state for select
to anon, authenticated
using (
  scope = 'editorial'
  or (scope = 'all' and (select auth.uid()) is not null)
);
