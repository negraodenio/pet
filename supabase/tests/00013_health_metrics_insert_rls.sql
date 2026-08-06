-- Run against a database with migrations applied:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/00013_health_metrics_insert_rls.sql

begin;

do $$
declare
  owner_id uuid := gen_random_uuid();
  owner_org_id uuid := gen_random_uuid();
  other_org_id uuid := gen_random_uuid();
  owner_pet_id uuid := gen_random_uuid();
  other_pet_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  values (owner_id, 'authenticated', 'authenticated', owner_id::text || '@example.test', 'not-used', now(), '{"display_name":"Owner"}');

  insert into public.organizations (id, name, slug)
  values
    (owner_org_id, 'Owner Health Test', owner_org_id::text),
    (other_org_id, 'Other Health Test', other_org_id::text);

  update public.profiles set org_id = owner_org_id where id = owner_id;

  insert into public.pets (id, org_id, name, species)
  values
    (owner_pet_id, owner_org_id, 'Owner Pet', 'dog'),
    (other_pet_id, other_org_id, 'Other Pet', 'dog');

  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', owner_id::text, 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  set local role authenticated;

  insert into public.health_metrics (pet_id, metric_type, value, unit)
  values (owner_pet_id, 'weight', 12.5, 'kg');

  begin
    insert into public.health_metrics (pet_id, metric_type, value, unit)
    values (other_pet_id, 'weight', 12.5, 'kg');
    raise exception 'Cross-tenant health metric insert unexpectedly succeeded.';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

rollback;
