-- =============================================================================
-- COMPAWION OS — Migration 00004: Living Companion Model (LCM) Runtime
-- =============================================================================
-- Creates the living_companion_models state table.
-- The single conceptual source of real-time state ("NOW") for every companion.
-- Multi-tenant via org_id + RLS.
-- =============================================================================

create table if not exists public.living_companion_models (
  id                  uuid primary key default gen_random_uuid(),
  pet_id              uuid not null references public.pets(id) on delete cascade unique,
  org_id              uuid not null references public.organizations(id) on delete cascade,
  generated_at        timestamptz not null default now(),
  current_behavior    text not null default 'resting',
  current_activity    text not null default 'normal',
  current_room        text not null default 'Living Room',
  current_emotion     text not null default 'calm',
  stress_score        real not null default 10.0,
  energy_score        real not null default 85.0,
  hydration_score     real not null default 90.0,
  nutrition_score     real not null default 88.0,
  sleep_stage         text not null default 'awake',
  mobility_score      real not null default 98.0,
  vitality_score      real not null default 98.0,
  health_score        real not null default 98.0,
  safety_score        real not null default 100.0,
  confidence          real not null default 0.95,
  learning_progress   real not null default 40.0,
  observer_count      integer not null default 1,
  active_observers    jsonb not null default '["camera_vision"]',
  current_summary     text,
  reasoning_summary   text,
  last_event_id       uuid references public.pet_events(id) on delete set null,
  updated_at          timestamptz not null default now()
);

-- Indexes for ultra-fast RLS queries
create index if not exists idx_lcm_org_pet
  on public.living_companion_models (org_id, pet_id);

-- Updated_at trigger
create trigger on_living_companion_models_updated
  before update on public.living_companion_models
  for each row execute function public.handle_updated_at();

-- Row Level Security (RLS)
alter table public.living_companion_models enable row level security;

create policy "Users can view their organization companion models"
  on public.living_companion_models for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert their organization companion models"
  on public.living_companion_models for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can update their organization companion models"
  on public.living_companion_models for update
  using (org_id = public.get_user_org_id());

-- Enable Realtime for living_companion_models
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'living_companion_models'
  ) then
    alter publication supabase_realtime add table public.living_companion_models;
  end if;
end $$;
