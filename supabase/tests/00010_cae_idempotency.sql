-- Run against a database with migrations applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00010_cae_idempotency.sql
--
-- The transaction is always rolled back so the assertions leave no records.

begin;

do $$
declare
  test_org_id uuid := gen_random_uuid();
  test_pet_id uuid := gen_random_uuid();
  root_event public.pet_events;
  action public.companion_actions;
  action_idempotency_key text := 'action:test-idempotency-key';
  affected_rows integer;
  execution_count integer;
begin
  insert into public.organizations (id, name, slug)
  values (test_org_id, 'CAE Idempotency Test', test_org_id::text);

  insert into public.pets (id, org_id, name, species)
  values (test_pet_id, test_org_id, 'Action Test Companion', 'dog');

  insert into public.pet_events (org_id, pet_id, event_type, source, actor_id)
  values (test_org_id, test_pet_id, 'barking', 'vision', 'device')
  returning * into root_event;

  insert into public.companion_actions (
    pet_id,
    org_id,
    action_type,
    status,
    correlation_id,
    causation_id,
    trace_id,
    request_id,
    actor_id,
    idempotency_key,
    execution_hash,
    execution_status
  ) values (
    test_pet_id,
    test_org_id,
    'TEST_ACTION',
    'pending',
    root_event.correlation_id,
    root_event.event_id,
    root_event.trace_id,
    root_event.request_id,
    'automation',
    action_idempotency_key,
    encode(digest('test-action', 'sha256'), 'hex'),
    'pending'
  ) returning * into action;

  begin
    insert into public.companion_actions (
      pet_id, org_id, action_type, correlation_id, trace_id, request_id,
      actor_id, idempotency_key, execution_hash
    ) values (
      test_pet_id, test_org_id, 'TEST_ACTION', root_event.correlation_id,
      root_event.trace_id, root_event.request_id, 'automation',
      action_idempotency_key, encode(digest('duplicate-action', 'sha256'), 'hex')
    );
    raise exception 'Duplicate idempotency key unexpectedly inserted a second action.';
  exception
    when unique_violation then
      null;
  end;

  begin
    update public.companion_actions
    set status = 'executing'
    where id = action.id;
    raise exception 'Illegal pending -> executing transition unexpectedly succeeded.';
  exception
    when check_violation then
      null;
  end;

  update public.companion_actions
  set status = 'approved'
  where id = action.id
    and status = 'pending';

  -- First claimant owns execution. A second approval, HTTP retry, or browser
  -- refresh cannot satisfy the same approved/pending claim condition.
  update public.companion_actions
  set
    status = 'executing',
    execution_status = 'executing',
    executed_at = now()
  where id = action.id
    and status = 'approved'
    and execution_status = 'pending';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Initial execution claim did not affect exactly one action.';
  end if;

  update public.companion_actions
  set
    status = 'executing',
    execution_status = 'executing',
    executed_at = now()
  where id = action.id
    and status = 'approved'
    and execution_status = 'pending';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'Duplicate execution claim unexpectedly succeeded.';
  end if;

  insert into public.action_executions (
    action_id, org_id, plugin_name, correlation_id, causation_id, trace_id,
    request_id, actor_id, success
  ) values (
    action.id, test_org_id, 'IdempotencyTestPlugin', root_event.correlation_id,
    root_event.event_id, root_event.trace_id, root_event.request_id,
    'automation', false
  );

  update public.companion_actions
  set
    status = 'failed',
    execution_status = 'failed',
    completed_at = now()
  where id = action.id
    and status = 'executing';

  -- A retry after a failed or timed-out execution returns the existing terminal
  -- record; it never reclaims the action or invokes another plugin execution.
  update public.companion_actions
  set status = 'executing'
  where id = action.id
    and status = 'approved'
    and execution_status = 'pending';
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'Terminal action was incorrectly reclaimed for execution.';
  end if;

  select count(*) into execution_count
  from public.action_executions
  where action_id = action.id;

  if execution_count <> 1 then
    raise exception 'Expected exactly one execution record, found %.', execution_count;
  end if;
end;
$$;

rollback;
