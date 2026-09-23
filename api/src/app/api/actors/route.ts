import type { NextRequest } from 'next/server';
import { ACTOR_LIST_COLUMNS, followerCounts, loadActorDetail, toActorSummary, toStoredUrl } from '@/lib/actors';
import { fromDbError, json, readJson, route } from '@/lib/http';
import { db, getAuth, requireAuth } from '@/lib/supabase';
import { actorInput, actorListQuery } from '@/lib/validation';

/** Strip characters that have meaning inside a PostgREST `or=(...)` filter. */
const safeLike = (q: string) => q.replace(/[,()*%\\:"']/g, ' ').trim();

// GET /api/actors — list & search (public)
// Filters: q, network, generation, gender, genre, decade, creditType (comma-separated), spotlight, mine
export const GET = route(async (req: NextRequest) => {
  const query = actorListQuery.parse(Object.fromEntries(req.nextUrl.searchParams));
  const auth = await getAuth(req);
  const client = auth?.client ?? db();

  let sel = client.from('actors').select(ACTOR_LIST_COLUMNS, { count: 'exact' });

  const q = safeLike(query.q);
  if (q) {
    // Also match stars by the titles of their credits.
    const { data: titleHits, error: titleErr } = await client
      .from('credits')
      .select('actor_id, titles!inner(title)')
      .ilike('titles.title', `%${q}%`)
      .limit(200);
    if (titleErr) throw fromDbError(titleErr);
    const ids = [...new Set((titleHits ?? []).map((c) => c.actor_id))];
    const ors = [`name.ilike.%${q}%`, `stage_name.ilike.%${q}%`, `hometown.ilike.%${q}%`];
    if (ids.length) ors.push(`id.in.(${ids.join(',')})`);
    sel = sel.or(ors.join(','));
  }
  if (query.creditType.length) {
    // Stars with at least one credit of the given type(s), e.g. Movie or Teleserye.
    const { data: typed, error: typeErr } = await client
      .from('credits')
      .select('actor_id, titles!inner(type)')
      .in('titles.type', query.creditType)
      .limit(1000);
    if (typeErr) throw fromDbError(typeErr);
    const ids = [...new Set((typed ?? []).map((c) => c.actor_id))];
    if (!ids.length) return json({ data: [], total: 0, limit: query.limit, offset: query.offset });
    sel = sel.in('id', ids);
  }
  if (query.network.length) sel = sel.in('network', query.network);
  if (query.generation.length) sel = sel.in('generation', query.generation);
  if (query.gender.length) sel = sel.in('gender', query.gender);
  if (query.genre.length) sel = sel.overlaps('genres', query.genre);
  if (query.decade.length) sel = sel.overlaps('decades', query.decade);
  if (query.spotlight === 'true') sel = sel.eq('spotlight', true);
  if (query.mine === 'true') {
    if (!auth) return json({ data: [], total: 0 });
    sel = sel.eq('created_by', auth.userId);
  }

  if (query.sort === 'name') sel = sel.order('name');
  else if (query.sort === 'newest') sel = sel.order('created_at', { ascending: false });
  else sel = sel.order('trending_rank', { ascending: true, nullsFirst: false }).order('base_fans', { ascending: false });

  const { data, error, count } = await sel.range(query.offset, query.offset + query.limit - 1);
  if (error) throw fromDbError(error);

  const rows = data ?? [];
  const counts = await followerCounts(client, rows.map((r) => r.id));
  return json({
    data: rows.map((r) => toActorSummary(req, r, counts.get(r.id) ?? 0, auth?.userId)),
    total: count ?? rows.length,
    limit: query.limit,
    offset: query.offset,
  });
});

// POST /api/actors — create (signed in)
export const POST = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const input = actorInput.parse(await readJson(req));
  const payload = { ...input, photoUrl: toStoredUrl(req, input.photoUrl) };

  const { data: id, error } = await auth.client.rpc('save_actor', { p_id: null, p: payload });
  if (error) throw fromDbError(error);

  const created = await loadActorDetail(req, auth.client, id, auth.userId);
  return json(created, 201);
});
