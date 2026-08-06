-- =============================================================================
-- COMPAWION OS — Migration 00008: Event Identity & Distributed Traceability
-- =============================================================================
-- Adds immutable identity metadata to the Timeline and propagates the same
-- causal context through LCM, CRE, CAE, and action execution records.
-- =============================================================================

-- id remains the canonical event identifier. event_id is a generated alias so
-- existing foreign keys and consumers retain one immutable source of identity.
alter table public.pet_events
  add column if not exists event_id uuid generated always as (id) stored,
  add column if not exists correlation_id uuid not null default gen_random_uuid(),
  add column if not exists causation_id uuid references public.pet_events(id) on delete restrict,
  add column if not exists trace_id uuid not null default gen_random_uuid(),
  add column if not exists request_id uuid not null default gen_random_uuid(),
  add column if not exists actor_id text not null default 'system';

-- Existing events predate distributed identity. The additive column defaults
-- backfill independent immutable root identities without violating AG-001's
-- prohibition on Timeline UPDATE statements.

alter table public.pet_events
  add constraint pet_events_actor_id_check
  check (actor_id in ('guardian', 'system', 'automation', 'device', 'veterinarian', 'administrator'));

-- event_id is guaranteed unique because it is generated from the primary key.
create index if not exists idx_pet_events_correlation_id
  on public.pet_events (correlation_id, created_at asc);

create index if not exists idx_pet_events_trace_id
  on public.pet_events (trace_id, created_at asc);

create index if not exists idx_pet_events_causation_id
  on public.pet_events (causation_id, created_at asc)
  where causation_id is not null;

alter table public.living_companion_models
  add column if not exists correlation_id uuid,
  add column if not exists trace_id uuid,
  add column if not exists request_id uuid;

update public.living_companion_models lcm
set
  correlation_id = event.correlation_id,
  trace_id = event.trace_id,
  request_id = event.request_id
from public.pet_events event
where event.id = lcm.last_event_id
  and (lcm.correlation_id is null or lcm.trace_id is null or lcm.request_id is null);

alter table public.cognitive_reasoning_results
  add column if not exists originating_event_id uuid references public.pet_events(id) on delete restrict,
  add column if not exists correlation_id uuid,
  add column if not exists trace_id uuid,
  add column if not exists request_id uuid;

create index if not exists idx_cre_originating_event_id
  on public.cognitive_reasoning_results (originating_event_id)
  where originating_event_id is not null;

create index if not exists idx_cre_correlation_id
  on public.cognitive_reasoning_results (correlation_id, created_at asc)
  where correlation_id is not null;

alter table public.companion_actions
  add column if not exists correlation_id uuid,
  add column if not exists causation_id uuid references public.pet_events(id) on delete restrict,
  add column if not exists trace_id uuid,
  add column if not exists request_id uuid,
  add column if not exists actor_id text;

update public.companion_actions
set
  correlation_id = coalesce(correlation_id, id),
  trace_id = coalesce(trace_id, id),
  request_id = coalesce(request_id, id),
  actor_id = coalesce(actor_id, 'automation')
where correlation_id is null
   or trace_id is null
   or request_id is null
   or actor_id is null;

alter table public.companion_actions
  alter column correlation_id set not null,
  alter column trace_id set not null,
  alter column request_id set not null,
  alter column actor_id set not null;

alter table public.companion_actions
  add constraint companion_actions_actor_id_check
  check (actor_id in ('guardian', 'system', 'automation', 'device', 'veterinarian', 'administrator'));

create index if not exists idx_cae_actions_correlation_id
  on public.companion_actions (correlation_id, created_at asc);

create index if not exists idx_cae_actions_causation_id
  on public.companion_actions (causation_id, created_at asc)
  where causation_id is not null;

alter table public.action_executions
  add column if not exists correlation_id uuid,
  add column if not exists causation_id uuid references public.pet_events(id) on delete restrict,
  add column if not exists trace_id uuid,
  add column if not exists request_id uuid,
  add column if not exists actor_id text;

update public.action_executions execution
set
  correlation_id = action.correlation_id,
  causation_id = action.causation_id,
  trace_id = action.trace_id,
  request_id = action.request_id,
  actor_id = action.actor_id
from public.companion_actions action
where action.id = execution.action_id
  and (execution.correlation_id is null
    or execution.trace_id is null
    or execution.request_id is null
    or execution.actor_id is null);

alter table public.action_executions
  alter column correlation_id set not null,
  alter column trace_id set not null,
  alter column request_id set not null,
  alter column actor_id set not null;

alter table public.action_executions
  add constraint action_executions_actor_id_check
  check (actor_id in ('guardian', 'system', 'automation', 'device', 'veterinarian', 'administrator'));

create index if not exists idx_cae_executions_correlation_id
  on public.action_executions (correlation_id, executed_at asc);

create index if not exists idx_cae_executions_causation_id
  on public.action_executions (causation_id, executed_at asc)
  where causation_id is not null;

create or replace function public.get_pet_event_chain(root_event_id uuid)
returns setof public.pet_events
language sql
stable
as $$
  with recursive event_chain as (
    select event.*
    from public.pet_events event
    where event.id = root_event_id

    union all

    select parent.*
    from public.pet_events parent
    join event_chain child on child.causation_id = parent.id
  )
  select * from event_chain;
$$;

create or replace function public.get_pet_event_causality_tree(root_event_id uuid)
returns setof public.pet_events
language sql
stable
as $$
  with recursive causality_tree as (
    select event.*
    from public.pet_events event
    where event.id = root_event_id

    union all

    select child.*
    from public.pet_events child
    join causality_tree parent on child.causation_id = parent.id
  )
  select * from causality_tree;
$$;
