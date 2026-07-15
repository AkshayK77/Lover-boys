-- =====================================================
-- 008: Fix infinite recursion in user_roles RLS policy
--
-- "admins can manage all roles" (001) queried public.user_roles from
-- within a policy defined on public.user_roles itself, so Postgres had
-- to re-apply the same policy to evaluate it — infinite recursion.
-- Any query touching user_roles (directly, or transitively via the
-- other tables' "admins can ..." policies) failed with 42P17.
--
-- Fix: check admin status through a SECURITY DEFINER function, which
-- runs as the function owner and so is not subject to RLS on the
-- query inside it — breaking the self-reference.
-- =====================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid and role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "admins can manage all roles" on public.user_roles;
create policy "admins can manage all roles"
  on public.user_roles for all
  using (public.is_admin(auth.uid()));

drop policy if exists "admins can read all profiles" on public.profiles;
create policy "admins can read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));
