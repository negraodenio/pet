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
