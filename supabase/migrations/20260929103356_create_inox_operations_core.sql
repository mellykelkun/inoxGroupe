-- Centralise les membres d'administration avant l'ajout des domaines
-- contacts et newsletter. Le renommage conserve les clés étrangères du forum.
alter table private.forum_admin_members rename to admin_members;
alter trigger forum_admin_members_touch_updated_at
  on private.admin_members rename to admin_members_touch_updated_at;
alter policy forum_admin_members_no_direct_access
  on private.admin_members rename to admin_members_no_direct_access;

alter table private.admin_members
  drop constraint if exists forum_admin_members_role_check;
alter table private.admin_members
  add constraint admin_members_role_check
  check (role in ('owner', 'administrator', 'moderator', 'editor', 'marketing', 'viewer'));

comment on table private.admin_members is
  'Membres autorisés à utiliser les futures interfaces internes INOX.';

create table private.contact_requests (
  id bigint generated always as identity primary key,
  source text not null check (char_length(source) between 2 and 80),
  profile_type text not null check (profile_type in ('entreprise', 'particulier')),
  organization text check (organization is null or char_length(organization) <= 180),
  job_title text check (job_title is null or char_length(job_title) <= 120),
  full_name text not null check (char_length(full_name) between 2 and 140),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null check (char_length(phone) between 5 and 40),
  need_area text not null check (char_length(need_area) between 2 and 180),
  preferred_contact text not null default 'email'
    check (preferred_contact in ('email', 'telephone', 'indifferent')),
  message text not null check (char_length(message) between 10 and 5000),
  consented_at timestamptz not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'completed', 'archived', 'spam')),
  assigned_admin_user_id uuid references private.admin_members(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null check (char_length(email) between 5 and 254),
  full_name text check (full_name is null or char_length(full_name) <= 140),
  source text not null check (char_length(source) between 2 and 80),
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  consented_at timestamptz not null,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_unsubscribe_shape check (
    (status = 'unsubscribed' and unsubscribed_at is not null)
    or
    (status <> 'unsubscribed')
  )
);

create unique index newsletter_subscribers_email_unique_idx
  on private.newsletter_subscribers (lower(email));

create table private.newsletter_campaigns (
  id bigint generated always as identity primary key,
  created_by uuid not null references private.admin_members(user_id) on delete restrict,
  name text not null check (char_length(name) between 2 and 160),
  subject text not null check (char_length(subject) between 2 and 200),
  content jsonb not null default '{}'::jsonb
    check (jsonb_typeof(content) = 'object'),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  provider_campaign_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.newsletter_deliveries (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references private.newsletter_campaigns(id) on delete cascade,
  subscriber_id bigint not null references private.newsletter_subscribers(id) on delete restrict,
  provider_message_id text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed')),
  error_message text check (error_message is null or char_length(error_message) <= 2000),
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, subscriber_id)
);

create table private.audit_logs (
  id bigint generated always as identity primary key,
  admin_user_id uuid references private.admin_members(user_id) on delete set null,
  action text not null check (char_length(action) between 2 and 120),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index contact_requests_status_created_idx
  on private.contact_requests (status, created_at desc);
create index contact_requests_assignee_idx
  on private.contact_requests (assigned_admin_user_id, created_at desc)
  where assigned_admin_user_id is not null;
create index newsletter_subscribers_status_created_idx
  on private.newsletter_subscribers (status, created_at desc);
create index newsletter_campaigns_status_created_idx
  on private.newsletter_campaigns (status, created_at desc);
create index newsletter_deliveries_campaign_status_idx
  on private.newsletter_deliveries (campaign_id, status);
create index newsletter_deliveries_subscriber_idx
  on private.newsletter_deliveries (subscriber_id);
create index audit_logs_admin_created_idx
  on private.audit_logs (admin_user_id, created_at desc)
  where admin_user_id is not null;
create index audit_logs_entity_created_idx
  on private.audit_logs (entity_type, entity_id, created_at desc);

create trigger contact_requests_touch_updated_at
before update on private.contact_requests
for each row execute function private.touch_updated_at();

create trigger newsletter_subscribers_touch_updated_at
before update on private.newsletter_subscribers
for each row execute function private.touch_updated_at();

create trigger newsletter_campaigns_touch_updated_at
before update on private.newsletter_campaigns
for each row execute function private.touch_updated_at();

create trigger newsletter_deliveries_touch_updated_at
before update on private.newsletter_deliveries
for each row execute function private.touch_updated_at();

alter table private.contact_requests enable row level security;
alter table private.contact_requests force row level security;
alter table private.newsletter_subscribers enable row level security;
alter table private.newsletter_subscribers force row level security;
alter table private.newsletter_campaigns enable row level security;
alter table private.newsletter_campaigns force row level security;
alter table private.newsletter_deliveries enable row level security;
alter table private.newsletter_deliveries force row level security;
alter table private.audit_logs enable row level security;
alter table private.audit_logs force row level security;

revoke all on private.contact_requests from public, anon, authenticated;
revoke all on private.newsletter_subscribers from public, anon, authenticated;
revoke all on private.newsletter_campaigns from public, anon, authenticated;
revoke all on private.newsletter_deliveries from public, anon, authenticated;
revoke all on private.audit_logs from public, anon, authenticated;

create policy contact_requests_no_direct_access
on private.contact_requests for all to anon, authenticated
using (false) with check (false);

create policy newsletter_subscribers_no_direct_access
on private.newsletter_subscribers for all to anon, authenticated
using (false) with check (false);

create policy newsletter_campaigns_no_direct_access
on private.newsletter_campaigns for all to anon, authenticated
using (false) with check (false);

create policy newsletter_deliveries_no_direct_access
on private.newsletter_deliveries for all to anon, authenticated
using (false) with check (false);

create policy audit_logs_no_direct_access
on private.audit_logs for all to anon, authenticated
using (false) with check (false);

grant select, insert, update, delete on private.contact_requests to service_role;
grant select, insert, update, delete on private.newsletter_subscribers to service_role;
grant select, insert, update, delete on private.newsletter_campaigns to service_role;
grant select, insert, update, delete on private.newsletter_deliveries to service_role;
grant select, insert on private.audit_logs to service_role;
grant usage, select on all sequences in schema private to service_role;

comment on table private.contact_requests is
  'Demandes de recontact reçues depuis les sites publics INOX.';
comment on table private.newsletter_subscribers is
  'Abonnements et consentements newsletter, sans exposition directe au navigateur.';
comment on table private.newsletter_campaigns is
  'Campagnes préparées pour un futur fournisseur d’envoi transactionnel.';
comment on table private.newsletter_deliveries is
  'État de livraison par campagne et par abonné.';
comment on table private.audit_logs is
  'Journal append-only des futures actions administratives sensibles.';
