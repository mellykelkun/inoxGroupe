-- Consomme une confirmation admin de façon atomique : deux requêtes simultanées
-- ne peuvent pas exécuter deux fois la même action.
create function public.claim_ai_admin_action(
  p_conversation_id uuid,
  p_admin_user_id uuid,
  p_token uuid
)
returns jsonb
language plpgsql
set search_path = public, pg_temp
as $$
declare
  pending jsonb;
begin
  select metadata -> 'pendingAction'
    into pending
    from public.ai_conversations
   where id = p_conversation_id
     and channel = 'admin'
     and status = 'open'
     and admin_user_id = p_admin_user_id
     and metadata -> 'pendingAction' ->> 'token' = p_token::text
   for update;

  if pending is null or pending = 'null'::jsonb then
    return null;
  end if;

  update public.ai_conversations
     set metadata = jsonb_set(metadata, '{pendingAction}', 'null'::jsonb, true)
   where id = p_conversation_id;

  return pending;
end;
$$;

revoke all on function public.claim_ai_admin_action(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_ai_admin_action(uuid, uuid, uuid) to service_role;
