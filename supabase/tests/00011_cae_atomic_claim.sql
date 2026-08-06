-- Run against a database with migrations applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00011_cae_atomic_claim.sql
--
-- The transaction is always rolled back so the assertions leave no records.

begin;

do $$
declare
  test_org_id uuid := gen_random_uuid();
  test_pet_id uuid := gen_random_uuid();
  root_event public.pet_events;
  claimed_action public.companion_actions;
  completed_action public.companion_actions;
  cancelled_action public.companion_actions;
  worker_a_token uuid := gen_random_uuid();
  worker_b_token uuid := gen_random_uuid();
  affected_rows integer;
begin
  insert into public.organizations (id, name, slug)
  values (test_org_id, 'CAE Claim Test', test_org_id::text);

  insert into public.pets (id, org_id, name, species)
  values (test_pet_id, test_org_id, 'Claim Test Companion', 'dog');

  insert into public.pet_events (org_id, pet_id, event_type, source, actor_id)
  values (test_org_id, test_pet_id, 'barking', 'vision', 'device')
  returning * into root_event;

  insert into public.companion_actions (
    pet_id, org_id, action_type, status, correlation_id, causation_id,
    trace_id, request_id, actor_id, idempotency_key, execution_hash
  ) values (
    test_pet_id, test_org_id, 'TEST_CLAIM', 'approved',
    root_event.correlation_id, root_event.event_id, root_event.trace_id,
    root_event.request_id, 'automation', 'action:claim-complete',
    encode(digest('claim-complete', 'sha256'), 'hex')
  ) returning * into claimed_action;

  begin
    update public.companion_actions
    set status = 'executing', execution_status = 'executing'
    where id = claimed_action.id;
    raise exception 'Execution unexpectedly started without a claim token.';
  exception
    when check_violation then
      null;
  end;

  -- Worker A claims the approved action atomically.
  update public.companion_actions
  set
    status = 'executing',
    execution_status = 'executing',
    executed_at = now(),
    claimed_at = now(),
    claimed_by = 'automation',
    claim_token = worker_a_token,
    claim_expires_at = now() + interval '5 minutes',
    execution_worker = 'worker:a'
  where id = claimed_action.id
    and status = 'approved'
    and execution_status = 'pending'
    and claim_token is null;
  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Worker A did not receive exclusive action ownership.';
  end if;

  -- Worker B cannot claim after ownership is established.
  update public.companion_actions
  set
    status = 'executing',
    execution_status = 'executing',
    claimed_at = now(),
    claimed_by = 'automation',
    claim_token = worker_b_token,
    claim_expires_at = now() + interval '5 minutes',
    execution_worker = 'worker:b'
  where id = claimed_action.id
    and status = 'approved'
    and execution_status = 'pending'
    and claim_token is null;
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'Worker B unexpectedly claimed an already owned action.';
  end if;

  -- A different token cannot complete Worker A's execution.
  update public.companion_actions
  set
    status = 'completed',
    execution_status = 'completed',
    completed_at = now(),
    claimed_at = null,
    claimed_by = null,
    claim_expires_at = null,
    execution_worker = null
  where id = claimed_action.id
    and status = 'executing'
    and claim_token = worker_b_token
    and claim_expires_at > now();
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'Non-owner token unexpectedly completed an action.';
  end if;

  -- The owning token completes and releases mutable ownership fields while
  -- retaining the immutable token for audit association.
  update public.companion_actions
  set
    status = 'completed',
    execution_status = 'completed',
    completed_at = now(),
    claimed_at = null,
    claimed_by = null,
    claim_expires_at = null,
    execution_worker = null
  where id = claimed_action.id
    and status = 'executing'
    and claim_token = worker_a_token
    and claim_expires_at > now()
  returning * into completed_action;

  if completed_action.claim_token <> worker_a_token
     or completed_action.claimed_at is not null
     or completed_action.execution_worker is not null then
    raise exception 'Completion did not retain token or release ownership correctly.';
  end if;

  -- An expired lease cannot complete even with the original claim token.
  insert into public.companion_actions (
    pet_id, org_id, action_type, status, execution_status, correlation_id,
    causation_id, trace_id, request_id, actor_id, idempotency_key,
    execution_hash, claimed_at, claimed_by, claim_token, claim_expires_at,
    execution_worker
  ) values (
    test_pet_id, test_org_id, 'TEST_CLAIM_EXPIRED', 'executing', 'executing',
    root_event.correlation_id, root_event.event_id, root_event.trace_id,
    root_event.request_id, 'automation', 'action:claim-expired',
    encode(digest('claim-expired', 'sha256'), 'hex'), now() - interval '10 minutes',
    'automation', gen_random_uuid(), now() - interval '1 minute', 'worker:expired'
  ) returning * into claimed_action;

  update public.companion_actions
  set
    status = 'failed',
    execution_status = 'failed',
    completed_at = now(),
    claimed_at = null,
    claimed_by = null,
    claim_expires_at = null,
    execution_worker = null
  where id = claimed_action.id
    and status = 'executing'
    and claim_token = claimed_action.claim_token
    and claim_expires_at > now();
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'Expired lease unexpectedly finalized an action.';
  end if;

  -- A claimed action can be cancelled only by its live owner and releases its
  -- ownership metadata as a terminal action.
  insert into public.companion_actions (
    pet_id, org_id, action_type, status, execution_status, correlation_id,
    causation_id, trace_id, request_id, actor_id, idempotency_key,
    execution_hash, claimed_at, claimed_by, claim_token, claim_expires_at,
    execution_worker
  ) values (
    test_pet_id, test_org_id, 'TEST_CLAIM_CANCEL', 'executing', 'executing',
    root_event.correlation_id, root_event.event_id, root_event.trace_id,
    root_event.request_id, 'automation', 'action:claim-cancel',
    encode(digest('claim-cancel', 'sha256'), 'hex'), now(),
    'automation', gen_random_uuid(), now() + interval '5 minutes', 'worker:cancel'
  ) returning * into claimed_action;

  update public.companion_actions
  set
    status = 'cancelled',
    execution_status = 'cancelled',
    completed_at = now(),
    claimed_at = null,
    claimed_by = null,
    claim_expires_at = null,
    execution_worker = null
  where id = claimed_action.id
    and status = 'executing'
    and claim_token = claimed_action.claim_token
    and claim_expires_at > now()
  returning * into cancelled_action;

  if cancelled_action.claimed_at is not null
     or cancelled_action.claimed_by is not null
     or cancelled_action.execution_worker is not null then
    raise exception 'Cancelled action did not release ownership.';
  end if;
end;
$$;

rollback;
