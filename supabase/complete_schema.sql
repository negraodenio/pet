
-- ==========================================
-- FILE: 00001_initial_schema.sql
-- ==========================================
-- =============================================================================
-- COMPAWION OS — Initial Database Schema
-- =============================================================================
-- Deployed via Supabase Migrations
-- Multi-tenant via org_id + Row Level Security (RLS)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Custom Types
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('owner', 'admin', 'member', 'viewer');

create type public.pet_species as enum ('dog', 'cat');

create type public.pet_sex as enum ('male', 'female', 'neutered_male', 'spayed_female');

create type public.device_type as enum (
  'camera', 'tablet', 'collar', 'feeder', 'water_station', 'scale'
);

create type public.device_status as enum ('online', 'offline', 'updating', 'error');

create type public.event_type as enum (
  'sleeping', 'eating', 'drinking', 'barking', 'whining',
  'vomiting', 'garbage', 'danger', 'destroying', 'scratching',
  'anxiety', 'limping', 'seizure', 'inactivity', 'unusual',
  'leaving_zone', 'interaction_pet', 'interaction_stranger'
);

create type public.event_severity as enum ('info', 'warning', 'critical');

create type public.action_type as enum (
  'play_music', 'play_voice', 'adjust_feeder', 'notify_owner'
);

create type public.action_status as enum (
  'pending', 'executing', 'completed', 'failed', 'escalated'
);

create type public.notification_priority as enum ('low', 'medium', 'high', 'critical');

create type public.notification_channel as enum ('push', 'websocket', 'email');

create type public.delivery_status as enum ('pending', 'sent', 'delivered', 'failed');

create type public.subscription_plan as enum ('free', 'essential', 'premium', 'enterprise');

create type public.subscription_status as enum ('active', 'past_due', 'canceled', 'trialing');

create type public.message_role as enum ('user', 'assistant', 'system');


-- ---------------------------------------------------------------------------
-- 1. Organizations (Multi-tenant root)
-- ---------------------------------------------------------------------------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  settings    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_organizations_slug on public.organizations (slug);


