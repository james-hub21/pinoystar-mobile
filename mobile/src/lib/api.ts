import { API_URL } from './config';
import { getItem, removeItem, setItem } from './storage';
import type { Session } from './types';

/** An error response from our API: `{ error: { code, message, fields? } }`. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

const SESSION_KEY = 'pinoystars.session';
let session: Session | null = null;
const listeners = new Set<(s: Session | null) => void>();

export function getSession() {
  return session;
}

export function onSessionChange(fn: (s: Session | null) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export async function setSession(next: Session | null) {
  session = next;
  if (next) await setItem(SESSION_KEY, JSON.stringify(next));
  else await removeItem(SESSION_KEY);
  listeners.forEach((fn) => fn(next));
}

export async function restoreSession(): Promise<Session | null> {
  const raw = await getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    session = JSON.parse(raw) as Session;
    return session;
  } catch {
    await removeItem(SESSION_KEY);
    return null;
  }
}

// One refresh at a time, even if several requests notice an expired token together.
let refreshing: Promise<Session | null> | null = null;

async function refresh(): Promise<Session | null> {
  if (!session) return null;
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session!.refreshToken }),
      });
      if (!res.ok) {
        await setSession(null);
        return null;
      }
      const next = (await res.json()) as Session;
      await setSession(next);
      return next;
    } catch {
      return session; // offline: keep the old session, the request itself will report the error
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  form?: FormData;
  signal?: AbortSignal;
}

async function send(path: string, opts: RequestOptions, token: string | null) {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
    signal: opts.signal,
  });
}

/** Call our REST API. Attaches the bearer token, refreshes it when needed, and throws ApiError. */
export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (session && session.expiresAt - 60 < Date.now() / 1000) await refresh();

  let res: Response;
  try {
    res = await send(path, opts, session?.accessToken ?? null);
    if (res.status === 401 && session) {
      const next = await refresh();
      if (next) res = await send(path, opts, next.accessToken);
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(0, 'network', "Can't reach PinoyStars right now. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    throw new ApiError(res.status, err?.code ?? 'error', err?.message ?? 'Something went wrong. Please try again.', err?.fields);
  }
  return data as T;
}

export function toQuery(params: Record<string, string | number | boolean | string[] | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '' || v === false) continue;
    if (Array.isArray(v)) {
      if (v.length) q.set(k, v.join(','));
    } else q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}
