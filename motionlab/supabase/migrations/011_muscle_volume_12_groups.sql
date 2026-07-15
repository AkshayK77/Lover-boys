-- =====================================================
-- 011: Muscle-volume taxonomy → 12 groups
-- The dashboard heatmap (ported from KavaFit) tracks Lats and Mid Back as
-- separate groups. 003_training created muscle_volume_log with a merged
-- `back` group (11 groups). Split it into `lats` + `mid_back` to match the
-- KavaFit taxonomy and the heatmap's body-muscles ID mappings.
-- =====================================================

-- Migrate any existing `back` rows to `mid_back` (drop ones that would
-- collide with an existing mid_back row for the same user/week).
delete from public.muscle_volume_log b
  where b.muscle_group = 'back'
    and exists (
      select 1 from public.muscle_volume_log m
      where m.user_id = b.user_id
        and m.week_start = b.week_start
        and m.muscle_group = 'mid_back'
    );

update public.muscle_volume_log set muscle_group = 'mid_back' where muscle_group = 'back';

alter table public.muscle_volume_log drop constraint muscle_volume_log_muscle_group_check;

alter table public.muscle_volume_log add constraint muscle_volume_log_muscle_group_check
  check (muscle_group in (
    'chest', 'shoulders', 'triceps', 'lats', 'mid_back', 'biceps',
    'abs', 'quads', 'hamstrings', 'glutes', 'calves', 'forearms'
  ));