-- ---------------------------------------------------------------------------
-- 2. Profiles (extends Supabase Auth users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid not null references public.organizations(id) on delete cascade,
  display_name  text not null,
  avatar_url    text,
  role          public.user_role not null default 'member',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_profiles_org on public.profiles (org_id);


-- ---------------------------------------------------------------------------
-- 3. Pets
-- ---------------------------------------------------------------------------
create table public.pets (
  id                    uuid primary key default gen_random_uuid(),
  org_id                uuid not null references public.organizations(id) on delete cascade,
  name                  text not null,
  species               public.pet_species not null,
  breed                 text,
  birth_date            date,
  weight_kg             real,
  sex                   public.pet_sex,
  avatar_url            text,
  identity_embeddings   jsonb default '{}',
  preferences           jsonb default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_pets_org on public.pets (org_id);


-- ---------------------------------------------------------------------------
-- 4. Pet Profiles (AI-computed behavioral baseline)
-- ---------------------------------------------------------------------------
create table public.pet_profiles (
  id                      uuid primary key default gen_random_uuid(),
  pet_id                  uuid not null references public.pets(id) on delete cascade unique,
  normal_sleep_hours      jsonb default '{}',
  normal_activity_level   jsonb default '{}',
  normal_eating_pattern   jsonb default '{}',
  normal_water_intake     jsonb default '{}',
  favorite_locations      jsonb default '[]',
  walking_patterns        jsonb default '{}',
  barking_patterns        jsonb default '{}',
  daily_routine           jsonb default '{}',
  last_computed           timestamptz
);


-- ---------------------------------------------------------------------------
-- 5. Devices
-- ---------------------------------------------------------------------------
create table public.devices (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations(id) on delete cascade,
  serial_number     text not null unique,
  device_type       public.device_type not null,
  name              text not null,
  firmware_version  text,
  status            public.device_status not null default 'offline',
  hardware_info     jsonb default '{}',
  last_heartbeat    timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_devices_org on public.devices (org_id);
create index idx_devices_status on public.devices (org_id, status);


-- ---------------------------------------------------------------------------
-- 6. Device Locations
-- ---------------------------------------------------------------------------
create table public.device_locations (
  id                 uuid primary key default gen_random_uuid(),
  device_id          uuid not null references public.devices(id) on delete cascade,
  location_name      text not null,
  position_metadata  jsonb default '{}',
  assigned_at        timestamptz not null default now()
);

create index idx_device_locations_device on public.device_locations (device_id);


-- ---------------------------------------------------------------------------
-- 7. Pet Events (Core — append-only event log)
-- ---------------------------------------------------------------------------
create table public.pet_events (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  pet_id              uuid references public.pets(id) on delete set null,
  device_id           uuid references public.devices(id) on delete set null,
  event_type          public.event_type not null,
  severity            public.event_severity not null default 'info',
  confidence          real not null default 0.0,
  metadata            jsonb default '{}',
  video_clip_url      text,
  thumbnail_url       text,
  recommended_action  text,
  ai_resolved         boolean not null default false,
  started_at          timestamptz,
  ended_at            timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_pet_events_pet_type on public.pet_events (pet_id, event_type, created_at desc);
create index idx_pet_events_org_time on public.pet_events (org_id, created_at desc);
create index idx_pet_events_severity on public.pet_events (org_id, severity, created_at desc);


-- ---------------------------------------------------------------------------
-- 8. Event Clips
-- ---------------------------------------------------------------------------
create table public.event_clips (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.pet_events(id) on delete cascade,
  storage_path      text not null,
  duration_seconds  integer,
  format            text not null default 'mp4',
  size_bytes        bigint,
  created_at        timestamptz not null default now()
);

create index idx_event_clips_event on public.event_clips (event_id);


-- ---------------------------------------------------------------------------
-- 9. Event Annotations (AI detection data)
-- ---------------------------------------------------------------------------
create table public.event_annotations (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references public.pet_events(id) on delete cascade,
  annotation_type  text not null,
  data             jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

create index idx_event_annotations_event on public.event_annotations (event_id);


-- ---------------------------------------------------------------------------
-- 10. Autonomous Actions
-- ---------------------------------------------------------------------------
create table public.autonomous_actions (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.pet_events(id) on delete cascade,
  action_type  public.action_type not null,
  status       public.action_status not null default 'pending',
  parameters   jsonb default '{}',
  result       jsonb default '{}',
  executed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_autonomous_actions_event on public.autonomous_actions (event_id);


-- ---------------------------------------------------------------------------
-- 11. Health Metrics
-- ---------------------------------------------------------------------------
create table public.health_metrics (
  id             uuid primary key default gen_random_uuid(),
  pet_id         uuid not null references public.pets(id) on delete cascade,
  metric_type    text not null,
  value          real not null,
  unit           text not null,
  measured_date  date not null default current_date,
  created_at     timestamptz not null default now()
);

create index idx_health_metrics_pet_type_date
  on public.health_metrics (pet_id, metric_type, measured_date desc);


-- ---------------------------------------------------------------------------
-- 12. Behavior Baselines (AI-computed per pet)
-- ---------------------------------------------------------------------------
create table public.behavior_baselines (
  id                    uuid primary key default gen_random_uuid(),
  pet_id                uuid not null references public.pets(id) on delete cascade,
  metric_type           text not null,
  mean_value            real not null default 0,
  std_deviation         real not null default 0,
  min_value             real not null default 0,
  max_value             real not null default 0,
  sample_count          integer not null default 0,
  hourly_distribution   jsonb default '[]',
  weekly_distribution   jsonb default '[]',
  computed_at           timestamptz not null default now(),

  unique (pet_id, metric_type)
);

create index idx_behavior_baselines_pet on public.behavior_baselines (pet_id);


-- ---------------------------------------------------------------------------
-- 13. Timeline Entries
-- ---------------------------------------------------------------------------
create table public.timeline_entries (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references public.pets(id) on delete cascade,
  event_id      uuid references public.pet_events(id) on delete set null,
  entry_type    text not null,
  title         text not null,
  description   text,
  thumbnail_url text,
  metadata      jsonb default '{}',
  occurred_at   timestamptz not null default now()
);

create index idx_timeline_pet_time on public.timeline_entries (pet_id, occurred_at desc);


-- ---------------------------------------------------------------------------
-- 14. Medical Records
-- ---------------------------------------------------------------------------
create table public.medical_records (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  record_type  text not null,
  title        text not null,
  description  text,
  record_date  date not null default current_date,
  attachments  jsonb default '[]',
  created_at   timestamptz not null default now()
);

create index idx_medical_records_pet on public.medical_records (pet_id, record_date desc);


-- ---------------------------------------------------------------------------
-- 15. Notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_id    uuid references public.pet_events(id) on delete set null,
  title       text not null,
  body        text not null,
  priority    public.notification_priority not null default 'medium',
  read        boolean not null default false,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_unread
  on public.notifications (user_id, created_at desc) where not read;


-- ---------------------------------------------------------------------------
-- 16. Notification Deliveries
-- ---------------------------------------------------------------------------
create table public.notification_deliveries (
  id                uuid primary key default gen_random_uuid(),
  notification_id   uuid not null references public.notifications(id) on delete cascade,
  channel           public.notification_channel not null,
  status            public.delivery_status not null default 'pending',
  sent_at           timestamptz
);


-- ---------------------------------------------------------------------------
-- 17. Notification Preferences
-- ---------------------------------------------------------------------------
create table public.notification_preferences (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  event_type            public.event_type not null,
  enabled               boolean not null default true,
  min_priority          public.notification_priority not null default 'low',
  quiet_hours_enabled   boolean not null default false,
  quiet_start           time,
  quiet_end             time,

  unique (user_id, event_type)
);


-- ---------------------------------------------------------------------------
-- 18. Conversations (AI Assistant)
-- ---------------------------------------------------------------------------
create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_conversations_user on public.conversations (user_id, updated_at desc);


-- ---------------------------------------------------------------------------
-- 19. Messages (AI Assistant)
-- ---------------------------------------------------------------------------
create table public.messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.conversations(id) on delete cascade,
  role              public.message_role not null,
  content           text not null,
  tool_calls        jsonb,
  tool_results      jsonb,
  created_at        timestamptz not null default now()
);

create index idx_messages_conversation on public.messages (conversation_id, created_at asc);


-- ---------------------------------------------------------------------------
-- 20. Subscriptions
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references public.organizations(id) on delete cascade unique,
  plan                    public.subscription_plan not null default 'free',
  status                  public.subscription_status not null default 'active',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  max_cameras             integer not null default 1,
  max_pets                integer not null default 2,
  cloud_storage_gb        integer not null default 5,
  vet_reports_enabled     boolean not null default false,
  ai_assistant_enabled    boolean not null default false,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_organizations_updated
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_pets_updated
  before update on public.pets
  for each row execute function public.handle_updated_at();

create trigger on_devices_updated
  before update on public.devices
  for each row execute function public.handle_updated_at();

create trigger on_conversations_updated
  before update on public.conversations
  for each row execute function public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- Auto-create profile + org on user signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
  user_name text;
begin
  user_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.organizations (name, slug)
  values (
    user_name || '''s Home',
    new.id::text
  )
  returning id into new_org_id;

  insert into public.profiles (id, org_id, display_name, role)
  values (new.id, new_org_id, user_name, 'owner');

  insert into public.subscriptions (org_id)
  values (new_org_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------

-- Helper: get current user's org_id
create or replace function public.get_user_org_id()
returns uuid as $$
  select org_id from public.profiles where id = auth.uid();
$$ language sql security definer stable;


-- Organizations
alter table public.organizations enable row level security;

create policy "Users can view their organization"
  on public.organizations for select
  using (id = public.get_user_org_id());

create policy "Owners can update their organization"
  on public.organizations for update
  using (id = public.get_user_org_id())
  with check (id = public.get_user_org_id());


-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view profiles in their org"
  on public.profiles for select
  using (org_id = public.get_user_org_id());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- Pets
alter table public.pets enable row level security;

create policy "Users can view pets in their org"
  on public.pets for select
  using (org_id = public.get_user_org_id());

create policy "Members can create pets in their org"
  on public.pets for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update pets in their org"
  on public.pets for update
  using (org_id = public.get_user_org_id())
  with check (org_id = public.get_user_org_id());

create policy "Owners can delete pets in their org"
  on public.pets for delete
  using (org_id = public.get_user_org_id());


-- Pet Profiles
alter table public.pet_profiles enable row level security;

create policy "Users can view pet profiles via pets"
  on public.pet_profiles for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));


-- Devices
alter table public.devices enable row level security;

create policy "Users can view devices in their org"
  on public.devices for select
  using (org_id = public.get_user_org_id());

create policy "Members can create devices in their org"
  on public.devices for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update devices in their org"
  on public.devices for update
  using (org_id = public.get_user_org_id())
  with check (org_id = public.get_user_org_id());


-- Device Locations
alter table public.device_locations enable row level security;

create policy "Users can view device locations via devices"
  on public.device_locations for select
  using (device_id in (select id from public.devices where org_id = public.get_user_org_id()));

create policy "Members can manage device locations"
  on public.device_locations for all
  using (device_id in (select id from public.devices where org_id = public.get_user_org_id()));


-- Pet Events
alter table public.pet_events enable row level security;

create policy "Users can view events in their org"
  on public.pet_events for select
  using (org_id = public.get_user_org_id());


-- Event Clips
alter table public.event_clips enable row level security;

create policy "Users can view event clips via events"
  on public.event_clips for select
  using (event_id in (select id from public.pet_events where org_id = public.get_user_org_id()));


-- Event Annotations
alter table public.event_annotations enable row level security;

create policy "Users can view annotations via events"
  on public.event_annotations for select
  using (event_id in (select id from public.pet_events where org_id = public.get_user_org_id()));


-- Autonomous Actions
alter table public.autonomous_actions enable row level security;

create policy "Users can view actions via events"
  on public.autonomous_actions for select
  using (event_id in (select id from public.pet_events where org_id = public.get_user_org_id()));


-- Health Metrics
alter table public.health_metrics enable row level security;

create policy "Users can view health metrics via pets"
  on public.health_metrics for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));


-- Behavior Baselines
alter table public.behavior_baselines enable row level security;

create policy "Users can view baselines via pets"
  on public.behavior_baselines for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));


-- Timeline Entries
alter table public.timeline_entries enable row level security;

create policy "Users can view timeline via pets"
  on public.timeline_entries for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));


-- Medical Records
alter table public.medical_records enable row level security;

create policy "Users can view medical records via pets"
  on public.medical_records for select
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));

create policy "Members can create medical records"
  on public.medical_records for insert
  with check (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));

create policy "Members can update medical records"
  on public.medical_records for update
  using (pet_id in (select id from public.pets where org_id = public.get_user_org_id()));


-- Notifications
alter table public.notifications enable row level security;

create policy "Users can view their notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update their notifications"
  on public.notifications for update
  using (user_id = auth.uid());


-- Notification Preferences
alter table public.notification_preferences enable row level security;

create policy "Users can manage their notification preferences"
  on public.notification_preferences for all
  using (user_id = auth.uid());


-- Conversations
alter table public.conversations enable row level security;

create policy "Users can view their conversations"
  on public.conversations for select
  using (user_id = auth.uid());

create policy "Users can create conversations"
  on public.conversations for insert
  with check (user_id = auth.uid() and org_id = public.get_user_org_id());


-- Messages
alter table public.messages enable row level security;

create policy "Users can view messages in their conversations"
  on public.messages for select
  using (conversation_id in (select id from public.conversations where user_id = auth.uid()));

create policy "Users can create messages in their conversations"
  on public.messages for insert
  with check (conversation_id in (select id from public.conversations where user_id = auth.uid()));


-- Subscriptions
alter table public.subscriptions enable row level security;

create policy "Users can view their org subscription"
  on public.subscriptions for select
  using (org_id = public.get_user_org_id());


-- ---------------------------------------------------------------------------
-- Supabase Realtime (enable on key tables)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.pet_events;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.devices;
alter publication supabase_realtime add table public.timeline_entries;


-- ==========================================
-- FILE: 00002_device_hub_and_smart_bed.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00003_cognitive_timeline_engine.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00004_living_companion_models.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00005_cognitive_reasoning_engine.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00006_companion_action_engine.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00007_timeline_immutability.sql
-- ==========================================
-- =============================================================================
-- COMPAWION OS — Migration 00007: Timeline Immutability Enforcement
-- =============================================================================
-- public.pet_events is the Cognitive Timeline event store. Events may be
-- appended, but their historical content must never be changed or removed.
-- =============================================================================

create or replace function public.prevent_pet_events_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception using
    errcode = '55000',
    message = format('Cognitive Timeline events are immutable: %s is not permitted on public.pet_events.', tg_op);
end;
$$;

create trigger prevent_pet_events_update_or_delete
  before update or delete on public.pet_events
  for each row execute function public.prevent_pet_events_mutation();

create trigger prevent_pet_events_truncate
  before truncate on public.pet_events
  for each statement execute function public.prevent_pet_events_mutation();

-- Keep the invariant active even when a replication role is in use. Database
-- superusers remain trusted administrative actors outside the application trust boundary.
alter table public.pet_events enable always trigger prevent_pet_events_update_or_delete;
alter table public.pet_events enable always trigger prevent_pet_events_truncate;


-- ==========================================
-- FILE: 00008_event_identity.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00009_lcm_concurrency_versioning.sql
-- ==========================================
-- =============================================================================
-- COMPAWION OS — Migration 00009: LCM Concurrency & Versioning
-- =============================================================================
-- Adds optimistic concurrency metadata to the mutable LCM read model. Timeline
-- remains immutable; LCM advances only through compare-and-swap updates.
-- =============================================================================

alter table public.living_companion_models
  add column if not exists version bigint not null default 0,
  add column if not exists last_processed_event_id uuid references public.pet_events(id) on delete restrict,
  add column if not exists last_processed_event_created_at timestamptz,
  add column if not exists processing_state text not null default 'idle',
  add column if not exists updated_by text not null default 'system';

alter table public.living_companion_models
  add constraint living_companion_models_version_check
  check (version >= 0),
  add constraint living_companion_models_processing_state_check
  check (processing_state in ('idle', 'processing', 'failed')),
  add constraint living_companion_models_updated_by_check
  check (updated_by in ('guardian', 'system', 'automation', 'device', 'veterinarian', 'administrator'));

-- Existing LCM rows are safely associated with their latest known Timeline
-- event when one exists. Rows without an event remain valid initial baselines.
update public.living_companion_models lcm
set
  last_processed_event_id = event.id,
  last_processed_event_created_at = event.created_at
from public.pet_events event
where event.id = lcm.last_event_id
  and (lcm.last_processed_event_id is null or lcm.last_processed_event_created_at is null);

create index if not exists idx_lcm_last_processed_event
  on public.living_companion_models (last_processed_event_id)
  where last_processed_event_id is not null;

create index if not exists idx_lcm_processing_state
  on public.living_companion_models (processing_state, updated_at asc)
  where processing_state <> 'idle';


-- ==========================================
-- FILE: 00010_cae_idempotency.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00011_cae_atomic_claim.sql
-- ==========================================
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


-- ==========================================
-- FILE: 00012_pet_events_insert_rls.sql
-- ==========================================
-- =============================================================================
-- COMPAWION OS — Migration 00012: Tenant-Safe Timeline Event Insertion
-- =============================================================================

create policy "Users can insert events for pets in their organization"
  on public.pet_events for insert
  with check (
    org_id = public.get_user_org_id()
    and (
      pet_id is null
      or exists (
        select 1
        from public.pets
        where pets.id = pet_events.pet_id
          and pets.org_id = pet_events.org_id
      )
    )
    and (
      device_id is null
      or exists (
        select 1
        from public.devices
        where devices.id = pet_events.device_id
          and devices.org_id = pet_events.org_id
      )
    )
  );


-- ==========================================
-- FILE: 00013_health_metrics_insert_rls.sql
-- ==========================================
-- =============================================================================
-- COMPAWION OS — Migration 00013: Tenant-Safe Health Metric Insertion
-- =============================================================================

create policy "Users can insert health metrics for pets in their organization"
  on public.health_metrics for insert
  with check (
    exists (
      select 1
      from public.pets
      where pets.id = health_metrics.pet_id
        and pets.org_id = public.get_user_org_id()
    )
  );

