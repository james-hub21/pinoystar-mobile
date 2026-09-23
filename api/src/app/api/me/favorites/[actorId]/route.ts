import type { NextRequest } from 'next/server';
import { fromDbError, noContent, route } from '@/lib/http';
import { requireAuth } from '@/lib/supabase';
import { slugParam } from '@/lib/validation';

type Ctx = RouteContext<'/api/me/favorites/[actorId]'>;

// PUT /api/me/favorites/:actorId — follow (idempotent)
export const PUT = route(async (req: NextRequest, ctx: Ctx) => {
  const actorId = slugParam.parse((await ctx.params).actorId);
  const auth = await requireAuth(req);
  const { error } = await auth.client
    .from('favorite_actors')
    .upsert({ actor_id: actorId }, { onConflict: 'user_id,actor_id', ignoreDuplicates: true });
  if (error) throw fromDbError(error);
  return noContent();
});

// DELETE /api/me/favorites/:actorId — unfollow (idempotent)
export const DELETE = route(async (req: NextRequest, ctx: Ctx) => {
  const actorId = slugParam.parse((await ctx.params).actorId);
  const auth = await requireAuth(req);
  const { error } = await auth.client.from('favorite_actors').delete().eq('actor_id', actorId);
  if (error) throw fromDbError(error);
  return noContent();
});
