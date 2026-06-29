-- =====================================================
-- 002: Sports science education tables
-- PRD §8.3 — exact table names and columns
-- =====================================================

-- -------------------------------------------------------
-- sports  (PRD §8.3)
-- Seeded with 8 sports per PRD §5.7
-- -------------------------------------------------------
create table public.sports (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon_url    text,
  active      boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.sports enable row level security;

create policy "public can read sports"
  on public.sports for select using (true);

create policy "admins can manage sports"
  on public.sports for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

-- PRD §5.7: TT + Football live at launch; Tennis, Basketball, Badminton, Running, Cycling, Swimming incremental
insert into public.sports (slug, name, description, active, sort_order) values
  ('table-tennis', 'Table Tennis',  'Reflexes, footwork, wrist mechanics, and tactical IQ for the fastest racket sport.', true,  1),
  ('football',     'Football',      'Movement patterns, positioning, aerial duels, and stamina for the beautiful game.',  true,  2),
  ('tennis',       'Tennis',        'Serve mechanics, baseline footwork, and shoulder health for the complete racket sport.', false, 3),
  ('basketball',   'Basketball',    'Vertical leap, lateral quickness, shooting mechanics and court vision.',             false, 4),
  ('badminton',    'Badminton',     'Smash power, net finesse, court coverage and recovery footwork.',                   false, 5),
  ('running',      'Running',       'Gait analysis, pacing strategy, and endurance science for every distance.',         false, 6),
  ('cycling',      'Cycling',       'Power output, cadence, bike fit, and VO2 max development.',                        false, 7),
  ('swimming',     'Swimming',      'Stroke technique, turn mechanics, breath control and lactate threshold training.',   false, 8);

-- -------------------------------------------------------
-- experts  (PRD §8.3)
-- -------------------------------------------------------
create table public.experts (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  title           text,
  bio             text,
  photo_url       text,
  credentials     text[] default '{}',
  specialisation  text[] default '{}',
  verified        boolean not null default false,
  user_id         uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

alter table public.experts enable row level security;

create policy "public can read verified experts"
  on public.experts for select using (verified = true);

create policy "admins can manage experts"
  on public.experts for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create policy "expert users can read own record"
  on public.experts for select
  using (auth.uid() = user_id);

-- -------------------------------------------------------
-- learning_paths  (PRD §8.3)
-- Each sport gets 3 paths: beginner, intermediate, advanced
-- -------------------------------------------------------
create table public.learning_paths (
  id          uuid primary key default uuid_generate_v4(),
  sport_id    uuid not null references public.sports(id) on delete cascade,
  title       text not null,
  level       text not null check (level in ('beginner', 'intermediate', 'advanced')),
  description text,
  created_at  timestamptz not null default now()
);

alter table public.learning_paths enable row level security;

create policy "public can read learning paths"
  on public.learning_paths for select using (true);

create policy "admins can manage learning paths"
  on public.learning_paths for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create index learning_paths_sport_idx on public.learning_paths (sport_id, level);

-- -------------------------------------------------------
-- modules  (PRD §8.3)
-- Groupings within a path (4–8 modules per path)
-- -------------------------------------------------------
create table public.modules (
  id                uuid primary key default uuid_generate_v4(),
  learning_path_id  uuid not null references public.learning_paths(id) on delete cascade,
  title             text not null,
  description       text,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.modules enable row level security;

create policy "public can read modules"
  on public.modules for select using (true);

create policy "admins can manage modules"
  on public.modules for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create index modules_path_idx on public.modules (learning_path_id, sort_order);

-- -------------------------------------------------------
-- lessons  (PRD §8.3)
-- Individual lessons with content (3–6 per module, 5–10 min each)
-- sport_tags + topic_tags enable AI RAG retrieval (PRD §7.3)
-- -------------------------------------------------------
create table public.lessons (
  id                uuid primary key default uuid_generate_v4(),
  module_id         uuid not null references public.modules(id) on delete cascade,
  title             text not null,
  content_body      text,    -- markdown
  content_type      text check (content_type in ('text', 'video', 'interactive')),
  visual_url        text,
  sport_tags        text[] default '{}',
  topic_tags        text[] default '{}',
  duration_minutes  int,
  expert_id         uuid references public.experts(id) on delete set null,
  published         boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "auth users can read published lessons"
  on public.lessons for select
  using (auth.uid() is not null and published = true);

create policy "admins can manage lessons"
  on public.lessons for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.handle_updated_at();

create index lessons_module_idx on public.lessons (module_id, sort_order);
-- Indexes for AI RAG retrieval (PRD §7.3 — keyword + tag matching)
create index lessons_sport_tags_idx on public.lessons using gin (sport_tags);
create index lessons_topic_tags_idx on public.lessons using gin (topic_tags);

-- -------------------------------------------------------
-- lesson_progress  (PRD §8.3)
-- Per-user lesson tracking — shown on Dashboard
-- -------------------------------------------------------
create table public.lesson_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  lesson_id        uuid not null references public.lessons(id) on delete cascade,
  completed        boolean not null default false,
  completion_date  date,
  created_at       timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "users can manage own lesson progress"
  on public.lesson_progress for all
  using (auth.uid() = user_id);

create index lesson_progress_user_idx on public.lesson_progress (user_id, completed);

-- -------------------------------------------------------
-- articles  (PRD §8.3)
-- Resource library — separate from lesson content
-- -------------------------------------------------------
create table public.articles (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  body         text,    -- markdown
  author_id    uuid references public.experts(id) on delete set null,
  sport_tags   text[] default '{}',
  topic_tags   text[] default '{}',
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.articles enable row level security;

create policy "public can read published articles"
  on public.articles for select
  using (published_at is not null and published_at <= now());

create policy "admins can manage articles"
  on public.articles for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.handle_updated_at();

create index articles_sport_tags_idx on public.articles using gin (sport_tags);
create index articles_published_idx on public.articles (published_at desc);

-- -------------------------------------------------------
-- certifications  (PRD §8.3)
-- Earned when user completes a learning path
-- -------------------------------------------------------
create table public.certifications (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  issued_at        timestamptz not null default now(),
  certificate_url  text,
  unique (user_id, learning_path_id)
);

alter table public.certifications enable row level security;

create policy "users can read own certifications"
  on public.certifications for select
  using (auth.uid() = user_id);

create policy "admins can manage certifications"
  on public.certifications for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create index certifications_user_idx on public.certifications (user_id, issued_at desc);

-- -------------------------------------------------------
-- achievements  (PRD §8.3)
-- Badges and milestones
-- -------------------------------------------------------
create table public.achievements (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null,
  earned_at        timestamptz not null default now(),
  metadata         jsonb
);

alter table public.achievements enable row level security;

create policy "users can read own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "admins can manage achievements"
  on public.achievements for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create index achievements_user_idx on public.achievements (user_id, earned_at desc);
