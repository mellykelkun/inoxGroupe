create or replace function public.delete_contact_requests_admin(
  p_ids bigint[],
  p_admin_user_id uuid,
  p_source text,
  p_conversation_id uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_ids bigint[];
  v_count integer;
begin
  select array_agg(distinct id order by id) into v_ids
  from unnest(p_ids) as id;

  if p_admin_user_id is null or p_source not in ('admin_ui', 'admin_assistant')
    or v_ids is null or cardinality(v_ids) > 50 or v_ids[1] <= 0 then
    raise exception 'CONTACT_DELETE_INVALID_INPUT';
  end if;

  select count(*) into v_count
  from public.contact_requests
  where id = any(v_ids);

  if v_count <> cardinality(v_ids) then
    raise exception 'CONTACT_DELETE_NOT_FOUND';
  end if;

  insert into public.audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
  select p_admin_user_id, 'contact_request_deleted', 'contact_request', id::text,
    jsonb_build_object('source', p_source, 'conversation_id', p_conversation_id)
  from unnest(v_ids) as id;

  delete from public.contact_requests where id = any(v_ids);
  return v_count;
end;
$$;

revoke all on function public.delete_contact_requests_admin(bigint[], uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.delete_contact_requests_admin(bigint[], uuid, text, uuid) to service_role;
