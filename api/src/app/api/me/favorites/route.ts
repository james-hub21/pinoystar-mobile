import type { NextRequest } from 'next/server';
import { ACTOR_LIST_COLUMNS, followerCounts, toActorSummary } from '@/lib/actors';
import { fromDbError, json, route } from '@/lib/http';
import { requireAuth } from '@/lib/supabase';

// GET /api/me/favorites — stars I follow, newest first
export const GET = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const { data, error } = await auth.client
    .from('favorite_actors')
    .select(`created_at, actors ( ${ACTOR_LIST_COLUMNS} )`)
    .order('created_at', { ascending: false });
  if (error) throw fromDbError(error);

  const rows = (data ?? []).flatMap((f) => (f.actors ? [f.actors] : []));
  const counts = await followerCounts(auth.client, rows.map((r) => r.id));
  return json({ data: rows.map((r) => toActorSummary(req, r, counts.get(r.id) ?? 0, auth.userId)) });
});
