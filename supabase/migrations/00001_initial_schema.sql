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
