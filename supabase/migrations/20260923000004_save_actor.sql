-- Atomic create/update of an actor with its credits and awards.
-- SECURITY INVOKER: runs with the caller's grants + RLS, so it can never do more than the
-- caller could with individual statements. The API validates the payload with Zod first;
-- the table CHECK constraints are the second line of defence.
create or replace function public.save_actor(p_id text, p jsonb)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id text := p_id;
  v_base text;
  v_title_id text;
  c jsonb;
  w jsonb;
  i int := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if v_id is null then
    v_base := trim(both '-' from regexp_replace(
      translate(lower(p ->> 'name'), 'ñáàâäéèêëíìîïóòôöúùûü', 'naaaaeeeeiiiioooouuuu'),
      '[^a-z0-9]+', '-', 'g'));
    if v_base = '' then v_base := 'star'; end if;
    v_base := left(v_base, 80);
    v_id := v_base;
    while exists (select 1 from public.actors a where a.id = v_id) loop
      v_id := v_base || '-' || substr(md5(random()::text), 1, 5);
    end loop;

    insert into public.actors (id, name, stage_name, tagline, birthdate, hometown, network, agency,
                               generation, gender, decades, genres, base_fans, bio, photo_url, socials)
    values (
      v_id, p ->> 'name', coalesce(p ->> 'stageName', ''), p ->> 'tagline',
      nullif(p ->> 'birthdate', '')::date, coalesce(p ->> 'hometown', ''), p ->> 'network',
      coalesce(p ->> 'agency', ''), p ->> 'generation', p ->> 'gender',
      array(select jsonb_array_elements_text(coalesce(p -> 'decades', '[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(p -> 'genres', '[]'::jsonb))),
      coalesce((p ->> 'baseFans')::bigint, 0), coalesce(p ->> 'bio', ''),
      nullif(p ->> 'photoUrl', ''), coalesce(p -> 'socials', '{}'::jsonb)
    );
  else
    update public.actors set
      name = p ->> 'name',
      stage_name = coalesce(p ->> 'stageName', ''),
      tagline = p ->> 'tagline',
      birthdate = nullif(p ->> 'birthdate', '')::date,
      hometown = coalesce(p ->> 'hometown', ''),
      network = p ->> 'network',
      agency = coalesce(p ->> 'agency', ''),
      generation = p ->> 'generation',
      gender = p ->> 'gender',
      decades = array(select jsonb_array_elements_text(coalesce(p -> 'decades', '[]'::jsonb))),
      genres = array(select jsonb_array_elements_text(coalesce(p -> 'genres', '[]'::jsonb))),
      base_fans = coalesce((p ->> 'baseFans')::bigint, 0),
      bio = coalesce(p ->> 'bio', ''),
      photo_url = nullif(p ->> 'photoUrl', ''),
      socials = coalesce(p -> 'socials', '{}'::jsonb)
    where id = v_id;
    if not found then
      -- Either missing or RLS hid it from this user; the API distinguishes 404/403 beforehand.
      raise exception 'actor not found or not editable' using errcode = '42501';
    end if;

    delete from public.credits where actor_id = v_id;
    delete from public.awards where actor_id = v_id;
  end if;

  for c in select * from jsonb_array_elements(coalesce(p -> 'credits', '[]'::jsonb)) loop
    v_title_id := trim(both '-' from regexp_replace(
      translate(lower(c ->> 'title'), 'ñáàâäéèêëíìîïóòôöúùûü', 'naaaaeeeeiiiioooouuuu'),
      '[^a-z0-9]+', '-', 'g'));
    if v_title_id = '' then continue; end if;
    insert into public.titles (id, title, year, type)
    values (v_title_id, c ->> 'title', (c ->> 'year')::int, c ->> 'type')
    on conflict (id) do nothing;
    insert into public.credits (actor_id, title_id, role, position)
    values (v_id, v_title_id, c ->> 'role', i);
    i := i + 1;
  end loop;

  i := 0;
  for w in select * from jsonb_array_elements(coalesce(p -> 'awards', '[]'::jsonb)) loop
    insert into public.awards (actor_id, title, org, year, won, position)
    values (v_id, w ->> 'title', w ->> 'org', (w ->> 'year')::int, coalesce((w ->> 'won')::boolean, false), i);
    i := i + 1;
  end loop;

  return v_id;
end;
$$;

revoke all on function public.save_actor(text, jsonb) from public, anon;
grant execute on function public.save_actor(text, jsonb) to authenticated;
