-- =====================================================
-- 004: Nutrition tables — KavaFit, preserve as-is
-- PRD §8.2, §5.6
-- =====================================================

-- -------------------------------------------------------
-- meal_history  (PRD §8.2)
-- Logged meals with full macro breakdown
-- PRD §5.6: daily macro tracking — calories, protein, carbs, fat vs user targets
-- -------------------------------------------------------
create table public.meal_history (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  food_name           text not null,
  meal_type           text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  quantity_g          numeric(8,2),
  calories            numeric(8,2),
  protein_g           numeric(8,2),
  carbs_g             numeric(8,2),
  fat_g               numeric(8,2),
  fibre_g             numeric(8,2),
  indian_food_id      uuid,   -- FK to indian_foods if matched
  logged_date         date not null default current_date,
  notes               text,
  created_at          timestamptz not null default now()
);

alter table public.meal_history enable row level security;

create policy "users can manage own meal history"
  on public.meal_history for all
  using (auth.uid() = user_id);

create index meal_history_user_date_idx on public.meal_history (user_id, logged_date desc);

-- -------------------------------------------------------
-- indian_foods  (PRD §8.2)
-- Pre-seeded Indian food DB with per-serving macros
-- KavaFit's localisation advantage for India market (PRD §2.2)
-- Seed data inserted as a representative sample — full 500+ item seed
-- lives in supabase/seeds/indian_foods.sql
-- -------------------------------------------------------
create table public.indian_foods (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  name_local        text,   -- regional name (e.g. Hindi, Tamil)
  category          text,   -- dal, rice, bread, vegetable, protein, snack, drink
  serving_desc      text,   -- "1 cup", "1 roti", "100g"
  serving_g         numeric(8,2),
  calories          numeric(8,2),
  protein_g         numeric(8,2),
  carbs_g           numeric(8,2),
  fat_g             numeric(8,2),
  fibre_g           numeric(8,2),
  is_vegetarian     boolean not null default true,
  is_vegan          boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table public.indian_foods enable row level security;

create policy "auth users can read indian foods"
  on public.indian_foods for select using (auth.uid() is not null);

create policy "admins can manage indian foods"
  on public.indian_foods for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create index indian_foods_name_idx on public.indian_foods using gin (name gin_trgm_ops);
create index indian_foods_category_idx on public.indian_foods (category);
create index indian_foods_vegetarian_idx on public.indian_foods (is_vegetarian, is_vegan);

-- Representative seed: common Indian foods
-- Full seed (500+ items) goes in supabase/seeds/indian_foods.sql
insert into public.indian_foods (name, name_local, category, serving_desc, serving_g, calories, protein_g, carbs_g, fat_g, fibre_g, is_vegetarian, is_vegan) values
  ('Dal Tadka',          'दाल तड़का',    'dal',       '1 cup',   200, 198, 11.8, 28.5, 5.2, 6.4, true,  true),
  ('Paneer',             'पनीर',          'protein',   '100g',    100, 296, 18.3, 1.2,  24.1, 0,   true,  false),
  ('Chicken Breast',     null,            'protein',   '100g',    100, 165, 31.0, 0,    3.6,  0,   false, false),
  ('Roti (Whole Wheat)', 'चपाती',         'bread',     '1 roti',  35,  92,  3.1,  17.8, 1.3,  2.1, true,  true),
  ('Basmati Rice',       'बासमती चावल',  'rice',      '1 cup cooked', 186, 242, 4.4, 53.2, 0.4, 0.6, true, true),
  ('Rajma',              'राजमा',         'dal',       '1 cup',   200, 216, 13.4, 36.5, 1.4,  7.4, true,  true),
  ('Chole',              'छोले',          'dal',       '1 cup',   200, 210, 12.0, 35.0, 3.5,  7.0, true,  true),
  ('Egg (boiled)',       null,            'protein',   '1 egg',   50,  78,  6.3,  0.6,  5.3,  0,   false, false),
  ('Dosa',               'डोसा',          'bread',     '1 dosa',  80,  133, 2.6,  23.5, 3.7,  0.8, true,  true),
  ('Idli',               'इडली',          'bread',     '2 pieces', 120, 130, 4.0,  25.0, 0.8,  1.2, true,  true),
  ('Poha',               'पोहा',          'snack',     '1 cup',   100, 180, 3.5,  36.0, 3.5,  1.5, true,  true),
  ('Upma',               'उपमा',          'snack',     '1 cup',   150, 180, 4.0,  28.0, 6.0,  2.0, true,  true),
  ('Palak Paneer',       'पालक पनीर',    'vegetable', '1 cup',   200, 268, 14.0, 14.0, 18.0, 3.0, true,  false),
  ('Aloo Gobi',          'आलू गोभी',     'vegetable', '1 cup',   200, 186, 4.4,  28.0, 7.5,  5.0, true,  true),
  ('Sambar',             'साम्बर',        'dal',       '1 cup',   200, 120, 5.0,  18.0, 3.5,  4.5, true,  true),
  ('Toor Dal',           'तूर दाल',       'dal',       '1 cup',   200, 202, 12.0, 30.5, 3.0,  6.0, true,  true),
  ('Moong Dal',          'मूंग दाल',      'dal',       '1 cup',   200, 190, 13.0, 28.0, 2.5,  5.5, true,  true),
  ('Paratha',            'पराठा',         'bread',     '1 paratha', 70, 200, 4.0,  27.0, 8.0,  2.5, true,  true),
  ('Lassi (sweet)',      'लस्सी',         'drink',     '250ml',   250, 190, 7.0,  28.0, 6.0,  0,   true,  false),
  ('Chaas (buttermilk)', 'छाछ',           'drink',     '250ml',   250, 60,  3.5,  6.0,  2.5,  0,   true,  false),
  ('Banana',             'केला',          'snack',     '1 medium', 118, 105, 1.3,  27.0, 0.4,  3.1, true,  true),
  ('Almonds',            'बादाम',         'snack',     '10 pieces', 14, 82,  3.0,  3.0,  7.3,  1.2, true,  true),
  ('Greek Yogurt',       'दही',           'protein',   '100g',    100, 59,  10.0, 3.6,  0.4,  0,   true,  false),
  ('Peanut Butter',      'मूंगफली मक्खन','snack',     '2 tbsp',  32,  188, 8.0,  6.0,  16.0, 2.0, true,  true),
  ('Oats',               'जई',            'bread',     '1 cup dry', 80, 307, 10.7, 55.0, 5.3,  8.0, true,  true);
