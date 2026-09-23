import 'server-only';
import type { NextRequest } from 'next/server';
import type { Database, Json } from './database.types';
import type { Db } from './supabase';
import { forbidden, fromDbError, notFound } from './http';

type ActorRow = Database['public']['Tables']['actors']['Row'];

/**
 * The origin the *client* used to reach us (e.g. http://10.0.2.2:3000 from the Android emulator,
 * or the Vercel domain). `nextUrl.origin` reflects the bind address instead, which phones can't reach.
 */
function publicOrigin(req: NextRequest): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, '');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host;
  const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  return `${proto}://${host}`;
}

/** Seed images live in api/public/seed and are stored as relative paths; resolve per request. */
export function absUrl(req: NextRequest, path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${publicOrigin(req)}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Inverse of absUrl: store our own seed images as relative paths so they survive a domain change. */
export function toStoredUrl(req: NextRequest, url: string): string {
  if (!url) return '';
  const match = /^https?:\/\/[^/]+(\/seed\/[a-z0-9/_-]+\.(?:png|jpg))$/i.exec(url);
  if (match && url.startsWith(publicOrigin(req))) return match[1];
  return url;
}

export function fansLabel(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

const asSocials = (s: Json): { instagram?: string; x?: string; tiktok?: string } => {
  if (!s || typeof s !== 'object' || Array.isArray(s)) return {};
  const pick = (k: string) => (typeof s[k] === 'string' ? (s[k] as string) : undefined);
  return { instagram: pick('instagram'), x: pick('x'), tiktok: pick('tiktok') };
};

export const ACTOR_LIST_COLUMNS =
  'id, name, stage_name, tagline, hometown, network, generation, gender, genres, decades, base_fans, photo_url, spotlight, trending_rank, created_by, created_at';

type ActorListRow = Pick<
  ActorRow,
  | 'id' | 'name' | 'stage_name' | 'tagline' | 'hometown' | 'network' | 'generation' | 'gender'
  | 'genres' | 'decades' | 'base_fans' | 'photo_url' | 'spotlight' | 'trending_rank' | 'created_by' | 'created_at'
>;

export async function followerCounts(client: Db, ids: string[]): Promise<Map<string, number>> {
  if (!ids.length) return new Map();
  const { data, error } = await client.rpc('actor_follower_counts', { p_ids: ids });
  if (error) throw fromDbError(error);
  return new Map((data ?? []).map((r) => [r.actor_id, Number(r.followers)]));
}

export function toActorSummary(req: NextRequest, row: ActorListRow, followers = 0, userId?: string | null) {
  const fans = Number(row.base_fans) + followers;
  return {
    id: row.id,
    name: row.name,
    stageName: row.stage_name,
    tagline: row.tagline,
    hometown: row.hometown,
    network: row.network,
    generation: row.generation,
    gender: row.gender,
    genres: row.genres,
    decades: row.decades,
    photoUrl: absUrl(req, row.photo_url),
    fans,
    fansLabel: fansLabel(fans),
    spotlight: row.spotlight,
    trendingRank: row.trending_rank,
    isOfficial: row.created_by === null,
    isMine: !!userId && row.created_by === userId,
    createdAt: row.created_at,
  };
}
export type ActorSummary = ReturnType<typeof toActorSummary>;

export async function isAdmin(client: Db, userId: string): Promise<boolean> {
  const { data } = await client.from('profiles').select('is_admin').eq('id', userId).maybeSingle();
  return !!data?.is_admin;
}

/** Full actor profile with filmography + awards, or null if it doesn't exist. */
export async function loadActorDetail(req: NextRequest, client: Db, id: string, userId: string | null) {
  const { data: row, error } = await client
    .from('actors')
    .select(
      `${ACTOR_LIST_COLUMNS}, birthdate, agency, bio, socials, updated_at, photo_credit, photo_source, wiki_title,
       credits ( id, role, position, titles ( id, title, year, type, poster_url ) ),
       awards ( id, title, org, year, won, position )`,
    )
    .eq('id', id)
    .maybeSingle();
  if (error) throw fromDbError(error);
  if (!row) return null;

  const [counts, admin, fav] = await Promise.all([
    followerCounts(client, [id]),
    userId ? isAdmin(client, userId) : Promise.resolve(false),
    userId
      ? client.from('favorite_actors').select('actor_id').eq('actor_id', id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const credits = [...(row.credits ?? [])]
    .sort((a, b) => a.position - b.position)
    .flatMap((c) => {
      const t = c.titles;
      if (!t) return [];
      return [{
        id: c.id,
        titleId: t.id,
        title: t.title,
        year: t.year,
        type: t.type,
        role: c.role,
        posterUrl: absUrl(req, t.poster_url),
      }];
    });

  const awards = [...(row.awards ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((a) => ({ id: a.id, title: a.title, org: a.org, year: a.year, won: a.won }));

  return {
    ...toActorSummary(req, row, counts.get(id) ?? 0, userId),
    birthdate: row.birthdate,
    agency: row.agency,
    bio: row.bio,
    baseFans: Number(row.base_fans),
    socials: asSocials(row.socials),
    photoCredit: row.photo_credit || null,
    photoSource: row.photo_source,
    wikiTitle: row.wiki_title,
    credits,
    awards,
    updatedAt: row.updated_at,
    isFavorite: !!fav.data,
    canEdit: !!userId && (row.created_by === userId || admin),
  };
}

/** Throws 404/403 exactly as the client should see them before a write. */
export async function assertCanEdit(client: Db, id: string, userId: string) {
  const { data, error } = await client.from('actors').select('id, created_by').eq('id', id).maybeSingle();
  if (error) throw fromDbError(error);
  if (!data) throw notFound('That star no longer exists.');
  if (data.created_by !== userId && !(await isAdmin(client, userId))) {
    throw forbidden(
      data.created_by === null
        ? 'Official PinoyStars profiles can only be edited by an admin.'
        : 'Only the fan who added this star can change it.',
    );
  }
}
