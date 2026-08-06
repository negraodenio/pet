-- =============================================================================
-- COMPAWION OS — Migration 00005: Cognitive Reasoning Engine (CRE)
-- =============================================================================
-- Creates the cognitive_reasoning_results table.
-- Deterministic reasoning engine explaining WHY, predicting WHAT MAY HAPPEN,
-- and recommending WHAT TO DO. Multi-tenant via org_id + RLS.
-- =============================================================================

create table if not exists public.cognitive_reasoning_results (
  id                 uuid primary key default gen_random_uuid(),
  pet_id             uuid not null references public.pets(id) on delete cascade,
  org_id             uuid not null references public.organizations(id) on delete cascade,
  generated_at       timestamptz not null default now(),
  reasoning_type     text not null default 'behavior_analysis',
  confidence         real not null default 0.90,
  priority           text not null default 'medium',
  title              text not null,
  summary            text not null,
  evidence           jsonb not null default '[]',
  recommendation     text,
  predicted_outcome  text,
  related_events     jsonb default '[]',
  expires_at         timestamptz,
  status             text not null default 'active',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Indexes for ultra-fast RLS and priority queries
create index if not exists idx_cre_org_priority
  on public.cognitive_reasoning_results (org_id, priority, created_at desc);

create index if not exists idx_cre_pet_status
  on public.cognitive_reasoning_results (pet_id, status, created_at desc);

-- Updated_at trigger
create trigger on_cognitive_reasoning_results_updated
  before update on public.cognitive_reasoning_results
  for each row execute function public.handle_updated_at();

-- Row Level Security (RLS)
alter table public.cognitive_reasoning_results enable row level security;

create policy "Users can view their organization reasoning results"
  on public.cognitive_reasoning_results for select
  using (org_id = public.get_user_org_id());

create policy "Users can insert their organization reasoning results"
  on public.cognitive_reasoning_results for insert
  with check (org_id = public.get_user_org_id());

create policy "Users can update their organization reasoning results"
  on public.cognitive_reasoning_results for update
  using (org_id = public.get_user_org_id());

-- Enable Realtime for cognitive_reasoning_results
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'cognitive_reasoning_results'
  ) then
    alter publication supabase_realtime add table public.cognitive_reasoning_results;
  end if;
end $$;
