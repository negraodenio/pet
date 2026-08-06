-- =============================================================================
-- COMPAWION OS — Migration 00007: Timeline Immutability Enforcement
-- =============================================================================
-- public.pet_events is the Cognitive Timeline event store. Events may be
-- appended, but their historical content must never be changed or removed.
-- =============================================================================

create or replace function public.prevent_pet_events_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception using
    errcode = '55000',
    message = format('Cognitive Timeline events are immutable: %s is not permitted on public.pet_events.', tg_op);
end;
$$;

create trigger prevent_pet_events_update_or_delete
  before update or delete on public.pet_events
  for each row execute function public.prevent_pet_events_mutation();

create trigger prevent_pet_events_truncate
  before truncate on public.pet_events
  for each statement execute function public.prevent_pet_events_mutation();

-- Keep the invariant active even when a replication role is in use. Database
-- superusers remain trusted administrative actors outside the application trust boundary.
alter table public.pet_events enable always trigger prevent_pet_events_update_or_delete;
alter table public.pet_events enable always trigger prevent_pet_events_truncate;
