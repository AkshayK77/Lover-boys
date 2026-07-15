-- =====================================================
-- 013: progress-photos storage bucket
-- Private bucket for body progress photos (PRD §9.3 — signed URLs only).
-- Objects are namespaced by user id in the first path segment
-- (`{user_id}/{timestamp}.ext`), and RLS scopes access to that folder.
-- =====================================================

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

drop policy if exists "users read own progress photos" on storage.objects;
create policy "users read own progress photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users upload own progress photos" on storage.objects;
create policy "users upload own progress photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users delete own progress photos" on storage.objects;
create policy "users delete own progress photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);
