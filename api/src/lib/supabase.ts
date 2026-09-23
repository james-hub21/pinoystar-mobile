import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import type { Database } from './database.types';
import { unauthorized } from './http';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. Copy api/.env.example to api/.env.local.');
}

export type Db = SupabaseClient<Database>;

/**
 * A per-request Supabase client. With a user token, every query runs as that user under
 * Postgres RLS; without one it runs as `anon`. This API never uses a service-role key.
 */
export function db(accessToken?: string | null): Db {
  return createClient<Database>(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

export const SUPABASE_URL = url;
export const SUPABASE_KEY = key;

export interface AuthContext {
  token: string;
  userId: string;
  email: string | null;
  client: Db;
}

function bearer(req: NextRequest): string | null {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

/** Verifies the bearer token with Supabase Auth. Returns null when absent or invalid. */
export async function getAuth(req: NextRequest): Promise<AuthContext | null> {
  const token = bearer(req);
  if (!token) return null;
  const client = db(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { token, userId: data.user.id, email: data.user.email ?? null, client };
}

export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const token = bearer(req);
  const auth = await getAuth(req);
  if (!auth) {
    throw unauthorized(token ? 'Your session has expired. Please sign in again.' : undefined);
  }
  return auth;
}
