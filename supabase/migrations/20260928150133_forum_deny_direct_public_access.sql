-- Le site public passe exclusivement par sa route serveur. Ces politiques
-- rendent l'interdiction d'accès direct explicite, même si des privilèges
-- étaient ajoutés par erreur à anon ou authenticated dans le futur.
create policy "forum_contacts_no_direct_access"
on private.forum_contacts
for all
to anon, authenticated
using (false)
with check (false);

create policy "forum_admin_members_no_direct_access"
on private.forum_admin_members
for all
to anon, authenticated
using (false)
with check (false);

create policy "forum_moderation_events_no_direct_access"
on private.forum_moderation_events
for all
to anon, authenticated
using (false)
with check (false);

create policy "forum_messages_no_direct_access"
on public.forum_messages
for all
to anon, authenticated
using (false)
with check (false);
