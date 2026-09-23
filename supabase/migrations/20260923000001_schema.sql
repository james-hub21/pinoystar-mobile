-- PinoyStars core schema. Every table gets RLS in 20260923000002_security.sql.

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Profiles ────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Fan' check (char_length(display_name) between 1 and 60),
  city text check (city is null or char_length(city) <= 60),
  favorite_genres text[] not null default '{}',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Fan'), 60)
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Actors (the CRUD resource) ──────────────────────────────────────────────
create table public.actors (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 90),
  name text not null check (char_length(name) between 2 and 80),
  stage_name text not null default '' check (char_length(stage_name) <= 60),
  tagline text not null check (char_length(tagline) between 5 and 140),
  birthdate date,
  hometown text not null default '' check (char_length(hometown) <= 80),
  network text not null check (network in ('ABS-CBN', 'GMA', 'Viva', 'TV5', 'Independent')),
  agency text not null default '' check (char_length(agency) <= 80),
  generation text not null check (generation in ('Legends', 'Millennial', 'Gen Z')),
  gender text not null check (gender in ('Female', 'Male')),
  decades text[] not null default '{}',
  genres text[] not null default '{}',
  base_fans bigint not null default 0 check (base_fans >= 0),
  bio text not null default '' check (char_length(bio) <= 3000),
  photo_url text check (photo_url is null or char_length(photo_url) <= 500),
  socials jsonb not null default '{}'::jsonb,
  spotlight boolean not null default false,
  trending_rank int,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index actors_created_by_idx on public.actors (created_by);
create trigger actors_updated_at before update on public.actors
  for each row execute function public.set_updated_at();

-- ── Titles, credits, awards ─────────────────────────────────────────────────
create table public.titles (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  year int not null check (year between 1900 and 2100),
  type text not null check (type in ('Movie', 'Teleserye', 'Series')),
  poster_url text,
  note text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index titles_created_by_idx on public.titles (created_by);

create table public.credits (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null references public.actors(id) on delete cascade on update cascade,
  title_id text not null references public.titles(id) on delete cascade,
  role text not null check (char_length(role) between 1 and 80),
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index credits_actor_idx on public.credits (actor_id);
create index credits_title_idx on public.credits (title_id);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null references public.actors(id) on delete cascade on update cascade,
  title text not null check (char_length(title) between 1 and 80),
  org text not null check (char_length(org) between 1 and 80),
  year int not null check (year between 1900 and 2100),
  won boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index awards_actor_idx on public.awards (actor_id);

-- ── News & trivia (seeded, read-only for users) ─────────────────────────────
create table public.news (
  id text primary key,
  headline text not null,
  excerpt text not null,
  body text not null default '',
  source text not null,
  minutes_read int not null default 3,
  published_at timestamptz not null default now(),
  image_url text,
  tag text not null,
  actor_id text references public.actors(id) on delete set null on update cascade,
  created_at timestamptz not null default now()
);
create index news_actor_idx on public.news (actor_id);

create table public.trivia_questions (
  id text primary key,
  prompt text not null,
  actor_id text not null references public.actors(id) on delete cascade on update cascade,
  choices text[] not null check (array_length(choices, 1) = 4),
  answer_index smallint not null check (answer_index between 0 and 3),
  fact text not null,
  active boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index trivia_actor_idx on public.trivia_questions (actor_id);

-- ── Per-user data ───────────────────────────────────────────────────────────
create table public.favorite_actors (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  actor_id text not null references public.actors(id) on delete cascade on update cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, actor_id)
);
create index favorite_actors_actor_idx on public.favorite_actors (actor_id);

create table public.watchlist (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title_id text not null references public.titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, title_id)
);
create index watchlist_title_idx on public.watchlist (title_id);

create table public.trivia_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  score int not null check (score >= 0),
  total int not null check (total > 0 and score <= total),
  best_streak int not null default 0 check (best_streak >= 0 and best_streak <= total),
  created_at timestamptz not null default now()
);
create index trivia_attempts_user_idx on public.trivia_attempts (user_id);
