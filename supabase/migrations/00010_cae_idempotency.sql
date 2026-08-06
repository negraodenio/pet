-- =============================================================================
-- COMPAWION OS — Migration 00010: CAE Idempotency
-- =============================================================================
-- One logical companion action has one immutable idempotency key and one
-- execution lifecycle. The Action Engine claims execution atomically.
-- =============================================================================

-- Normalize pre-AG-004 lifecycle values before enforcing the state machine.
update public.companion_actions
set status = 'pending'
where status = 'awaiting_approval';

update public.companion_actions
set status = 'cancelled'
where status = 'rejected';

alter table public.companion_actions
  add column if not exists idempotency_key text,
  add column if not exists execution_hash text,
  add column if not exists executed_at timestamptz,
  add column if not exists execution_status text not null default 'pending',
  add column if not exists completed_at timestamptz;

-- Existing actions receive immutable, action-scoped identities without data loss.
update public.companion_actions
set
  idempotency_key = coalesce(idempotency_key, 'legacy:' || id::text),
  execution_hash = coalesce(execution_hash, encode(digest(id::text, 'sha256'), 'hex')),
  execution_status = case
    when status in ('completed', 'failed', 'cancelled') then status
    when status = 'executing' then 'executing'
    else 'pending'
  end,
  completed_at = case
    when status in ('completed', 'failed', 'cancelled') then coalesce(completed_at, updated_at)
    else completed_at
  end;

alter table public.companion_actions
  alter column idempotency_key set not null,
  alter column execution_hash set not null;

alter table public.companion_actions
  add constraint companion_actions_status_check
  check (status in ('pending', 'approved', 'executing', 'completed', 'failed', 'cancelled')),
  add constraint companion_actions_execution_status_check
  check (execution_status in ('pending', 'executing', 'completed', 'failed', 'cancelled'));

create unique index if not exists idx_cae_actions_org_idempotency_key
  on public.companion_actions (org_id, idempotency_key);

create index if not exists idx_cae_actions_execution_status
  on public.companion_actions (org_id, execution_status, created_at asc);

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

  if old.status = 'executing' and new.status in ('completed', 'failed') then
    return new;
  end if;

  raise exception using
    errcode = '23514',
    message = format('Illegal companion action transition: %s -> %s.', old.status, new.status);
end;
$$;

create trigger enforce_companion_action_transition
  before update of status on public.companion_actions
  for each row execute function public.enforce_companion_action_transition();
