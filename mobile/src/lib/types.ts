// Shapes returned by our REST API (see api/src/lib/actors.ts and friends).

export const NETWORKS = ['ABS-CBN', 'GMA', 'Viva', 'TV5', 'Independent'] as const;
export const GENERATIONS = ['Legends', 'Millennial', 'Gen Z'] as const;
export const GENDERS = ['Female', 'Male'] as const;
export const GENRES = ['Drama', 'Romance', 'Comedy', 'Action', 'Fantasy', 'Period', 'Horror'] as const;
export const DECADES = ['1980s', '1990s', '2000s', '2010s', '2020s'] as const;
export const CREDIT_TYPES = ['Movie', 'Teleserye', 'Series'] as const;

export type Network = (typeof NETWORKS)[number];
export type Generation = (typeof GENERATIONS)[number];
export type Gender = (typeof GENDERS)[number];
export type Genre = (typeof GENRES)[number];
export type Decade = (typeof DECADES)[number];
export type CreditType = (typeof CREDIT_TYPES)[number];

export interface ActorSummary {
  id: string;
  name: string;
  stageName: string;
  tagline: string;
  hometown: string;
  network: Network;
  generation: Generation;
  gender: Gender;
  genres: Genre[];
  decades: Decade[];
  photoUrl: string | null;
  fans: number;
  fansLabel: string;
  spotlight: boolean;
  trendingRank: number | null;
  isOfficial: boolean;
  isMine: boolean;
  createdAt: string;
}

export interface Credit {
  id: string;
  titleId: string;
  title: string;
  year: number;
  type: CreditType;
  role: string;
  posterUrl: string | null;
}

export interface Award {
  id: string;
  title: string;
  org: string;
  year: number;
  won: boolean;
}

export interface ActorDetail extends ActorSummary {
  birthdate: string | null;
  agency: string;
  bio: string;
  baseFans: number;
  socials: { instagram?: string; x?: string; tiktok?: string };
  credits: Credit[];
  awards: Award[];
  updatedAt: string;
  isFavorite: boolean;
  canEdit: boolean;
}

export interface ActorPage {
  data: ActorSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ActorFilters {
  q?: string;
  network?: string[];
  generation?: string[];
  gender?: string[];
  genre?: string[];
  decade?: string[];
  creditType?: string[];
  spotlight?: boolean;
  mine?: boolean;
  sort?: 'trending' | 'name' | 'newest';
  limit?: number;
}

/** Body for POST/PUT /api/actors. */
export interface ActorInput {
  name: string;
  stageName: string;
  tagline: string;
  birthdate: string;
  hometown: string;
  network: Network;
  agency: string;
  generation: Generation;
  gender: Gender;
  decades: Decade[];
  genres: Genre[];
  baseFans: number;
  bio: string;
  photoUrl: string;
  socials: { instagram?: string; x?: string; tiktok?: string };
  credits: { title: string; year: number; type: CreditType; role: string }[];
  awards: { title: string; org: string; year: number; won: boolean }[];
}

export interface WatchTitle {
  id: string;
  title: string;
  year: number;
  type: CreditType;
  posterUrl: string | null;
  note: string | null;
}

export interface NewsItem {
  id: string;
  headline: string;
  excerpt: string;
  source: string;
  minutesRead: number;
  publishedAt: string;
  imageUrl: string | null;
  tag: string;
  actorId: string | null;
}

export interface NewsDetail extends Omit<NewsItem, 'actorId'> {
  body: string;
  actor: { id: string; name: string; tagline: string; photoUrl: string | null } | null;
}

export interface TriviaQuestion {
  id: string;
  prompt: string;
  choices: string[];
  photoUrl: string | null;
}

export interface TriviaResult {
  correct: boolean;
  answerIndex: number;
  fact: string;
}

export interface Me {
  id: string;
  email: string | null;
  displayName: string;
  city: string;
  favoriteGenres: Genre[];
  isAdmin: boolean;
  memberSince: string;
  stats: {
    following: number;
    watchlist: number;
    starsAdded: number;
    triviaWins: number;
    roundsPlayed: number;
    bestStreak: number;
  };
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  user: { id: string; email: string | null };
}
