-- Les tables ci-dessous sont accessibles uniquement aux routes serveur avec
-- la clé service_role. L'accès direct depuis un navigateur reste refusé par
-- les privilèges SQL et les politiques RLS forcées.
alter table private.contact_requests set schema public;

alter table private.admin_members
  drop constraint if exists admin_members_role_check;
alter table private.admin_members
  add constraint admin_members_role_check
  check (role in ('owner', 'administrator', 'moderator', 'editor', 'viewer'));

alter table public.contact_requests
  add column if not exists fingerprint_hash text
    check (fingerprint_hash is null or char_length(fingerprint_hash) = 64);

create index if not exists contact_requests_fingerprint_created_idx
  on public.contact_requests (fingerprint_hash, created_at desc)
  where fingerprint_hash is not null;

alter table public.contact_requests enable row level security;
alter table public.contact_requests force row level security;

revoke all on public.contact_requests from public, anon, authenticated;
grant select, insert, update, delete on public.contact_requests to service_role;
grant usage, select on all sequences in schema public to service_role;

comment on table public.contact_requests is
  'Demandes de recontact INOX. Accès exclusivement réservé aux routes serveur service_role.';
comment on column public.contact_requests.fingerprint_hash is
  'Empreinte HMAC non réversible utilisée uniquement pour limiter les envois abusifs.';

alter table private.forum_contacts set schema public;
alter table private.forum_blocked_emails set schema public;
alter table private.forum_moderation_events set schema public;
alter table private.audit_logs set schema public;

create or replace function private.forum_reject_blocked_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.forum_blocked_emails as blocked
    where blocked.email_normalized = lower(btrim(new.email))
  ) then
    raise exception 'EMAIL_BLOCKED';
  end if;

  return new;
end;
$$;

create or replace function public.forum_create_message(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_fingerprint_hash text,
  p_body text,
  p_subject text default null,
  p_category text default 'general',
  p_parent_id bigint default null
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_first_name text := btrim(p_first_name);
  v_last_name text := btrim(p_last_name);
  v_email text := lower(btrim(p_email));
  v_body text := btrim(p_body);
  v_subject text := nullif(btrim(p_subject), '');
  v_category text := lower(btrim(p_category));
  v_contact_id bigint;
  v_message_id bigint;
  v_thread_id bigint;
  v_parent public.forum_messages%rowtype;
  v_recent_count integer;
begin
  if char_length(v_first_name) not between 2 and 60
    or char_length(v_last_name) not between 2 and 60
    or char_length(v_email) not between 5 and 254
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(p_fingerprint_hash) <> 64
    or char_length(v_body) not between 10 and 3000
  then
    raise exception 'INVALID_INPUT';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_fingerprint_hash, 0)
  );

  select count(*)::integer into v_recent_count
  from public.forum_messages as message
  join public.forum_contacts as contact on contact.id = message.contact_id
  where contact.fingerprint_hash = p_fingerprint_hash
    and message.created_at >= now() - interval '10 minutes';

  if v_recent_count >= 5 then
    raise exception 'RATE_LIMIT';
  end if;

  if p_parent_id is null then
    if v_subject is null or char_length(v_subject) not between 5 and 140
      or v_category not in ('general', 'conseil', 'support', 'projet')
    then
      raise exception 'INVALID_INPUT';
    end if;
  else
    select * into v_parent
    from public.forum_messages
    where id = p_parent_id and status = 'published';

    if not found then
      raise exception 'PARENT_NOT_FOUND';
    end if;

    v_thread_id := coalesce(v_parent.thread_id, v_parent.id);
    select category into v_category
    from public.forum_messages
    where id = v_thread_id and parent_id is null and status = 'published';

    if not found then
      raise exception 'PARENT_NOT_FOUND';
    end if;

    v_subject := null;
  end if;

  insert into public.forum_contacts (first_name, last_name, email, fingerprint_hash)
  values (v_first_name, v_last_name, v_email, p_fingerprint_hash)
  returning id into v_contact_id;

  insert into public.forum_messages (
    parent_id,
    thread_id,
    contact_id,
    subject,
    category,
    body,
    display_name
  ) values (
    p_parent_id,
    v_thread_id,
    v_contact_id,
    v_subject,
    v_category,
    v_body,
    v_first_name || ' ' || upper(left(v_last_name, 1)) || '.'
  ) returning id into v_message_id;

  return jsonb_build_object('id', v_message_id, 'thread_id', coalesce(v_thread_id, v_message_id));
end;
$$;

alter table public.forum_contacts enable row level security;
alter table public.forum_contacts force row level security;
alter table public.forum_blocked_emails enable row level security;
alter table public.forum_blocked_emails force row level security;
alter table public.forum_moderation_events enable row level security;
alter table public.forum_moderation_events force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;

revoke all on public.forum_contacts from public, anon, authenticated;
revoke all on public.forum_blocked_emails from public, anon, authenticated;
revoke all on public.forum_moderation_events from public, anon, authenticated;
revoke all on public.audit_logs from public, anon, authenticated;

grant select, insert, update, delete on public.forum_contacts to service_role;
grant select, insert, update, delete on public.forum_blocked_emails to service_role;
grant select, insert, update, delete on public.forum_moderation_events to service_role;
grant select, insert on public.audit_logs to service_role;
grant usage, select on all sequences in schema public to service_role;

comment on table public.forum_contacts is
  'Coordonnées privées des auteurs du Forum INOX. Accès routes serveur service_role uniquement.';
comment on table public.forum_blocked_emails is
  'Adresses interdites de publication. Accès routes serveur service_role uniquement.';
comment on table public.forum_moderation_events is
  'Historique des actions de modération. Accès routes serveur service_role uniquement.';
comment on table public.audit_logs is
  'Journal append-only des actions administratives INOX. Accès serveur uniquement.';
