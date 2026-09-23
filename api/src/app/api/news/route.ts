import type { NextRequest } from 'next/server';
import { absUrl } from '@/lib/actors';
import { fromDbError, json, route } from '@/lib/http';
import { db } from '@/lib/supabase';

// GET /api/news — latest showbiz stories (public)
export const GET = route(async (req: NextRequest) => {
  const { data, error } = await db()
    .from('news')
    .select('id, headline, excerpt, source, minutes_read, published_at, image_url, tag, actor_id')
    .order('published_at', { ascending: false })
    .limit(30);
  if (error) throw fromDbError(error);
  return json({
    data: (data ?? []).map((n) => ({
      id: n.id,
      headline: n.headline,
      excerpt: n.excerpt,
      source: n.source,
      minutesRead: n.minutes_read,
      publishedAt: n.published_at,
      imageUrl: absUrl(req, n.image_url),
      tag: n.tag,
      actorId: n.actor_id,
    })),
  });
});
