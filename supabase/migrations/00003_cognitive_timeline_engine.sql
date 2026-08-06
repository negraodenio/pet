-- =============================================================================
-- COMPAWION OS — Migration 00003: Cognitive Timeline Engine
-- =============================================================================
-- Extends pet_events into a normalized, append-only Cognitive Timeline.
-- Single source of truth feeding Home, Companion, Intelligence, Health,
-- Veterinary, Family, Devices, and Automations.
-- =============================================================================

-- Add new normalized columns to public.pet_events
alter table public.pet_events
  add column if not exists source text not null default 'vision',
  add column if not exists category text not null default 'behavior',
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists observers jsonb default '[]',
  add column if not exists related_events jsonb default '[]',
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Indexes for ultra-fast cognitive queries across domains
create index if not exists idx_pet_events_category
  on public.pet_events (org_id, category, created_at desc);

create index if not exists idx_pet_events_source
  on public.pet_events (org_id, source, created_at desc);

create index if not exists idx_pet_events_pet_category
  on public.pet_events (pet_id, category, created_at desc);

-- Realtime Publication Enablement (if not enabled)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'pet_events'
  ) then
    alter publication supabase_realtime add table public.pet_events;
  end if;
end $$;
