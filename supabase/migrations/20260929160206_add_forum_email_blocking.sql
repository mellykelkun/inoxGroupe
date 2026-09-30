-- Liste de blocage privée du Forum INOX. Les adresses ne sont jamais
-- exposées au navigateur et le site public reste servi par sa route serveur.
create table private.forum_blocked_emails (
  id bigint generated always as identity primary key,
  email text not null check (char_length(email) between 5 and 254),
  email_normalized text generated always as (lower(btrim(email))) stored,
  reason text check (reason is null or char_length(reason) <= 1000),
  blocked_by uuid references private.admin_members(user_id) on delete set null,
  created_at timestamptz not null default now(),
  unique (email_normalized)
);

create index forum_blocked_emails_created_idx
  on private.forum_blocked_emails (created_at desc);

create or replace function private.forum_reject_blocked_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from private.forum_blocked_emails as blocked
    where blocked.email_normalized = lower(btrim(new.email))
  ) then
    raise exception 'EMAIL_BLOCKED';
  end if;

  return new;
end;
$$;

create trigger forum_contacts_reject_blocked_email
before insert on private.forum_contacts
for each row execute function private.forum_reject_blocked_email();

alter table private.forum_blocked_emails enable row level security;
alter table private.forum_blocked_emails force row level security;

revoke all on private.forum_blocked_emails from public, anon, authenticated;
revoke all on function private.forum_reject_blocked_email() from public, anon, authenticated;

create policy forum_blocked_emails_no_direct_access
on private.forum_blocked_emails for all to anon, authenticated
using (false) with check (false);

grant select, insert, update, delete on private.forum_blocked_emails to service_role;
grant execute on function private.forum_reject_blocked_email() to service_role;
grant usage, select on all sequences in schema private to service_role;

comment on table private.forum_blocked_emails is
  'Adresses interdites de nouvelle publication sur le Forum INOX. Accès serveur uniquement.';
