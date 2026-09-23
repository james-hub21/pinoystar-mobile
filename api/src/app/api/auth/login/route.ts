import type { NextRequest } from 'next/server';
import { ApiError, json, readJson, route } from '@/lib/http';
import { toSessionDto } from '@/lib/session';
import { db } from '@/lib/supabase';
import { loginInput } from '@/lib/validation';

// POST /api/auth/login — exchange email + password for tokens
export const POST = route(async (req: NextRequest) => {
  const input = loginInput.parse(await readJson(req));
  const { data, error } = await db().auth.signInWithPassword(input);

  if (error || !data.session) {
    if (error?.code === 'email_not_confirmed') {
      throw new ApiError(403, 'email_not_confirmed', 'Please confirm your email first — check your inbox.');
    }
    if (error?.status === 429) throw new ApiError(429, 'rate_limited', 'Too many attempts. Please wait a minute.');
    throw new ApiError(401, 'invalid_credentials', 'That email and password don’t match.');
  }
  return json(toSessionDto(data.session));
});
