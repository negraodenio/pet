-- =============================================================================
-- COMPAWION OS — Migration 00006: Companion Action Engine (CAE)
-- =============================================================================
-- Creates companion_actions and action_executions tables.
-- Autonomous execution layer converting reasoning outputs into real-world actions.
-- Multi-tenant via org_id + RLS.
-- =============================================================================

create table if not exists public.companion_actions (
  id                 uuid primary key default gen_random_uuid(),
  pet_id             uuid not null references public.pets(id) on delete cascade,
  org_id             uuid not null references public.organizations(id) on delete cascade,
  reasoning_id       uuid references public.cognitive_reasoning_results(id) on delete set null,
  action_type        text not null,
  priority           text not null default 'medium',
  status             text not null default 'pending',
  requires_approval  boolean not null default false,
  parameters         jsonb not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.action_executions (
  id                 uuid primary key default gen_random_uuid(),
  action_id          uuid not null references public.companion_actions(id) on delete cascade,
  org_id             uuid not null references public.organizations(id) on delete cascade,
  plugin_name        text not null,
  device_id          uuid references public.devices(id) on delete set null,
  execution_time_ms  integer not null default 0,
  success            boolean not null default true,
  error_message      text,
  timeline_event_id  uuid references public.pet_events(id) on delete set null,
  executed_at        timestamptz not null default now()
);

-- Indexes for ultra-fast RLS and execution queries
create index if not exists idx_cae_actions_org_status
  on public.companion_actions (org_id, status, created_at desc);

create index if not exists idx_cae_actions_pet
  on public.companion_actions (pet_id, created_at desc);

create index if not exists idx_cae_executions_action
  on public.action_executions (action_id, executed_at desc);

-- Updated_at triggers
create trigger on_companion_actions_updated
  before update on public.companion_actions
  for each row execute function public.handle_updated_at();

-- Row Level Security (RLS)
alter table public.companion_actions enable row level security;
alter table public.action_executions enable row level security;

create policy "Users can view their organization actions"
  on public.companion_actions for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert their organization actions"
  on public.companion_actions for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can update their organization actions"
  on public.companion_actions for update
  using (org_id = public.get_user_org_id());

create policy "Users can view their organization action executions"
  on public.action_executions for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert their organization action executions"
  on public.action_executions for insert
  with check (org_id = public.get_user_org_id());

-- Enable Realtime for CAE tables
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'companion_actions'
  ) then
    alter publication supabase_realtime add table public.companion_actions;
  end if;
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'action_executions'
  ) then
    alter publication supabase_realtime add table public.action_executions;
  end if;
end $$;
