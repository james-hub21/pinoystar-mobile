import type { NextRequest } from 'next/server';
import { ApiError, json, readJson, route } from '@/lib/http';
import { toSessionDto } from '@/lib/session';
import { db } from '@/lib/supabase';
import { signupInput } from '@/lib/validation';

// POST /api/auth/signup — create an account
export const POST = route(async (req: NextRequest) => {
  const input = signupInput.parse(await readJson(req));
  const { data, error } = await db().auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { display_name: input.displayName } },
  });

  if (error) {
    if (error.code === 'user_already_exists' || /already registered/i.test(error.message)) {
      throw new ApiError(409, 'email_taken', 'An account with that email already exists. Try signing in.', {
        email: 'This email is already registered.',
      });
    }
    if (error.code === 'weak_password') {
      throw new ApiError(422, 'weak_password', error.message, { password: error.message });
    }
    if (error.status === 429) throw new ApiError(429, 'rate_limited', 'Too many attempts. Please wait a minute.');
    throw new ApiError(400, 'signup_failed', error.message);
  }

  // With "Confirm email" off, Supabase returns a session immediately.
  if (data.session) return json({ ...toSessionDto(data.session), needsConfirmation: false }, 201);
  return json({ needsConfirmation: true, message: 'Check your inbox to confirm your email, then sign in.' }, 201);
});
