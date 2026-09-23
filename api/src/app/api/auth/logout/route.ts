import type { NextRequest } from 'next/server';
import { noContent, route } from '@/lib/http';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase';

// POST /api/auth/logout — revoke this device's refresh token. Always 204 so the app can clear local state.
export const POST = route(async (req: NextRequest) => {
  const authorization = req.headers.get('authorization');
  if (authorization) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY!, Authorization: authorization },
    }).catch(() => undefined);
  }
  return noContent();
});
