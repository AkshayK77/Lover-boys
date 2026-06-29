-- =====================================================
-- 005: Community and AI coach tables
-- PRD §8.4 (Community — MotionLab rebuild)
-- PRD §8.5 (coach_conversations, coach_messages)
-- =====================================================

-- -------------------------------------------------------
-- discussions  (PRD §8.4)
-- Reddit-style posts with post_type: text | image | link
-- upvotes / downvotes as separate counts (PRD §5.9)
-- -------------------------------------------------------
create table public.discussions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  sport_tag     text not null,   -- required: one of the sport slugs
  flair         text check (flair in ('technique', 'injury_question', 'progress', 'recovery', 'general', 'ask_an_expert')),
  post_type     text not null check (post_type in ('text', 'image', 'link')),
  title         text not null,
  body          text,
  image_urls    text[] default '{}',   -- community public bucket (user-consented)
  link_url      text,
  link_preview  jsonb,                  -- {title, description, image, url}
  upvotes       int not null default 0,
  downvotes     int not null default 0,
  pinned        boolean not null default false,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.discussions enable row level security;

-- Community posts: public read (PRD §6.4 — "browsing community: no login required")
create policy "public can read published discussions"
  on public.discussions for select
  using (published = true);

create policy "auth users can create discussions"
  on public.discussions for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "users can update own discussions"
  on public.discussions for update
  using (auth.uid() = user_id);

create policy "admins can manage all discussions"
  on public.discussions for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create trigger discussions_updated_at
  before update on public.discussions
  for each row execute function public.handle_updated_at();

create index discussions_sport_tag_idx on public.discussions (sport_tag, created_at desc);
create index discussions_user_idx on public.discussions (user_id);
create index discussions_flair_idx on public.discussions (flair);

-- -------------------------------------------------------
-- comments  (PRD §8.4)
-- Nested one level via parent_comment_id
-- -------------------------------------------------------
create table public.comments (
  id                uuid primary key default uuid_generate_v4(),
  discussion_id     uuid not null references public.discussions(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  body              text not null,
  upvotes           int not null default 0,
  downvotes         int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "public can read comments"
  on public.comments for select using (true);

create policy "auth users can create comments"
  on public.comments for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "admins can manage all comments"
  on public.comments for all
  using (exists (select 1 from public.user_roles r where r.user_id = auth.uid() and r.role = 'admin'));

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.handle_updated_at();

create index comments_discussion_idx on public.comments (discussion_id, created_at);
create index comments_parent_idx on public.comments (parent_comment_id);

-- -------------------------------------------------------
-- post_votes  (PRD §8.4)
-- vote_type: up | down — one vote per user per post, toggleable
-- -------------------------------------------------------
create table public.post_votes (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  vote_type     text not null check (vote_type in ('up', 'down')),
  created_at    timestamptz not null default now(),
  unique (user_id, discussion_id)
);

alter table public.post_votes enable row level security;

create policy "auth users can manage own post votes"
  on public.post_votes for all
  using (auth.uid() = user_id);

-- Sync upvotes/downvotes on discussions
create or replace function public.sync_post_votes()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.vote_type = 'up' then
      update public.discussions set upvotes = upvotes + 1 where id = new.discussion_id;
    else
      update public.discussions set downvotes = downvotes + 1 where id = new.discussion_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.vote_type = 'up' then
      update public.discussions set upvotes = greatest(upvotes - 1, 0) where id = old.discussion_id;
    else
      update public.discussions set downvotes = greatest(downvotes - 1, 0) where id = old.discussion_id;
    end if;
  elsif tg_op = 'UPDATE' then
    -- vote flipped
    if new.vote_type = 'up' then
      update public.discussions
        set upvotes = upvotes + 1, downvotes = greatest(downvotes - 1, 0)
        where id = new.discussion_id;
    else
      update public.discussions
        set downvotes = downvotes + 1, upvotes = greatest(upvotes - 1, 0)
        where id = new.discussion_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger on_post_vote_change
  after insert or update or delete on public.post_votes
  for each row execute function public.sync_post_votes();

create index post_votes_discussion_idx on public.post_votes (discussion_id);

-- -------------------------------------------------------
-- comment_votes  (PRD §8.4)
-- -------------------------------------------------------
create table public.comment_votes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  comment_id  uuid not null references public.comments(id) on delete cascade,
  vote_type   text not null check (vote_type in ('up', 'down')),
  created_at  timestamptz not null default now(),
  unique (user_id, comment_id)
);

alter table public.comment_votes enable row level security;

create policy "auth users can manage own comment votes"
  on public.comment_votes for all
  using (auth.uid() = user_id);

-- Sync upvotes/downvotes on comments
create or replace function public.sync_comment_votes()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.vote_type = 'up' then
      update public.comments set upvotes = upvotes + 1 where id = new.comment_id;
    else
      update public.comments set downvotes = downvotes + 1 where id = new.comment_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.vote_type = 'up' then
      update public.comments set upvotes = greatest(upvotes - 1, 0) where id = old.comment_id;
    else
      update public.comments set downvotes = greatest(downvotes - 1, 0) where id = old.comment_id;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.vote_type = 'up' then
      update public.comments
        set upvotes = upvotes + 1, downvotes = greatest(downvotes - 1, 0)
        where id = new.comment_id;
    else
      update public.comments
        set downvotes = downvotes + 1, upvotes = greatest(upvotes - 1, 0)
        where id = new.comment_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger on_comment_vote_change
  after insert or update or delete on public.comment_votes
  for each row execute function public.sync_comment_votes();

create index comment_votes_comment_idx on public.comment_votes (comment_id);

-- -------------------------------------------------------
-- coach_conversations  (PRD §8.5)
-- AI coach sessions — inherits KavaFit Groq architecture
-- -------------------------------------------------------
create table public.coach_conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.coach_conversations enable row level security;

create policy "users can manage own coach conversations"
  on public.coach_conversations for all
  using (auth.uid() = user_id);

create trigger coach_conversations_updated_at
  before update on public.coach_conversations
  for each row execute function public.handle_updated_at();

create index coach_conversations_user_idx on public.coach_conversations (user_id, updated_at desc);

-- -------------------------------------------------------
-- coach_messages  (PRD §8.5)
-- Per-message AI history with mode column
-- mode values from PRD §5.10 AI Modes table
-- -------------------------------------------------------
create table public.coach_messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.coach_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  mode            text check (mode in (
    'default', 'flags', 'recipe', 'workout', 'warmup', 'grocery',
    'sport_warmup', 'injury_check', 'learning_rec'
  )),
  created_at      timestamptz not null default now()
);

alter table public.coach_messages enable row level security;

create policy "users can manage own coach messages"
  on public.coach_messages for all
  using (
    exists (
      select 1 from public.coach_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create index coach_messages_conversation_idx on public.coach_messages (conversation_id, created_at);
