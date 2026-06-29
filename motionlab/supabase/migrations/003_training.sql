-- =====================================================
-- 003: Training tables — KavaFit, preserve as-is
-- PRD §8.2 — exact table names
-- =====================================================

-- -------------------------------------------------------
-- exercises  (PRD §8.2)
-- ~400 pre-seeded via separate seed file
-- -------------------------------------------------------
create table public.exercises (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text,
  instructions  text,
  muscle_groups text[] default '{}',
  equipment     text[] default '{}',
  difficulty    text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  category      text check (category in ('strength', 'cardio', 'mobility', 'plyometric', 'sport_specific', 'warmup', 'cooldown')),
  sports        text[] default '{}',
  video_url     text,
  thumbnail_url text,
  created_at    timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "auth users can read exercises"
  on public.exercises for select using (auth.uid() is not null);

create policy "admins can manage exercises"
  on public.exercises for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create index exercises_muscle_groups_idx on public.exercises using gin (muscle_groups);
create index exercises_sports_idx on public.exercises using gin (sports);
create index exercises_category_idx on public.exercises (category);
create index exercises_name_search_idx on public.exercises using gin (name gin_trgm_ops);

-- -------------------------------------------------------
-- workout_plans  (PRD §8.2)
-- AI-generated or manual plans per user
-- -------------------------------------------------------
create table public.workout_plans (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  plan_type     text check (plan_type in ('ppl', 'ppl_upper_lower', 'full_body', 'bro_split', 'sport_supplementary', 'single_session')),
  generated_by  text not null default 'ai' check (generated_by in ('ai', 'manual')),
  sport         text,    -- set when plan_type = sport_supplementary
  active        boolean not null default true,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.workout_plans enable row level security;

create policy "users can manage own workout plans"
  on public.workout_plans for all
  using (auth.uid() = user_id);

create trigger workout_plans_updated_at
  before update on public.workout_plans
  for each row execute function public.handle_updated_at();

create index workout_plans_user_active_idx on public.workout_plans (user_id, active);

-- -------------------------------------------------------
-- plan_days  (PRD §8.2)
-- Day-level structure within a plan
-- -------------------------------------------------------
create table public.plan_days (
  id          uuid primary key default uuid_generate_v4(),
  plan_id     uuid not null references public.workout_plans(id) on delete cascade,
  day_number  int not null,    -- 1–7 within the week
  name        text,            -- e.g. "Push Day", "Leg Day"
  exercises   jsonb,           -- ordered list: [{exercise_id, sets, reps, rest_sec, notes}]
  created_at  timestamptz not null default now()
);

alter table public.plan_days enable row level security;

create policy "users can manage own plan days"
  on public.plan_days for all
  using (
    exists (
      select 1 from public.workout_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );

create index plan_days_plan_idx on public.plan_days (plan_id, day_number);

-- -------------------------------------------------------
-- sessions  (PRD §8.2)
-- Completed workout sessions
-- -------------------------------------------------------
create table public.sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  plan_id     uuid references public.workout_plans(id) on delete set null,
  plan_day_id uuid references public.plan_days(id) on delete set null,
  name        text not null,
  date        date not null default current_date,
  duration    int,    -- minutes
  notes       text,
  rpe         int check (rpe between 1 and 10),
  mood        text check (mood in ('great', 'good', 'okay', 'tired', 'terrible')),
  sport       text,   -- set when session is sport-supplementary
  created_at  timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "users can manage own sessions"
  on public.sessions for all
  using (auth.uid() = user_id);

create index sessions_user_date_idx on public.sessions (user_id, date desc);
create index sessions_user_sport_idx on public.sessions (user_id, sport);

-- -------------------------------------------------------
-- session_sets  (PRD §8.2)
-- Individual sets: reps, weight, RPE, timestamp
-- -------------------------------------------------------
create table public.session_sets (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  set_number  int not null,
  reps        int,
  weight_kg   numeric(6,2),
  rpe         int check (rpe between 1 and 10),
  completed   boolean not null default true,
  logged_at   timestamptz not null default now()
);

alter table public.session_sets enable row level security;

create policy "users can manage own session sets"
  on public.session_sets for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create index session_sets_session_idx on public.session_sets (session_id);
create index session_sets_exercise_idx on public.session_sets (exercise_id);

-- -------------------------------------------------------
-- measurements  (PRD §8.2)
-- 7-dimension body measurements over time:
-- weight, body_fat_pct, chest, waist, hips, arms, thighs
-- -------------------------------------------------------
create table public.measurements (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null default current_date,
  weight_kg     numeric(5,2),
  body_fat_pct  numeric(5,2),
  chest_cm      numeric(5,2),
  waist_cm      numeric(5,2),
  hips_cm       numeric(5,2),
  arms_cm       numeric(5,2),
  thighs_cm     numeric(5,2),
  notes         text,
  created_at    timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.measurements enable row level security;

create policy "users can manage own measurements"
  on public.measurements for all
  using (auth.uid() = user_id);

create index measurements_user_date_idx on public.measurements (user_id, date desc);

-- -------------------------------------------------------
-- muscle_volume_log  (PRD §8.2)
-- Weekly volume per muscle group — 11 tracking groups
-- Groups: chest, back, shoulders, biceps, triceps, quads,
--         hamstrings, glutes, calves, abs, forearms
-- -------------------------------------------------------
create table public.muscle_volume_log (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  week_start    date not null,   -- Monday of the week
  muscle_group  text not null check (muscle_group in (
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'quads', 'hamstrings', 'glutes', 'calves', 'abs', 'forearms'
  )),
  volume        numeric(8,2) not null default 0,  -- total sets × reps × weight
  sets_count    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, week_start, muscle_group)
);

alter table public.muscle_volume_log enable row level security;

create policy "users can manage own muscle volume log"
  on public.muscle_volume_log for all
  using (auth.uid() = user_id);

create trigger muscle_volume_log_updated_at
  before update on public.muscle_volume_log
  for each row execute function public.handle_updated_at();

create index muscle_volume_log_user_week_idx on public.muscle_volume_log (user_id, week_start desc);

-- -------------------------------------------------------
-- progress_photos  (PRD §8.2)
-- Private Supabase Storage bucket — signed URLs only
-- -------------------------------------------------------
create table public.progress_photos (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  storage_path  text not null,   -- path inside private bucket
  date          date not null default current_date,
  angle         text check (angle in ('front', 'side', 'back')),
  notes         text,
  created_at    timestamptz not null default now()
);

alter table public.progress_photos enable row level security;

create policy "users can manage own progress photos"
  on public.progress_photos for all
  using (auth.uid() = user_id);

create index progress_photos_user_date_idx on public.progress_photos (user_id, date desc);
