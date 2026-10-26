create table public.editorial_posts (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 180),
  title text not null check (char_length(title) between 3 and 180),
  excerpt text not null check (char_length(excerpt) between 10 and 500),
  body text not null check (char_length(body) between 10 and 20000),
  category text not null default 'actualite'
    check (category in ('actualite', 'expertise', 'conseil', 'evenement', 'vie-inox')),
  author_name text not null default 'Équipe INOX'
    check (char_length(author_name) between 2 and 100),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_by uuid references private.admin_members(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint editorial_posts_published_shape check (
    (status = 'published' and published_at is not null)
    or status in ('draft', 'archived')
  )
);

create index editorial_posts_public_feed_idx
  on public.editorial_posts (published_at desc, id desc)
  where status = 'published' and published_at is not null;

create index editorial_posts_status_updated_idx
  on public.editorial_posts (status, updated_at desc);

create trigger editorial_posts_touch_updated_at
before update on public.editorial_posts
for each row execute function private.touch_updated_at();

alter table public.editorial_posts enable row level security;
alter table public.editorial_posts force row level security;

revoke all on public.editorial_posts from public, anon, authenticated;
grant select on public.editorial_posts to anon, authenticated;
grant select, insert, update, delete on public.editorial_posts to service_role;
grant usage, select on all sequences in schema public to service_role;

create policy editorial_posts_public_published_read
on public.editorial_posts for select
to anon, authenticated
using (
  status = 'published'
  and published_at is not null
  and published_at <= now()
);

create trigger editorial_posts_admin_sync
after insert or update or delete on public.editorial_posts
for each statement execute function private.bump_admin_sync_state();

grant select on public.admin_sync_state to anon, authenticated;

create policy admin_sync_state_public_read
on public.admin_sync_state for select
to anon, authenticated
using (scope = 'all');

comment on table public.editorial_posts is
  'Publications INOX préparées depuis l interface d administration et visibles après publication.';
