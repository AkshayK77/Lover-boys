-- =====================================================
-- 006: Explicit service_role grants
-- Newer Supabase projects don't always auto-grant full table access to
-- service_role the way older projects did — BYPASSRLS alone isn't enough,
-- base GRANTs are still required underneath RLS.
-- =====================================================

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on routines to service_role;
