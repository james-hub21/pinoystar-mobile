import type { NextRequest } from 'next/server';
import { assertCanEdit, loadActorDetail, toStoredUrl } from '@/lib/actors';
import { fromDbError, json, noContent, notFound, readJson, route } from '@/lib/http';
import { db, getAuth, requireAuth } from '@/lib/supabase';
import { actorInput, slugParam } from '@/lib/validation';

type Ctx = RouteContext<'/api/actors/[id]'>;

// GET /api/actors/:id — full profile (public; `canEdit` / `isFavorite` when signed in)
export const GET = route(async (req: NextRequest, ctx: Ctx) => {
  const id = slugParam.parse((await ctx.params).id);
  const auth = await getAuth(req);
  const actor = await loadActorDetail(req, auth?.client ?? db(), id, auth?.userId ?? null);
  if (!actor) throw notFound('That star no longer exists.');
  return json(actor);
});

// PUT /api/actors/:id — replace the record (owner or admin)
export const PUT = route(async (req: NextRequest, ctx: Ctx) => {
  const id = slugParam.parse((await ctx.params).id);
  const auth = await requireAuth(req);
  const input = actorInput.parse(await readJson(req));
  await assertCanEdit(auth.client, id, auth.userId);

  const payload = { ...input, photoUrl: toStoredUrl(req, input.photoUrl) };
  const { error } = await auth.client.rpc('save_actor', { p_id: id, p: payload });
  if (error) throw fromDbError(error);

  return json(await loadActorDetail(req, auth.client, id, auth.userId));
});

// DELETE /api/actors/:id — remove the record (owner or admin)
export const DELETE = route(async (req: NextRequest, ctx: Ctx) => {
  const id = slugParam.parse((await ctx.params).id);
  const auth = await requireAuth(req);
  await assertCanEdit(auth.client, id, auth.userId);

  const { error, count } = await auth.client.from('actors').delete({ count: 'exact' }).eq('id', id);
  if (error) throw fromDbError(error);
  if (!count) throw notFound('That star no longer exists.');
  return noContent();
});
