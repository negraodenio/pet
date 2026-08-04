-- =============================================================================
-- COMPAWION OS v2.0 — Universal Device Hub & Smart Bed Telemetry Schema
-- =============================================================================

-- Smart Bed Telemetry Table
create table if not exists public.smart_bed_telemetry (
  id                uuid primary key default gen_random_uuid(),
  device_id         uuid not null references public.devices(id) on delete cascade,
  pet_id            uuid references public.pets(id) on delete cascade,
  heart_rate_bpm    integer,
  respiration_bpm  integer,
  temperature_c     real,
  weight_kg         real,
  sleep_quality     text, -- 'light', 'deep_rem', 'restless', 'awake'
  pressure_map_data jsonb default '{}',
  presence          boolean default true,
  recorded_at       timestamptz not null default now()
);

create index if not exists idx_smart_bed_pet_time
  on public.smart_bed_telemetry (pet_id, recorded_at desc);

-- Smart Collar Telemetry Table
create table if not exists public.smart_collar_telemetry (
  id                uuid primary key default gen_random_uuid(),
  device_id         uuid not null references public.devices(id) on delete cascade,
  pet_id            uuid references public.pets(id) on delete cascade,
  battery_level     integer,
  step_count        integer,
  activity_index    real,
  location_gps      jsonb default '{}',
  recorded_at       timestamptz not null default now()
);

-- Enable RLS
alter table public.smart_bed_telemetry enable row level security;
alter table public.smart_collar_telemetry enable row level security;

-- RLS Policies
create policy "Users can view smart bed telemetry via pets"
  on public.smart_bed_telemetry for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));

create policy "Users can view smart collar telemetry via pets"
  on public.smart_collar_telemetry for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));
