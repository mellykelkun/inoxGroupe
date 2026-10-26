-- Conserver le comptage des visites sans conserver le contenu d'un échange effacé.
create table public.ai_public_session_events (
  id bigint generated always as identity primary key,
  site text not null check (site in ('primary', 'expertise')),
  fingerprint_hash text check (fingerprint_hash is null or char_length(fingerprint_hash) = 64),
  created_at timestamptz not null default now()
);

create index ai_public_session_events_rate_idx
  on public.ai_public_session_events (fingerprint_hash, created_at desc)
  where fingerprint_hash is not null;
create index ai_public_session_events_scrub_idx
  on public.ai_public_session_events (created_at)
  where fingerprint_hash is not null;
create index ai_public_session_events_site_created_idx
  on public.ai_public_session_events (site, created_at desc);

alter table public.ai_public_session_events enable row level security;
alter table public.ai_public_session_events force row level security;
revoke all on public.ai_public_session_events from public, anon, authenticated;
grant select, insert, update, delete on public.ai_public_session_events to service_role;
grant usage, select on sequence public.ai_public_session_events_id_seq to service_role;

insert into public.ai_public_session_events (site, fingerprint_hash, created_at)
select site,
  case when created_at >= now() - interval '15 minutes' then metadata ->> 'fingerprintHash' else null end,
  created_at
from public.ai_conversations
where channel = 'public' and site in ('primary', 'expertise');

create function private.record_ai_public_session_event()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.channel = 'public' and new.site in ('primary', 'expertise') then
    insert into public.ai_public_session_events (site, fingerprint_hash, created_at)
    values (new.site, new.metadata ->> 'fingerprintHash', new.created_at);
  end if;
  return new;
end;
$$;

create trigger ai_conversations_record_public_session
after insert on public.ai_conversations
for each row execute function private.record_ai_public_session_event();

create trigger ai_public_session_events_admin_sync
after insert or update or delete on public.ai_public_session_events
for each statement execute function private.bump_admin_sync_state();

-- Une seule transaction évite de laisser un échange supprimé sans remplacement.
create function public.reset_ai_public_conversation(
  p_conversation_id uuid,
  p_visitor_hash text,
  p_site text,
  p_fingerprint_hash text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_new_id uuid;
begin
  if p_site is null or p_site not in ('primary', 'expertise')
    or coalesce(char_length(p_visitor_hash), 0) <> 64
    or coalesce(char_length(p_fingerprint_hash), 0) <> 64 then
    raise exception 'ASSISTANT_INVALID_RESET';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_fingerprint_hash, 0));
  update public.ai_public_session_events
    set fingerprint_hash = null
    where fingerprint_hash is not null
      and created_at < now() - interval '15 minutes';

  if (select count(*) from public.ai_public_session_events
      where fingerprint_hash = p_fingerprint_hash
        and created_at >= now() - interval '15 minutes') >= 8 then
    raise exception 'ASSISTANT_RATE_LIMIT';
  end if;

  perform 1 from public.ai_conversations
    where id = p_conversation_id
      and channel = 'public'
      and site = p_site
      and visitor_key_hash = p_visitor_hash
    for update;
  if not found then
    raise exception 'ASSISTANT_CONVERSATION_UNAVAILABLE';
  end if;

  insert into public.ai_conversations (channel, site, visitor_key_hash, metadata)
    values ('public', p_site, p_visitor_hash, pg_catalog.jsonb_build_object('fingerprintHash', p_fingerprint_hash, 'dynamicFields', pg_catalog.jsonb_build_array()))
    returning id into v_new_id;

  update public.contact_requests
    set source = case
      when p_site = 'primary' then 'assistant-inox-technologies'
      else 'assistant-inox-expertises'
    end
    where assistant_conversation_id = p_conversation_id;

  delete from public.ai_conversations where id = p_conversation_id;
  return v_new_id;
end;
$$;

revoke all on function public.reset_ai_public_conversation(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.reset_ai_public_conversation(uuid, text, text, text) to service_role;

comment on table public.ai_public_session_events is
  'Compteur de sessions publiques sans transcription ; le hachage anti-abus est effacé après sa fenêtre de quinze minutes à la prochaine activité.';
