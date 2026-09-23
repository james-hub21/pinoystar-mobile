-- Move RLS helper functions out of the PostgREST-exposed `public` schema.
-- Policies reference functions by OID, so they keep working after the move.
-- actor_follower_counts / answer_trivia stay public on purpose: they are the API's RPCs and
-- only ever return aggregate counts or the answer to a question the caller just attempted.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.is_admin() set schema private;
alter function public.can_edit_actor(text) set schema private;

create or replace function private.can_edit_actor(p_actor text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.actors a
    where a.id = p_actor
      and auth.uid() is not null
      and (a.created_by = auth.uid() or private.is_admin())
  )
$$;
