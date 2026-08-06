-- =============================================================================
-- COMPAWION OS — Migration 00009: LCM Concurrency & Versioning
-- =============================================================================
-- Adds optimistic concurrency metadata to the mutable LCM read model. Timeline
-- remains immutable; LCM advances only through compare-and-swap updates.
-- =============================================================================

alter table public.living_companion_models
  add column if not exists version bigint not null default 0,
  add column if not exists last_processed_event_id uuid references public.pet_events(id) on delete restrict,
  add column if not exists last_processed_event_created_at timestamptz,
  add column if not exists processing_state text not null default 'idle',
  add column if not exists updated_by text not null default 'system';

alter table public.living_companion_models
  add constraint living_companion_models_version_check
  check (version >= 0),
  add constraint living_companion_models_processing_state_check
  check (processing_state in ('idle', 'processing', 'failed')),
  add constraint living_companion_models_updated_by_check
  check (updated_by in ('guardian', 'system', 'automation', 'device', 'veterinarian', 'administrator'));

-- Existing LCM rows are safely associated with their latest known Timeline
-- event when one exists. Rows without an event remain valid initial baselines.
update public.living_companion_models lcm
set
  last_processed_event_id = event.id,
  last_processed_event_created_at = event.created_at
from public.pet_events event
where event.id = lcm.last_event_id
  and (lcm.last_processed_event_id is null or lcm.last_processed_event_created_at is null);

create index if not exists idx_lcm_last_processed_event
  on public.living_companion_models (last_processed_event_id)
  where last_processed_event_id is not null;

create index if not exists idx_lcm_processing_state
  on public.living_companion_models (processing_state, updated_at asc)
  where processing_state <> 'idle';
