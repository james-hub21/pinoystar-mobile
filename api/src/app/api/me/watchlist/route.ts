import type { NextRequest } from 'next/server';
import { absUrl } from '@/lib/actors';
import { fromDbError, json, route } from '@/lib/http';
import { requireAuth } from '@/lib/supabase';

// GET /api/me/watchlist — saved shows & movies, newest first
export const GET = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const { data, error } = await auth.client
    .from('watchlist')
    .select('created_at, titles ( id, title, year, type, poster_url, note )')
    .order('created_at', { ascending: false });
  if (error) throw fromDbError(error);

  return json({
    data: (data ?? []).flatMap((w) =>
      w.titles
        ? [{
            id: w.titles.id,
            title: w.titles.title,
            year: w.titles.year,
            type: w.titles.type,
            posterUrl: absUrl(req, w.titles.poster_url),
            note: w.titles.note,
          }]
        : [],
    ),
  });
});
