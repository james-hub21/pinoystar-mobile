import type { NextRequest } from 'next/server';
import { json, readJson, route, unauthorized } from '@/lib/http';
import { toSessionDto } from '@/lib/session';
import { db } from '@/lib/supabase';
import { refreshInput } from '@/lib/validation';

// POST /api/auth/refresh — trade a refresh token for a fresh access token
export const POST = route(async (req: NextRequest) => {
  const { refreshToken } = refreshInput.parse(await readJson(req));
  const { data, error } = await db().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) throw unauthorized('Your session has expired. Please sign in again.');
  return json(toSessionDto(data.session));
});
