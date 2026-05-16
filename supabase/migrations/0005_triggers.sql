-- Lightweight webhook queue. Postgres triggers enqueue events; an edge
-- function can drain this table at intervals (or you can wire pg_net later).
-- Keeping it simple to avoid coupling DB writes to HTTP availability.

create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists webhook_events_unprocessed_idx on webhook_events(created_at) where processed_at is null;

alter table webhook_events enable row level security;
drop policy if exists "webhook_events admin all" on webhook_events;
create policy "webhook_events admin all" on webhook_events
  for all using (is_admin()) with check (is_admin());

create or replace function enqueue_order_event()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into webhook_events (event_type, payload)
    values ('order.created', jsonb_build_object('order_id', new.id, 'order_number', new.order_number));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into webhook_events (event_type, payload)
    values ('order.status_changed', jsonb_build_object(
      'order_id', new.id,
      'order_number', new.order_number,
      'old_status', old.status,
      'new_status', new.status
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists orders_event_trigger on orders;
create trigger orders_event_trigger
  after insert or update on orders
  for each row execute function enqueue_order_event();
