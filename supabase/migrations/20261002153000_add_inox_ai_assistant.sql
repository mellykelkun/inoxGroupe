-- Assistant INOX : conversations conservées côté serveur, accès routes serveur uniquement.
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('public', 'admin')),
  site text not null check (site in ('primary', 'expertise', 'admin')),
  visitor_key_hash text check (visitor_key_hash is null or char_length(visitor_key_hash) = 64),
  admin_user_id uuid references private.admin_members(user_id) on delete set null,
  status text not null default 'open' check (status in ('open', 'closed')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint ai_conversations_owner_shape check (
    (channel = 'public' and visitor_key_hash is not null and admin_user_id is null)
    or
    (channel = 'admin' and visitor_key_hash is null and admin_user_id is not null)
  )
);

create table public.ai_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool', 'system')),
  content text not null check (char_length(content) between 1 and 20000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

alter table public.contact_requests
  add column if not exists assistant_conversation_id uuid
    references public.ai_conversations(id) on delete set null,
  add column if not exists ai_intake_fields jsonb not null default '{}'::jsonb
    check (jsonb_typeof(ai_intake_fields) = 'object');

create index ai_conversations_channel_site_created_idx
  on public.ai_conversations (channel, site, created_at desc);
create index ai_conversations_public_visitor_idx
  on public.ai_conversations (visitor_key_hash, updated_at desc)
  where visitor_key_hash is not null;
create index ai_conversations_admin_updated_idx
  on public.ai_conversations (admin_user_id, updated_at desc)
  where admin_user_id is not null;
create index ai_messages_conversation_created_idx
  on public.ai_messages (conversation_id, created_at asc, id asc);
create index contact_requests_assistant_conversation_idx
  on public.contact_requests (assistant_conversation_id)
  where assistant_conversation_id is not null;

create trigger ai_conversations_touch_updated_at
before update on public.ai_conversations
for each row execute function private.touch_updated_at();

alter table public.ai_conversations enable row level security;
alter table public.ai_conversations force row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_messages force row level security;

revoke all on public.ai_conversations from public, anon, authenticated;
revoke all on public.ai_messages from public, anon, authenticated;
grant select, insert, update, delete on public.ai_conversations to service_role;
grant select, insert, update, delete on public.ai_messages to service_role;
grant usage, select on all sequences in schema public to service_role;

comment on table public.ai_conversations is
  'Conversations de l assistant INOX. Les échanges publics restent accessibles aux rapports admin, sans accès direct au navigateur.';
comment on table public.ai_messages is
  'Messages des assistants INOX. Accès exclusivement réservé aux routes serveur.';
comment on column public.contact_requests.ai_intake_fields is
  'Champs complémentaires, bornés et validés, demandés pendant une conversation assistant.';

create trigger ai_conversations_admin_sync
after insert or update or delete on public.ai_conversations
for each statement execute function private.bump_admin_sync_state();

create trigger ai_messages_admin_sync
after insert or update or delete on public.ai_messages
for each statement execute function private.bump_admin_sync_state();
