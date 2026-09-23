import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { api, toQuery } from './api';
import { useAuth } from './auth';
import type {
  ActorDetail, ActorFilters, ActorInput, ActorPage, ActorSummary, Me, NewsDetail, NewsItem,
  TriviaQuestion, TriviaResult, WatchTitle,
} from './types';

export const keys = {
  actors: (f: ActorFilters = {}) => ['actors', f] as const,
  actor: (id: string) => ['actor', id] as const,
  favorites: ['favorites'] as const,
  watchlist: ['watchlist'] as const,
  me: ['me'] as const,
  news: ['news'] as const,
  newsItem: (id: string) => ['news', id] as const,
  trivia: ['trivia'] as const,
};

// ── Read (GET) ─────────────────────────────────────────────────────────────
export function useActors(filters: ActorFilters = {}) {
  return useQuery({
    queryKey: keys.actors(filters),
    queryFn: ({ signal }) => api<ActorPage>(`/api/actors${toQuery({ ...filters })}`, { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useActor(id: string | undefined) {
  return useQuery({
    queryKey: keys.actor(id ?? ''),
    queryFn: ({ signal }) => api<ActorDetail>(`/api/actors/${id}`, { signal }),
    enabled: !!id,
  });
}

export function useNews() {
  return useQuery({ queryKey: keys.news, queryFn: () => api<{ data: NewsItem[] }>('/api/news').then((r) => r.data) });
}

export function useNewsItem(id: string | undefined) {
  return useQuery({ queryKey: keys.newsItem(id ?? ''), queryFn: () => api<NewsDetail>(`/api/news/${id}`), enabled: !!id });
}

export function useTrivia() {
  return useQuery({
    queryKey: keys.trivia,
    queryFn: () => api<{ data: TriviaQuestion[] }>('/api/trivia').then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useMe() {
  const { status } = useAuth();
  return useQuery({ queryKey: keys.me, queryFn: () => api<Me>('/api/me'), enabled: status === 'signedIn' });
}

export function useFavorites() {
  const { status } = useAuth();
  return useQuery({
    queryKey: keys.favorites,
    queryFn: () => api<{ data: ActorSummary[] }>('/api/me/favorites').then((r) => r.data),
    enabled: status === 'signedIn',
  });
}

export function useWatchlist() {
  const { status } = useAuth();
  return useQuery({
    queryKey: keys.watchlist,
    queryFn: () => api<{ data: WatchTitle[] }>('/api/me/watchlist').then((r) => r.data),
    enabled: status === 'signedIn',
  });
}

// ── Create / Update / Delete ──────────────────────────────────────────────
export function useCreateActor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ActorInput) => api<ActorDetail>('/api/actors', { method: 'POST', body: input }),
    onSuccess: (actor) => {
      qc.setQueryData(keys.actor(actor.id), actor);
      qc.invalidateQueries({ queryKey: ['actors'] });
      qc.invalidateQueries({ queryKey: keys.me });
    },
  });
}

export function useUpdateActor(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ActorInput) => api<ActorDetail>(`/api/actors/${id}`, { method: 'PUT', body: input }),
    onSuccess: (actor) => {
      qc.setQueryData(keys.actor(id), actor);
      qc.invalidateQueries({ queryKey: ['actors'] });
      qc.invalidateQueries({ queryKey: keys.favorites });
    },
  });
}

export function useDeleteActor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/actors/${id}`, { method: 'DELETE' }),
    onSuccess: (_void, id) => {
      qc.removeQueries({ queryKey: keys.actor(id) });
      qc.invalidateQueries({ queryKey: ['actors'] });
      qc.invalidateQueries({ queryKey: keys.favorites });
      qc.invalidateQueries({ queryKey: keys.me });
    },
  });
}

/** Upload a picked image to POST /api/uploads and return its public URL. */
export async function uploadPhoto(asset: { uri: string; mimeType?: string | null; fileName?: string | null }) {
  const form = new FormData();
  const name = asset.fileName ?? `photo.${asset.mimeType?.split('/')[1] ?? 'jpg'}`;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    form.append('file', blob, name);
  } else {
    // React Native's FormData accepts a { uri, name, type } descriptor for files.
    form.append('file', { uri: asset.uri, name, type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
  }
  return api<{ url: string }>('/api/uploads', { method: 'POST', form }).then((r) => r.url);
}

// ── Favorites & watchlist (optimistic) ────────────────────────────────────
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actor, on }: { actor: ActorSummary; on: boolean }) =>
      api<void>(`/api/me/favorites/${actor.id}`, { method: on ? 'PUT' : 'DELETE' }),
    onMutate: async ({ actor, on }) => {
      await qc.cancelQueries({ queryKey: keys.favorites });
      const prevList = qc.getQueryData<ActorSummary[]>(keys.favorites);
      const prevDetail = qc.getQueryData<ActorDetail>(keys.actor(actor.id));
      qc.setQueryData<ActorSummary[]>(keys.favorites, (list = []) =>
        on ? [actor, ...list.filter((a) => a.id !== actor.id)] : list.filter((a) => a.id !== actor.id),
      );
      if (prevDetail && prevDetail.isFavorite !== on) {
        qc.setQueryData<ActorDetail>(keys.actor(actor.id), {
          ...prevDetail,
          isFavorite: on,
          fans: prevDetail.fans + (on ? 1 : -1),
        });
      }
      return { prevList, prevDetail };
    },
    onError: (_e, { actor }, ctx) => {
      qc.setQueryData(keys.favorites, ctx?.prevList);
      if (ctx?.prevDetail) qc.setQueryData(keys.actor(actor.id), ctx.prevDetail);
    },
    onSettled: (_d, _e, { actor }) => {
      qc.invalidateQueries({ queryKey: keys.favorites });
      qc.invalidateQueries({ queryKey: keys.actor(actor.id) });
      qc.invalidateQueries({ queryKey: keys.me });
    },
  });
}

export function useToggleWatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, on }: { title: WatchTitle; on: boolean }) =>
      api<void>(`/api/me/watchlist/${title.id}`, { method: on ? 'PUT' : 'DELETE' }),
    onMutate: async ({ title, on }) => {
      await qc.cancelQueries({ queryKey: keys.watchlist });
      const prev = qc.getQueryData<WatchTitle[]>(keys.watchlist);
      qc.setQueryData<WatchTitle[]>(keys.watchlist, (list = []) =>
        on ? [title, ...list.filter((t) => t.id !== title.id)] : list.filter((t) => t.id !== title.id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(keys.watchlist, ctx?.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.watchlist });
      qc.invalidateQueries({ queryKey: keys.me });
    },
  });
}

// ── Trivia & profile ──────────────────────────────────────────────────────
export const answerTrivia = (id: string, choice: number) =>
  api<TriviaResult>(`/api/trivia/${id}/answer`, { method: 'POST', body: { choice } });

export function useSaveAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: { score: number; total: number; bestStreak: number }) =>
      api('/api/trivia/attempts', { method: 'POST', body: a }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.me }),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Pick<Me, 'displayName' | 'city' | 'favoriteGenres'>) => api<Me>('/api/me', { method: 'PUT', body }),
    onSuccess: (me) => qc.setQueryData(keys.me, me),
  });
}
