// Third-party API integration: Wikipedia REST API (https://en.wikipedia.org/api/rest_v1/).
// No API key is required. Wikimedia asks clients to send an identifying Api-User-Agent header.
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { WIKI_USER_AGENT, WIKIPEDIA_REST, WIKIPEDIA_SEARCH } from './config';

export class WikiError extends Error {}

/** Image source for Wikimedia files: upload.wikimedia.org also 403s generic agents like okhttp. */
export const wikiImage = (uri: string) =>
  Platform.OS === 'web' ? { uri } : { uri, headers: { 'User-Agent': WIKI_USER_AGENT } };

async function wiki<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    // Native apps can (and must) send a real User-Agent; browsers don't allow it, so web uses Api-User-Agent.
    const headers: Record<string, string> = { Accept: 'application/json', 'Api-User-Agent': WIKI_USER_AGENT };
    if (Platform.OS !== 'web') headers['User-Agent'] = WIKI_USER_AGENT;
    res = await fetch(url, { headers, signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new WikiError("Can't reach Wikipedia right now. Check your connection.");
  }
  if (res.status === 404) throw new WikiError('Wikipedia has no page with that title.');
  if (!res.ok) throw new WikiError(`Wikipedia is having trouble (HTTP ${res.status}). Try again soon.`);
  return res.json() as Promise<T>;
}

const https = (u?: string | null) => (u ? (u.startsWith('//') ? `https:${u}` : u) : null);
const stripHtml = (s: string) =>
  s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

// ── Search ─────────────────────────────────────────────────────────────────
interface RawSearch {
  pages: { id: number; key: string; title: string; excerpt: string; description: string | null; thumbnail: { url: string } | null }[];
}

export interface WikiSearchHit {
  id: number;
  key: string;
  title: string;
  description: string;
  excerpt: string;
  thumbnail: string | null;
}

export function useWikiSearch(q: string) {
  const query = q.trim();
  return useQuery({
    queryKey: ['wiki', 'search', query],
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60_000,
    queryFn: async ({ signal }) => {
      const data = await wiki<RawSearch>(`${WIKIPEDIA_SEARCH}?q=${encodeURIComponent(query)}&limit=15`, signal);
      return data.pages.map<WikiSearchHit>((p) => ({
        id: p.id,
        key: p.key,
        title: p.title,
        description: p.description ?? '',
        excerpt: stripHtml(p.excerpt),
        thumbnail: https(p.thumbnail?.url),
      }));
    },
  });
}

// ── Page summary ───────────────────────────────────────────────────────────
interface RawSummary {
  title: string;
  description?: string;
  extract: string;
  thumbnail?: { source: string };
  originalimage?: { source: string };
  content_urls?: { mobile?: { page: string }; desktop?: { page: string } };
}

export interface WikiSummary {
  title: string;
  description: string;
  extract: string;
  image: string | null;
  url: string;
}

const toSummary = (s: RawSummary, key: string): WikiSummary => ({
  title: s.title,
  description: s.description ?? '',
  extract: s.extract,
  image: https(s.thumbnail?.source ?? s.originalimage?.source),
  url: s.content_urls?.mobile?.page ?? s.content_urls?.desktop?.page ?? `https://en.m.wikipedia.org/wiki/${key}`,
});

export function useWikiSummary(key: string | null) {
  return useQuery({
    queryKey: ['wiki', 'summary', key],
    enabled: !!key,
    staleTime: 60 * 60_000,
    queryFn: ({ signal }) =>
      wiki<RawSummary>(`${WIKIPEDIA_REST}/page/summary/${encodeURIComponent(key!)}`, signal).then((s) => toSummary(s, key!)),
  });
}

// ── On this day: actors & actresses born today ────────────────────────────
interface RawOnThisDay {
  births: {
    text: string;
    year: number;
    pages: (RawSummary & { normalizedtitle?: string; titles?: { canonical: string; normalized: string } })[];
  }[];
}

export interface WikiBirth {
  year: number;
  key: string;
  name: string;
  description: string;
  image: string | null;
  filipino: boolean;
}

export function useBornToday() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return useQuery({
    queryKey: ['wiki', 'born', mm, dd],
    staleTime: 6 * 60 * 60_000,
    queryFn: async ({ signal }) => {
      const data = await wiki<RawOnThisDay>(`${WIKIPEDIA_REST}/feed/onthisday/births/${mm}/${dd}`, signal);
      const births = data.births.flatMap<WikiBirth>((b) => {
        const p = b.pages?.[0];
        if (!p || !/\b(actor|actress)\b/i.test(p.description ?? '')) return [];
        const title = p.titles?.normalized ?? p.normalizedtitle ?? p.title.replace(/_/g, ' ');
        return [{
          year: b.year,
          key: p.titles?.canonical ?? p.title.replace(/ /g, '_'),
          name: title.replace(/\s*\((actor|actress|[^)]*actor|[^)]*actress)\)$/i, ''), // "Bai Lu (actress)" → "Bai Lu"
          description: p.description ?? '',
          image: https(p.thumbnail?.source),
          filipino: /filipin|philippine/i.test(p.description ?? ''),
        }];
      });
      // Filipino stars first, then everyone with a photo, newest birth years first.
      return births
        .sort((a, b) => Number(b.filipino) - Number(a.filipino) || Number(!!b.image) - Number(!!a.image) || b.year - a.year)
        .slice(0, 12);
    },
  });
}
