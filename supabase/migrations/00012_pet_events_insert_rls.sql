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
