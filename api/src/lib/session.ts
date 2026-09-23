import type { Session } from '@supabase/supabase-js';

/** The token bundle every auth endpoint returns to the mobile app. */
export function toSessionDto(session: Session) {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
    user: { id: session.user.id, email: session.user.email ?? null },
  };
}
