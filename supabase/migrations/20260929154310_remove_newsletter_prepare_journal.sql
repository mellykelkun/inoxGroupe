-- Supprime le domaine newsletter, qui ne fait pas partie du produit INOX.
-- Prépare le futur Journal du site Expertises sans activer de publication.
drop table if exists private.newsletter_deliveries;
drop table if exists private.newsletter_campaigns;
drop table if exists private.newsletter_subscribers;

alter table private.contact_requests
  add column if not exists location text
    check (location is null or char_length(location) between 2 and 180),
  add column if not exists project_stage text
    check (project_stage is null or project_stage in ('idee', 'cadrage', 'prestataire', 'deploiement', 'incident')),
  add column if not exists desired_timeline text
    check (desired_timeline is null or desired_timeline in ('urgent', '1-mois', '1-3-mois', '3-mois-plus', 'a-definir')),
  add column if not exists preferred_time text
    check (preferred_time is null or char_length(preferred_time) <= 180);

create table private.journal_articles (
  id bigint generated always as identity primary key,
  created_by uuid references private.admin_members(user_id) on delete set null,
  updated_by uuid references private.admin_members(user_id) on delete set null,
  title text not null check (char_length(title) between 5 and 180),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text check (excerpt is null or char_length(excerpt) <= 500),
  content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(content) = 'object'),
  topic text check (topic is null or char_length(topic) <= 100),
  status text not null default 'draft'
    check (status in ('draft', 'review', 'ready', 'published', 'archived')),
  target_site text not null default 'inox-expertises'
    check (target_site = 'inox-expertises'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (target_site, slug),
  constraint journal_articles_publication_shape check (
    (status = 'published' and published_at is not null)
    or (status <> 'published')
  )
);

create index journal_articles_status_updated_idx
  on private.journal_articles (status, updated_at desc);

create trigger journal_articles_touch_updated_at
before update on private.journal_articles
for each row execute function private.touch_updated_at();

alter table private.journal_articles enable row level security;
alter table private.journal_articles force row level security;

revoke all on private.journal_articles from public, anon, authenticated;

create policy journal_articles_no_direct_access
on private.journal_articles for all to anon, authenticated
using (false) with check (false);

grant select, insert, update, delete on private.journal_articles to service_role;
grant usage, select on all sequences in schema private to service_role;

comment on table private.journal_articles is
  'Brouillons et publications du futur Journal INOX destiné au site Expertises.';
comment on column private.contact_requests.location is
  'Ville et pays communiqués par le demandeur.';
comment on column private.contact_requests.project_stage is
  'État d avancement du besoin ou du projet au moment de la demande.';
comment on column private.contact_requests.desired_timeline is
  'Échéance souhaitée par le demandeur.';
comment on column private.contact_requests.preferred_time is
  'Créneau libre indiqué pour le recontact.';
