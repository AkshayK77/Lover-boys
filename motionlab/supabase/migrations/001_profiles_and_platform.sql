-- =====================================================
-- 001: Core auth, profiles, and platform tables
-- PRD §8.1, §8.5
-- =====================================================

create extension if not exists "pg_trgm";

-- -------------------------------------------------------
-- handle_updated_at — reused by all tables
-- -------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------
-- user_roles  (PRD §8.5)
-- role: admin | expert | user
-- -------------------------------------------------------
create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'expert', 'user')),
  granted_at  timestamptz not null default now(),
  granted_by  uuid references auth.users(id),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "users can read own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "admins can manage all roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

-- -------------------------------------------------------
-- profiles  (PRD §8.1 — exact columns from PRD table)
-- -------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  -- basic info
  name                  text,
  email                 text,
  avatar_url            text,
  age                   int,
  weight_kg             numeric(5,1),
  height_cm             numeric(5,1),
  -- fitness (KavaFit)
  fitness_goal          text check (fitness_goal in ('muscle_gain', 'fat_loss', 'general_fitness')),
  experience_level      text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  sessions_per_week     int,
  equipment             text[] default '{}',
  injuries              text,   -- free text, PRD §8.1
  calorie_target        int,
  protein_target        int,
  dietary_preference    text,
  -- sport + learning (MotionLab)
  sports                text[] default '{}',          -- array of sport slugs
  sport_frequency       jsonb,                         -- {"football": 2, "table_tennis": 3}
  learning_goals        text[] default '{}',
  -- onboarding
  onboarding_complete   boolean not null default false,
  -- kavafit metadata
  deload_suggested_at   timestamptz,
  created_at            timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'admin'
    )
  );

create index profiles_sports_idx on public.profiles using gin (sports);
create index profiles_onboarding_idx on public.profiles (onboarding_complete);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------
-- notifications  (PRD §8.5)
-- -------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  read        boolean not null default false,
  action_url  text,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "users can manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

create index notifications_user_unread_idx on public.notifications (user_id, read, created_at desc);

-- -------------------------------------------------------
-- bookmarks  (PRD §8.5)
-- content_type: lesson | article | plan
-- -------------------------------------------------------
create table public.bookmarks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  content_type  text not null check (content_type in ('lesson', 'article', 'plan')),
  content_id    uuid not null,
  created_at    timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

alter table public.bookmarks enable row level security;

create policy "users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);

create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

-- -------------------------------------------------------
-- sport_schedules  (PRD §8.5)
-- weekly sport schedule — drives the warmup reminder flow
-- -------------------------------------------------------
create table public.sport_schedules (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sport       text not null,
  day_of_week int not null check (day_of_week between 0 and 6),  -- 0=Sun, 6=Sat
  time        time,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.sport_schedules enable row level security;

create policy "users can manage own sport schedules"
  on public.sport_schedules for all
  using (auth.uid() = user_id);

create index sport_schedules_user_idx on public.sport_schedules (user_id, active);
