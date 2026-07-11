-- =====================================================
-- 009: Explicit anon/authenticated grants
--
-- 006 granted full table access to service_role only, on the assumption
-- that anon/authenticated already had base GRANTs from the project's
-- default-privilege template. They didn't — every request from the app
-- (using the anon key, whether logged in or not) was failing with
-- 42501 "permission denied for table X" before RLS was ever evaluated.
-- RLS policies still restrict which rows are visible/writable on top
-- of these grants; this only unlocks the base permission check.
-- =====================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to authenticated;
grant execute on all routines in schema public to anon, authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant usage, select on sequences to authenticated;
alter default privileges in schema public grant execute on routines to anon, authenticated;
