-- Run against a database with migrations applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00008_event_identity.sql
--
-- The transaction is always rolled back so the assertions leave no records.

begin;

do $$
declare
  test_org_id uuid := gen_random_uuid();
  test_pet_id uuid := gen_random_uuid();
  root_event public.pet_events;
  derived_event public.pet_events;
  parallel_event_one public.pet_events;
  parallel_event_two public.pet_events;
  test_lcm public.living_companion_models;
  test_reasoning public.cognitive_reasoning_results;
  test_action public.companion_actions;
  test_execution public.action_executions;
  chain_count integer;
  tree_count integer;
begin
  insert into public.organizations (id, name, slug)
  values (test_org_id, 'Event Identity Test', test_org_id::text);

  insert into public.pets (id, org_id, name, species)
  values (test_pet_id, test_org_id, 'Identity Test Companion', 'dog');

  insert into public.pet_events (
    org_id, event_type, source, actor_id, correlation_id, trace_id, request_id
  ) values (
    test_org_id, 'sleeping', 'vision', 'device', gen_random_uuid(), gen_random_uuid(), gen_random_uuid()
  ) returning * into root_event;

  if root_event.event_id <> root_event.id then
    raise exception 'event_id must be the immutable alias of the canonical event id.';
  end if;

  insert into public.pet_events (
    org_id, event_type, source, actor_id, correlation_id, causation_id, trace_id, request_id
  ) values (
    test_org_id,
    'unusual',
    'automation',
    'automation',
    root_event.correlation_id,
    root_event.event_id,
    root_event.trace_id,
    root_event.request_id
  ) returning * into derived_event;

  if derived_event.correlation_id <> root_event.correlation_id
     or derived_event.trace_id <> root_event.trace_id
     or derived_event.request_id <> root_event.request_id
     or derived_event.causation_id <> root_event.event_id then
    raise exception 'Derived event did not preserve identity context.';
  end if;

  insert into public.living_companion_models (
    pet_id, org_id, last_event_id, correlation_id, trace_id, request_id
  ) values (
    test_pet_id,
    test_org_id,
    derived_event.event_id,
    derived_event.correlation_id,
    derived_event.trace_id,
    derived_event.request_id
  ) returning * into test_lcm;

  if test_lcm.correlation_id <> root_event.correlation_id
     or test_lcm.trace_id <> root_event.trace_id
     or test_lcm.request_id <> root_event.request_id then
    raise exception 'LCM state did not preserve Timeline identity context.';
  end if;

  insert into public.cognitive_reasoning_results (
    pet_id,
    org_id,
    title,
    summary,
    originating_event_id,
    correlation_id,
    trace_id,
    request_id
  ) values (
    test_pet_id,
    test_org_id,
    'Identity reasoning result',
    'Reasoning identity propagation test.',
    derived_event.event_id,
    derived_event.correlation_id,
    derived_event.trace_id,
    derived_event.request_id
  ) returning * into test_reasoning;

  if test_reasoning.originating_event_id <> derived_event.event_id
     or test_reasoning.correlation_id <> root_event.correlation_id then
    raise exception 'CRE result did not preserve originating event identity.';
  end if;

  insert into public.pet_events (org_id, event_type, source, actor_id)
  values (test_org_id, 'eating', 'vision', 'device')
  returning * into parallel_event_one;

  insert into public.pet_events (org_id, event_type, source, actor_id)
  values (test_org_id, 'drinking', 'vision', 'device')
  returning * into parallel_event_two;

  if parallel_event_one.correlation_id = parallel_event_two.correlation_id
     or parallel_event_one.trace_id = parallel_event_two.trace_id
     or parallel_event_one.request_id = parallel_event_two.request_id then
    raise exception 'Independent root events unexpectedly shared generated identity.';
  end if;

  insert into public.companion_actions (
    pet_id,
    org_id,
    action_type,
    correlation_id,
    causation_id,
    trace_id,
    request_id,
    actor_id
  ) values (
    test_pet_id,
    test_org_id,
    'TEST_IDENTITY_ACTION',
    root_event.correlation_id,
    root_event.event_id,
    root_event.trace_id,
    root_event.request_id,
    'automation'
  ) returning * into test_action;

  insert into public.action_executions (
    action_id,
    org_id,
    plugin_name,
    correlation_id,
    causation_id,
    trace_id,
    request_id,
    actor_id
  ) values (
    test_action.id,
    test_org_id,
    'IdentityTestPlugin',
    test_action.correlation_id,
    test_action.causation_id,
    test_action.trace_id,
    test_action.request_id,
    test_action.actor_id
  ) returning * into test_execution;

  if test_execution.correlation_id <> root_event.correlation_id
     or test_execution.causation_id <> root_event.event_id
     or test_execution.trace_id <> root_event.trace_id
     or test_execution.request_id <> root_event.request_id then
    raise exception 'Action execution did not preserve action identity context.';
  end if;

  select count(*) into chain_count
  from public.get_pet_event_chain(derived_event.event_id);

  if chain_count <> 2 then
    raise exception 'Expected derived event chain to include root and child, found %.', chain_count;
  end if;

  select count(*) into tree_count
  from public.get_pet_event_causality_tree(root_event.event_id);

  if tree_count <> 2 then
    raise exception 'Expected causality tree to include root and child, found %.', tree_count;
  end if;
end;
$$;

rollback;
