import { useQueryClient } from '@tanstack/react-query';
import { router, type Href } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getSession, onSessionChange, restoreSession, setSession } from './api';
import type { Session } from './types';

type Status = 'loading' | 'signedIn' | 'signedOut';

interface AuthValue {
  status: Status;
  user: Session['user'] | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setLocal] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    restoreSession().then((s) => {
      setLocal(s);
      setStatus(s ? 'signedIn' : 'signedOut');
    });
    return onSessionChange((s) => {
      setLocal((prev) => {
        // Identity changed (sign in / out / expiry): everything user-specific must refetch.
        if (prev?.user.id !== s?.user.id) queueMicrotask(() => queryClient.resetQueries());
        return s;
      });
      setStatus(s ? 'signedIn' : 'signedOut');
    });
  }, [queryClient]);

  const signIn = useCallback(async (email: string, password: string) => {
    const s = await api<Session>('/api/auth/login', { method: 'POST', body: { email, password } });
    await setSession(s);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await api<Session & { needsConfirmation: boolean }>('/api/auth/signup', {
      method: 'POST',
      body: { email, password, displayName },
    });
    if (!res.needsConfirmation) await setSession(res);
    return { needsConfirmation: res.needsConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    await setSession(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ status, user: session?.user ?? null, signIn, signUp, signOut }),
    [status, session, signIn, signUp, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Run `action` when signed in; otherwise open the login screen and come back afterwards. */
export function useRequireAuth() {
  return useCallback((action: () => void, next?: Href) => {
    if (getSession()) action();
    else router.push({ pathname: '/login', params: next ? { next: String(next) } : {} });
  }, []);
}
