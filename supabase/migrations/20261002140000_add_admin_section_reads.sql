-- Conserve la dernière consultation de chaque section de notification par administrateur.
create table if not exists public.admin_section_reads (
  admin_user_id uuid not null references private.admin_members(user_id) on delete cascade,
  section text not null check (section in ('contacts', 'forum')),
  last_seen_at timestamptz not null default now(),
  primary key (admin_user_id, section)
);

create index if not exists admin_section_reads_section_idx
  on public.admin_section_reads (section, last_seen_at desc);

alter table public.admin_section_reads enable row level security;
alter table public.admin_section_reads force row level security;

revoke all on public.admin_section_reads from public, anon, authenticated;
grant select, insert, update, delete on public.admin_section_reads to service_role;

drop policy if exists admin_section_reads_no_direct_access on public.admin_section_reads;
create policy admin_section_reads_no_direct_access
on public.admin_section_reads for all to anon, authenticated
using (false) with check (false);

comment on table public.admin_section_reads is
  'Dernière consultation par administrateur des notifications de navigation INOX.';
