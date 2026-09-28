create schema if not exists private;

create table private.forum_contacts (
  id bigint generated always as identity primary key,
  first_name text not null check (char_length(first_name) between 2 and 60),
  last_name text not null check (char_length(last_name) between 2 and 60),
  email text not null check (char_length(email) between 5 and 254),
  fingerprint_hash text not null check (char_length(fingerprint_hash) = 64),
  created_at timestamptz not null default now()
);

create table private.forum_admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 100),
  role text not null default 'moderator' check (role in ('owner', 'moderator', 'editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.forum_messages (
  id bigint generated always as identity primary key,
  parent_id bigint references public.forum_messages(id) on delete cascade,
  thread_id bigint references public.forum_messages(id) on delete cascade,
  contact_id bigint references private.forum_contacts(id) on delete restrict,
  admin_author_id uuid references private.forum_admin_members(user_id) on delete restrict,
  subject text check (subject is null or char_length(subject) between 5 and 140),
  category text not null check (category in ('general', 'conseil', 'support', 'projet')),
  body text not null check (char_length(body) between 10 and 3000),
  display_name text not null check (char_length(display_name) between 2 and 100),
  author_kind text not null default 'visitor' check (author_kind in ('visitor', 'inox')),
  status text not null default 'published' check (status in ('published', 'pending', 'hidden', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint forum_messages_thread_shape check (
    (parent_id is null and thread_id is null and subject is not null)
    or
    (parent_id is not null and thread_id is not null and subject is null)
  ),
  constraint forum_messages_author_shape check (
    (author_kind = 'visitor' and contact_id is not null and admin_author_id is null)
    or
    (author_kind = 'inox' and contact_id is null and admin_author_id is not null)
  )
);

create table private.forum_moderation_events (
  id bigint generated always as identity primary key,
  message_id bigint not null references public.forum_messages(id) on delete cascade,
  admin_user_id uuid not null references private.forum_admin_members(user_id) on delete restrict,
  action text not null check (action in ('published', 'hidden', 'rejected', 'deleted', 'edited', 'official_reply')),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index forum_contacts_fingerprint_created_idx
  on private.forum_contacts (fingerprint_hash, created_at desc);
create index forum_messages_public_feed_idx
  on public.forum_messages (created_at desc, id desc)
  where status = 'published';
create index forum_messages_thread_feed_idx
  on public.forum_messages (thread_id, created_at, id)
  where status = 'published' and thread_id is not null;
create index forum_messages_parent_idx on public.forum_messages (parent_id);
create index forum_messages_contact_idx on public.forum_messages (contact_id);
create index forum_messages_admin_author_idx on public.forum_messages (admin_author_id);
create index forum_moderation_message_idx on private.forum_moderation_events (message_id);
create index forum_moderation_admin_idx on private.forum_moderation_events (admin_user_id);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger forum_messages_touch_updated_at
before update on public.forum_messages
for each row execute function private.touch_updated_at();

create trigger forum_admin_members_touch_updated_at
before update on private.forum_admin_members
for each row execute function private.touch_updated_at();

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

  -- Serialise les envois d'une même empreinte afin que la limite résiste
  -- aussi aux requêtes concurrentes.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_fingerprint_hash, 0)
  );

  select count(*)::integer into v_recent_count
  from public.forum_messages as message
  join private.forum_contacts as contact on contact.id = message.contact_id
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

  insert into private.forum_contacts (first_name, last_name, email, fingerprint_hash)
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

alter table private.forum_contacts enable row level security;
alter table private.forum_contacts force row level security;
alter table private.forum_admin_members enable row level security;
alter table private.forum_admin_members force row level security;
alter table private.forum_moderation_events enable row level security;
alter table private.forum_moderation_events force row level security;
alter table public.forum_messages enable row level security;
alter table public.forum_messages force row level security;

revoke all on schema private from public, anon, authenticated;
revoke all on private.forum_contacts from public, anon, authenticated;
revoke all on private.forum_admin_members from public, anon, authenticated;
revoke all on private.forum_moderation_events from public, anon, authenticated;
revoke all on public.forum_messages from public, anon, authenticated;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function public.forum_create_message(text, text, text, text, text, text, text, bigint) from public, anon, authenticated;

grant usage on schema private to service_role;
grant select, insert, update, delete on private.forum_contacts to service_role;
grant select, insert, update, delete on private.forum_admin_members to service_role;
grant select, insert, update, delete on private.forum_moderation_events to service_role;
grant select, insert, update, delete on public.forum_messages to service_role;
grant usage, select on all sequences in schema private to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function private.touch_updated_at() to service_role;
grant execute on function public.forum_create_message(text, text, text, text, text, text, text, bigint) to service_role;

comment on table private.forum_contacts is 'Contact details submitted for each public forum contribution. Never expose through the public API.';
comment on table private.forum_admin_members is 'Bridge to the future separately deployed INOX administration site.';
comment on table private.forum_moderation_events is 'Audit trail for moderation actions made by the future INOX admin site.';
comment on table public.forum_messages is 'Public forum content. Contact data is deliberately stored in the private schema.';
