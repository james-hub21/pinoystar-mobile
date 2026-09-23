import type { NextRequest } from 'next/server';
import { fromDbError, json, notFound, readJson, route } from '@/lib/http';
import { requireAuth, type AuthContext } from '@/lib/supabase';
import { profileUpdate } from '@/lib/validation';

async function loadMe(auth: AuthContext) {
  const c = auth.client;
  const [profile, favorites, watchlist, attempts, mine] = await Promise.all([
    c.from('profiles').select('display_name, city, favorite_genres, is_admin, created_at').eq('id', auth.userId).maybeSingle(),
    c.from('favorite_actors').select('actor_id', { count: 'exact', head: true }),
    c.from('watchlist').select('title_id', { count: 'exact', head: true }),
    c.from('trivia_attempts').select('score, total, best_streak'),
    c.from('actors').select('id', { count: 'exact', head: true }).eq('created_by', auth.userId),
  ]);
  for (const r of [profile, favorites, watchlist, attempts, mine]) if (r.error) throw fromDbError(r.error);
  if (!profile.data) throw notFound('Profile not found.');

  const rounds = attempts.data ?? [];
  return {
    id: auth.userId,
    email: auth.email,
    displayName: profile.data.display_name,
    city: profile.data.city ?? '',
    favoriteGenres: profile.data.favorite_genres,
    isAdmin: profile.data.is_admin,
    memberSince: profile.data.created_at,
    stats: {
      following: favorites.count ?? 0,
      watchlist: watchlist.count ?? 0,
      starsAdded: mine.count ?? 0,
      triviaWins: rounds.reduce((n, r) => n + r.score, 0),
      roundsPlayed: rounds.length,
      bestStreak: rounds.reduce((n, r) => Math.max(n, r.best_streak), 0),
    },
  };
}

// GET /api/me — profile + stats
export const GET = route(async (req: NextRequest) => json(await loadMe(await requireAuth(req))));

// PUT /api/me — update display name, city, favorite genres
export const PUT = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const input = profileUpdate.parse(await readJson(req));
  const { error } = await auth.client
    .from('profiles')
    .update({ display_name: input.displayName, city: input.city || null, favorite_genres: input.favoriteGenres })
    .eq('id', auth.userId);
  if (error) throw fromDbError(error);
  return json(await loadMe(auth));
});
