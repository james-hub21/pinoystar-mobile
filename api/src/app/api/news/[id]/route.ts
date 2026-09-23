import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { absUrl } from '@/lib/actors';
import { fromDbError, json, notFound, route } from '@/lib/http';
import { db } from '@/lib/supabase';

// GET /api/news/:id — full story (public)
export const GET = route(async (req: NextRequest, ctx: RouteContext<'/api/news/[id]'>) => {
  const id = z.string().max(40).parse((await ctx.params).id);
  const { data: n, error } = await db()
    .from('news')
    .select('id, headline, excerpt, body, source, minutes_read, published_at, image_url, tag, actors ( id, name, photo_url, tagline )')
    .eq('id', id)
    .maybeSingle();
  if (error) throw fromDbError(error);
  if (!n) throw notFound('That story is no longer available.');
  return json({
    id: n.id,
    headline: n.headline,
    excerpt: n.excerpt,
    body: n.body,
    source: n.source,
    minutesRead: n.minutes_read,
    publishedAt: n.published_at,
    imageUrl: absUrl(req, n.image_url),
    tag: n.tag,
    actor: n.actors
      ? { id: n.actors.id, name: n.actors.name, tagline: n.actors.tagline, photoUrl: absUrl(req, n.actors.photo_url) }
      : null,
  });
});
