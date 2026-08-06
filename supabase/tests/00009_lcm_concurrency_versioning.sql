-- Run against a database with migrations applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00009_lcm_concurrency_versioning.sql
--
-- The transaction is always rolled back so the assertions leave no records.

begin;

do $$
declare
  test_org_id uuid := gen_random_uuid();
  test_pet_id uuid := gen_random_uuid();
  first_event public.pet_events;
  newer_event public.pet_events;
  older_event public.pet_events;
  lcm public.living_companion_models;
  concurrent_update_count integer;
  retry_attempt integer;
begin
  insert into public.organizations (id, name, slug)
  values (test_org_id, 'LCM Concurrency Test', test_org_id::text);

  insert into public.pets (id, org_id, name, species)
  values (test_pet_id, test_org_id, 'Concurrency Test Companion', 'dog');

  insert into public.pet_events (
    org_id, pet_id, event_type, source, actor_id, created_at
  ) values (
    test_org_id, test_pet_id, 'sleeping', 'vision', 'device', '2026-01-01T00:00:00Z'
  ) returning * into first_event;

  insert into public.pet_events (
    org_id, pet_id, event_type, source, actor_id, created_at
  ) values (
    test_org_id, test_pet_id, 'eating', 'vision', 'device', '2026-01-01T00:02:00Z'
  ) returning * into newer_event;

  insert into public.pet_events (
    org_id, pet_id, event_type, source, actor_id, created_at
  ) values (
    test_org_id, test_pet_id, 'drinking', 'vision', 'device', '2026-01-01T00:01:00Z'
  ) returning * into older_event;

  insert into public.living_companion_models (pet_id, org_id)
  values (test_pet_id, test_org_id)
  returning * into lcm;

  if lcm.version <> 0 then
    raise exception 'New LCM state must start at version 0, found %.', lcm.version;
  end if;

  -- First writer advances version 0 -> 1.
  update public.living_companion_models
  set
    version = 1,
    energy_score = 90,
    last_event_id = first_event.id,
    last_processed_event_id = first_event.id,
    last_processed_event_created_at = first_event.created_at,
    correlation_id = first_event.correlation_id,
    trace_id = first_event.trace_id,
    request_id = first_event.request_id,
    updated_by = first_event.actor_id
  where id = lcm.id
    and version = 0;

  -- A competing writer with stale expected version 0 must affect no rows.
  update public.living_companion_models
  set version = 1, hydration_score = 100
  where id = lcm.id
    and version = 0;
  get diagnostics concurrent_update_count = row_count;

  if concurrent_update_count <> 0 then
    raise exception 'Stale compare-and-swap unexpectedly modified LCM state.';
  end if;

  -- Reload/retry with expected version 1 preserves the first update and
  -- advances the version exactly once more.
  update public.living_companion_models
  set
    version = 2,
    hydration_score = 100,
    last_event_id = newer_event.id,
    last_processed_event_id = newer_event.id,
    last_processed_event_created_at = newer_event.created_at,
    correlation_id = newer_event.correlation_id,
    trace_id = newer_event.trace_id,
    request_id = newer_event.request_id,
    updated_by = newer_event.actor_id
  where id = lcm.id
    and version = 1;

  select * into lcm
  from public.living_companion_models
  where id = lcm.id;

  if lcm.version <> 2 or lcm.energy_score <> 90 or lcm.hydration_score <> 100 then
    raise exception 'Retry did not preserve both concurrent LCM state changes.';
  end if;

  if lcm.last_processed_event_id <> newer_event.id then
    raise exception 'LCM did not retain the latest processed event identity.';
  end if;

  -- Duplicate delivery does not satisfy the "unprocessed event" condition and
  -- therefore cannot advance the version.
  update public.living_companion_models
  set version = 3
  where id = lcm.id
    and version = 2
    and last_processed_event_id <> newer_event.id;
  get diagnostics concurrent_update_count = row_count;

  if concurrent_update_count <> 0 then
    raise exception 'Duplicate event unexpectedly advanced LCM version.';
  end if;

  -- An event older than the latest processed timestamp cannot satisfy the
  -- application ordering precondition for a state transition.
  update public.living_companion_models
  set version = 3
  where id = lcm.id
    and version = 2
    and last_processed_event_created_at <= older_event.created_at;
  get diagnostics concurrent_update_count = row_count;

  if concurrent_update_count <> 0 then
    raise exception 'Out-of-order event unexpectedly advanced LCM version.';
  end if;

  -- Three stale compare-and-swap attempts remain deterministic conflicts and
  -- leave the state unchanged, matching the service retry limit.
  for retry_attempt in 1..3 loop
    update public.living_companion_models
    set version = 3
    where id = lcm.id
      and version = 0;
    get diagnostics concurrent_update_count = row_count;

    if concurrent_update_count <> 0 then
      raise exception 'Stale retry attempt % unexpectedly modified LCM state.', retry_attempt;
    end if;
  end loop;

  select * into lcm
  from public.living_companion_models
  where id = lcm.id;

  if lcm.version <> 2 then
    raise exception 'Retry exhaustion changed LCM version.';
  end if;
end;
$$;

rollback;
