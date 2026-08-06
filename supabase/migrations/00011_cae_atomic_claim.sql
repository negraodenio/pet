-- =============================================================================
-- COMPAWION OS — Migration 00011: CAE Atomic Claim & Exclusive Execution
-- =============================================================================
-- A claimed execution belongs to one worker and can only be finalized by the
-- same live claim token. No recovery worker is introduced in this migration.
-- =============================================================================

alter table public.companion_actions
  add column if not exists claimed_at timestamptz,
  add column if not exists claimed_by text,
  add column if not exists claim_token uuid,
  add column if not exists claim_expires_at timestamptz,
  add column if not exists execution_worker text;

-- Historical in-flight actions cannot be safely reassigned. Mark their leases
-- expired while retaining audit identity for later controlled recovery work.
update public.companion_actions
set
  claimed_at = coalesce(claimed_at, executed_at, updated_at),
  claimed_by = coalesce(claimed_by, actor_id),
  claim_token = coalesce(claim_token, gen_random_uuid()),
  claim_expires_at = coalesce(claim_expires_at, now() - interval '1 second'),
  execution_worker = coalesce(execution_worker, 'legacy')
where status = 'executing';

alter table public.companion_actions
  add constraint companion_actions_claimed_by_check
  check (claimed_by is null or claimed_by in ('guardian', 'system', 'automation', 'device', 'veterinarian', 'administrator')),
  add constraint companion_actions_claim_metadata_check
  check (
    (status = 'executing'
      and claimed_at is not null
      and claimed_by is not null
      and claim_token is not null
      and claim_expires_at is not null
      and execution_worker is not null)
    or
    (status <> 'executing'
      and claimed_at is null
      and claimed_by is null
      and claim_expires_at is null
      and execution_worker is null)
  );

create unique index if not exists idx_cae_actions_claim_token
  on public.companion_actions (claim_token)
  where claim_token is not null;

create index if not exists idx_cae_actions_claim_lease
  on public.companion_actions (claim_expires_at asc)
  where status = 'executing';

create or replace function public.enforce_companion_action_transition()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'pending' and new.status in ('approved', 'cancelled') then
    return new;
  end if;

  if old.status = 'approved' and new.status in ('executing', 'cancelled') then
    return new;
  end if;

  if old.status = 'executing' and new.status in ('completed', 'failed', 'cancelled') then
    return new;
  end if;

  raise exception using
    errcode = '23514',
    message = format('Illegal companion action transition: %s -> %s.', old.status, new.status);
end;
$$;

create or replace function public.validate_companion_action_claim()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.claim_token is not null and new.claim_token is distinct from old.claim_token then
    raise exception using
      errcode = '23514',
      message = 'Action claim token is immutable once assigned.';
  end if;

  if old.status = 'approved' and new.status = 'executing' then
    if new.claim_token is null
       or new.claimed_at is null
       or new.claimed_by is null
       or new.claim_expires_at is null
       or new.execution_worker is null
       or new.claim_expires_at <= new.claimed_at then
      raise exception using
        errcode = '23514',
        message = 'Action execution claim requires a valid token, owner, worker, and future lease.';
    end if;
  end if;

  if old.status = 'executing' and new.status = 'executing'
     and (new.claimed_at is distinct from old.claimed_at
       or new.claimed_by is distinct from old.claimed_by
       or new.claim_expires_at is distinct from old.claim_expires_at
       or new.execution_worker is distinct from old.execution_worker) then
    raise exception using
      errcode = '23514',
      message = 'Action ownership metadata is immutable while execution is active.';
  end if;

  if old.status = 'executing' and new.status in ('completed', 'failed', 'cancelled') then
    if old.claim_token is null
       or new.claim_token is distinct from old.claim_token
       or old.claim_expires_at is null
       or old.claim_expires_at <= now() then
      raise exception using
        errcode = '23514',
        message = 'Action completion requires the active claim token and an unexpired lease.';
    end if;
  end if;

  return new;
end;
$$;

create trigger validate_companion_action_claim
  before update on public.companion_actions
  for each row execute function public.validate_companion_action_claim();
