-- =====================================================
-- 012: rate_limits — per-user throttle for the ai-proxy edge function
-- The edge function writes/reads this with the service_role key (bypasses
-- RLS). RLS is still enabled with no client policies so anon/authenticated
-- can't read or tamper with counters.
-- =====================================================

create table public.rate_limits (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  window_start  timestamptz not null default now(),
  request_count int not null default 0
);

alter table public.rate_limits enable row level security;
-- No client policies: only the service_role (edge function) touches this table.
