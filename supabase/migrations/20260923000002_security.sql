-- PinoyStars security: RLS on every table, explicit column grants, helper functions.
-- Rule of thumb: content is world-readable; writes are owner-or-admin; per-user rows are owner-only.

-- ── Helpers (security definer so policies never recurse into profiles RLS) ──
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function public.can_edit_actor(p_actor text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.actors a
    where a.id = p_actor
      and auth.uid() is not null
      and (a.created_by = auth.uid() or public.is_admin())
  )
$$;

-- Aggregate-only view over favorites: exposes counts, never who follows whom.
create or replace function public.actor_follower_counts(p_ids text[])
returns table (actor_id text, followers bigint)
language sql stable security definer set search_path = '' as $$
  select f.actor_id, count(*)::bigint
  from public.favorite_actors f
  where f.actor_id = any (p_ids)
  group by f.actor_id
$$;

-- Trivia answers stay server-side: clients can't select answer_index/fact directly.
create or replace function public.answer_trivia(p_question text, p_choice int)
returns table (correct boolean, answer_index int, fact text)
language sql stable security definer set search_path = '' as $$
  select q.answer_index = p_choice, q.answer_index::int, q.fact
  from public.trivia_questions q
  where q.id = p_question and q.active
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.can_edit_actor(text) from public;
revoke all on function public.actor_follower_counts(text[]) from public;
revoke all on function public.answer_trivia(text, int) from public;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.can_edit_actor(text) to anon, authenticated;
grant execute on function public.actor_follower_counts(text[]) to anon, authenticated;
grant execute on function public.answer_trivia(text, int) to anon, authenticated;

-- ── Start from zero privileges, then grant exactly what the API needs ──────
revoke all on all tables in schema public from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.actors enable row level security;
alter table public.titles enable row level security;
alter table public.credits enable row level security;
alter table public.awards enable row level security;
alter table public.news enable row level security;
alter table public.trivia_questions enable row level security;
alter table public.favorite_actors enable row level security;
alter table public.watchlist enable row level security;
alter table public.trivia_attempts enable row level security;

-- profiles: own row only; is_admin is not updatable by anyone through the API
grant select on public.profiles to authenticated;
grant update (display_name, city, favorite_genres) on public.profiles to authenticated;
create policy "profiles: read own" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- actors: public read; signed-in create; owner/admin update+delete.
-- spotlight / trending_rank / created_by are deliberately not grantable.
grant select on public.actors to anon, authenticated;
grant insert (id, name, stage_name, tagline, birthdate, hometown, network, agency, generation,
              gender, decades, genres, base_fans, bio, photo_url, socials)
  on public.actors to authenticated;
grant update (name, stage_name, tagline, birthdate, hometown, network, agency, generation,
              gender, decades, genres, base_fans, bio, photo_url, socials)
  on public.actors to authenticated;
grant delete on public.actors to authenticated;
create policy "actors: public read" on public.actors for select to anon, authenticated using (true);
create policy "actors: signed-in create" on public.actors for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "actors: owner or admin update" on public.actors for update to authenticated
  using (created_by = (select auth.uid()) or (select public.is_admin()))
  with check (created_by = (select auth.uid()) or (select public.is_admin()));
create policy "actors: owner or admin delete" on public.actors for delete to authenticated
  using (created_by = (select auth.uid()) or (select public.is_admin()));

-- titles: public read; signed-in users may add new titles (via credits)
grant select on public.titles to anon, authenticated;
grant insert (id, title, year, type, poster_url) on public.titles to authenticated;
create policy "titles: public read" on public.titles for select to anon, authenticated using (true);
create policy "titles: signed-in create" on public.titles for insert to authenticated
  with check (created_by = (select auth.uid()));

-- credits & awards: follow the parent actor's edit rights
grant select on public.credits, public.awards to anon, authenticated;
grant insert (actor_id, title_id, role, position), delete on public.credits to authenticated;
grant insert (actor_id, title, org, year, won, position), delete on public.awards to authenticated;
create policy "credits: public read" on public.credits for select to anon, authenticated using (true);
create policy "credits: editor insert" on public.credits for insert to authenticated
  with check ((select public.can_edit_actor(actor_id)));
create policy "credits: editor delete" on public.credits for delete to authenticated
  using ((select public.can_edit_actor(actor_id)));
create policy "awards: public read" on public.awards for select to anon, authenticated using (true);
create policy "awards: editor insert" on public.awards for insert to authenticated
  with check ((select public.can_edit_actor(actor_id)));
create policy "awards: editor delete" on public.awards for delete to authenticated
  using ((select public.can_edit_actor(actor_id)));

-- news: read-only
grant select on public.news to anon, authenticated;
create policy "news: public read" on public.news for select to anon, authenticated using (true);

-- trivia: answer columns withheld (see answer_trivia)
grant select (id, prompt, actor_id, choices, active, position, created_at)
  on public.trivia_questions to anon, authenticated;
create policy "trivia: public read active" on public.trivia_questions for select to anon, authenticated
  using (active);

-- favorites / watchlist / attempts: owner-only
grant select, delete on public.favorite_actors, public.watchlist to authenticated;
grant insert (actor_id) on public.favorite_actors to authenticated;
grant insert (title_id) on public.watchlist to authenticated;
grant select on public.trivia_attempts to authenticated;
grant insert (score, total, best_streak) on public.trivia_attempts to authenticated;

create policy "favorites: own read" on public.favorite_actors for select to authenticated
  using (user_id = (select auth.uid()));
create policy "favorites: own insert" on public.favorite_actors for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "favorites: own delete" on public.favorite_actors for delete to authenticated
  using (user_id = (select auth.uid()));
create policy "watchlist: own read" on public.watchlist for select to authenticated
  using (user_id = (select auth.uid()));
create policy "watchlist: own insert" on public.watchlist for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "watchlist: own delete" on public.watchlist for delete to authenticated
  using (user_id = (select auth.uid()));
create policy "attempts: own read" on public.trivia_attempts for select to authenticated
  using (user_id = (select auth.uid()));
create policy "attempts: own insert" on public.trivia_attempts for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Future tables must opt in explicitly; stop Supabase's default blanket grants.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ── Storage: public-read media bucket, users write only under {uid}/ ────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "media: users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media: users delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
