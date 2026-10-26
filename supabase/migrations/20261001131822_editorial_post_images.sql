alter table public.editorial_posts
  add column images jsonb not null default '[]'::jsonb;

alter table public.editorial_posts
  add constraint editorial_posts_images_shape check (
    jsonb_typeof(images) = 'array'
    and jsonb_array_length(images) between 0 and 10
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editorial-media',
  'editorial-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy editorial_media_public_read
on storage.objects for select
to public
using (bucket_id = 'editorial-media');

comment on column public.editorial_posts.images is
  'Illustrations publiques de la publication, stockées dans le bucket editorial-media, dix maximum.';
