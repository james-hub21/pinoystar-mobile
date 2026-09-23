import { json, route } from '@/lib/http';
import { db } from '@/lib/supabase';

// GET /api/health — liveness + database reachability
export const GET = route(async () => {
  const started = Date.now();
  const { error } = await db().from('actors').select('id', { head: true, count: 'exact' });
  return json(
    { ok: !error, database: error ? 'unreachable' : 'ok', latencyMs: Date.now() - started, time: new Date().toISOString() },
    error ? 503 : 200,
  );
});
