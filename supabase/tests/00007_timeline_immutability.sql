-- Run against a database with migrations applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00007_timeline_immutability.sql
--
-- The transaction is always rolled back so the assertions leave no records.

begin;

do $$
declare
  test_org_id uuid := gen_random_uuid();
  first_event_id uuid;
  second_event_id uuid;
  event_count integer;
begin
  insert into public.organizations (id, name, slug)
  values (test_org_id, 'Timeline Immutability Test', test_org_id::text);

  insert into public.pet_events (org_id, event_type, title)
  values (test_org_id, 'sleeping', 'Original event')
  returning id into first_event_id;

  perform 1 from public.pet_events where id = first_event_id and title = 'Original event';
  if not found then
    raise exception 'Timeline event was not readable after append.';
  end if;

  begin
    update public.pet_events
    set title = 'Mutated event'
    where id = first_event_id;
    raise exception 'Timeline update unexpectedly succeeded.';
  exception
    when sqlstate '55000' then
      null;
  end;

  begin
    delete from public.pet_events where id = first_event_id;
    raise exception 'Timeline delete unexpectedly succeeded.';
  exception
    when sqlstate '55000' then
      null;
  end;

  begin
    truncate public.pet_events cascade;
    raise exception 'Timeline truncate unexpectedly succeeded.';
  exception
    when sqlstate '55000' then
      null;
  end;

  perform 1 from public.pet_events where id = first_event_id and title = 'Original event';
  if not found then
    raise exception 'Timeline event changed after rejected mutation attempts.';
  end if;

  insert into public.pet_events (org_id, event_type, title)
  values (test_org_id, 'eating', 'Appended event')
  returning id into second_event_id;

  select count(*)
  into event_count
  from public.pet_events
  where id in (first_event_id, second_event_id);

  if event_count <> 2 then
    raise exception 'Timeline append test expected two readable events, found %.', event_count;
  end if;
end;
$$;

rollback;
