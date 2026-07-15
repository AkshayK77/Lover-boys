-- =====================================================
-- 007: exercises.is_compound
-- Needed by progressive overload's increment logic (compound +5kg /
-- isolation +2.5kg) — present in KavaFit's real exercises table but
-- missing from the merged schema, so the import script silently
-- couldn't write it.
-- =====================================================

alter table public.exercises add column is_compound boolean not null default false;
