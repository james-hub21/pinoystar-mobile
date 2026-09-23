import type { NextRequest } from 'next/server';
import { fromDbError, noContent, route } from '@/lib/http';
import { requireAuth } from '@/lib/supabase';
import { slugParam } from '@/lib/validation';

type Ctx = RouteContext<'/api/me/watchlist/[titleId]'>;

// PUT /api/me/watchlist/:titleId — save (idempotent)
export const PUT = route(async (req: NextRequest, ctx: Ctx) => {
  const titleId = slugParam.parse((await ctx.params).titleId);
  const auth = await requireAuth(req);
  const { error } = await auth.client
    .from('watchlist')
    .upsert({ title_id: titleId }, { onConflict: 'user_id,title_id', ignoreDuplicates: true });
  if (error) throw fromDbError(error);
  return noContent();
});

// DELETE /api/me/watchlist/:titleId — unsave (idempotent)
export const DELETE = route(async (req: NextRequest, ctx: Ctx) => {
  const titleId = slugParam.parse((await ctx.params).titleId);
  const auth = await requireAuth(req);
  const { error } = await auth.client.from('watchlist').delete().eq('title_id', titleId);
  if (error) throw fromDbError(error);
  return noContent();
});
