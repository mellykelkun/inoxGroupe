-- Défense en profondeur : les tables restent inaccessibles aux rôles navigateur,
-- même si un privilège était réintroduit par erreur dans le futur.
create policy ai_conversations_no_direct_access
on public.ai_conversations for all to anon, authenticated
using (false) with check (false);

create policy ai_messages_no_direct_access
on public.ai_messages for all to anon, authenticated
using (false) with check (false);
