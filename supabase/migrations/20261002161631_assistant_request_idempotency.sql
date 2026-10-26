-- Une retransmission réseau ne doit pas créer deux demandes pour le même échange.
create unique index contact_requests_one_per_assistant_conversation
  on public.contact_requests (assistant_conversation_id)
  where assistant_conversation_id is not null;
