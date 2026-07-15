-- =====================================================
-- 010: Activity level + free-text dietary notes
-- Onboarding step 4 (Sports) now asks how active the user's lifestyle
-- is outside of sport/gym; step 5 (Nutrition) now takes free-text
-- allergies/restrictions in addition to the fixed dietary_preference
-- chips. Both feed the AI calorie/protein calculation when the user
-- leaves those targets blank.
-- =====================================================

alter table public.profiles
  add column if not exists activity_level text
    check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  add column if not exists dietary_notes text;
