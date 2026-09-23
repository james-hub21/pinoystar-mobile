-- Real actors: photo attribution (Wikimedia Commons) + the actor's Wikipedia article title.
-- Both columns are seed/admin-curated metadata, so they are readable but not grantable for
-- insert/update to regular users (table-level SELECT already covers new columns).
alter table public.actors
  add column photo_credit text not null default '' check (char_length(photo_credit) <= 300),
  add column photo_source text check (photo_source is null or photo_source ~ '^https://'),
  add column wiki_title text check (wiki_title is null or char_length(wiki_title) between 1 and 200);

-- A replaced photo is no longer the credited one: drop its attribution automatically.
create or replace function public.actors_clear_photo_credit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.photo_url is distinct from old.photo_url then
    new.photo_credit := '';
    new.photo_source := null;
  end if;
  return new;
end;
$$;

create trigger actors_clear_photo_credit
  before update of photo_url on public.actors
  for each row execute function public.actors_clear_photo_credit();

revoke all on function public.actors_clear_photo_credit() from public, anon, authenticated;
