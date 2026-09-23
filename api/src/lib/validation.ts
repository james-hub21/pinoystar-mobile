import { z } from 'zod';

export const NETWORKS = ['ABS-CBN', 'GMA', 'Viva', 'TV5', 'Independent'] as const;
export const GENERATIONS = ['Legends', 'Millennial', 'Gen Z'] as const;
export const GENDERS = ['Female', 'Male'] as const;
export const GENRES = ['Drama', 'Romance', 'Comedy', 'Action', 'Fantasy', 'Period', 'Horror'] as const;
export const DECADES = ['1980s', '1990s', '2000s', '2010s', '2020s'] as const;
export const CREDIT_TYPES = ['Movie', 'Teleserye', 'Series'] as const;

const thisYear = new Date().getFullYear();

/** True only for real calendar dates (rejects 1998-02-31). */
const isRealDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};
const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, min <= 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);
const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`).optional().default('');
const year = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a year.` })
    .int(`${label} must be a whole year.`)
    .min(1900, `${label} must be 1900 or later.`)
    .max(thisYear + 5, `${label} can't be more than 5 years ahead.`);

const handle = z
  .string()
  .trim()
  .max(40, 'Handles must be 40 characters or fewer.')
  .regex(/^@?[A-Za-z0-9._]*$/, 'Handles can only use letters, numbers, dots and underscores.')
  .transform((v) => (v && !v.startsWith('@') ? `@${v}` : v))
  .optional();

export const creditInput = z.object({
  title: text(1, 120, 'Title'),
  year: year('Year'),
  type: z.enum(CREDIT_TYPES, { error: 'Pick Movie, Teleserye or Series.' }),
  role: text(1, 80, 'Role'),
});

export const awardInput = z.object({
  title: text(1, 80, 'Award'),
  org: text(1, 80, 'Organization'),
  year: year('Year'),
  won: z.boolean().default(false),
});

export const actorInput = z.object({
  name: text(2, 80, 'Name'),
  stageName: optionalText(60, 'Stage name'),
  tagline: text(5, 140, 'Tagline'),
  birthdate: z
    .union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')])
    .optional()
    .default('')
    .refine((v) => !v || isRealDate(v), 'That date does not exist.')
    .refine((v) => !v || (v >= '1900-01-01' && new Date(v) <= new Date()), 'Birthdate must be in the past.'),
  hometown: optionalText(80, 'Hometown'),
  network: z.enum(NETWORKS, { error: 'Pick a network.' }),
  agency: optionalText(80, 'Agency'),
  generation: z.enum(GENERATIONS, { error: 'Pick a generation.' }),
  gender: z.enum(GENDERS, { error: 'Pick a gender.' }),
  decades: z.array(z.enum(DECADES)).max(DECADES.length).default([]).transform((v) => [...new Set(v)]),
  genres: z
    .array(z.enum(GENRES))
    .min(1, 'Pick at least one genre.')
    .max(GENRES.length)
    .transform((v) => [...new Set(v)]),
  baseFans: z.coerce
    .number()
    .int('Fans must be a whole number.')
    .min(0, "Fans can't be negative.")
    .max(1_000_000_000, 'That is more fans than people on Earth… almost.')
    .default(0),
  bio: optionalText(3000, 'Bio'),
  photoUrl: z
    .union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Photo must be a web link.' }).max(500)])
    .optional()
    .default(''),
  socials: z
    .object({ instagram: handle, x: handle, tiktok: handle })
    .default({})
    .transform((s) => Object.fromEntries(Object.entries(s).filter(([, v]) => v))),
  credits: z.array(creditInput).max(30, 'Up to 30 credits.').default([]),
  awards: z.array(awardInput).max(30, 'Up to 30 awards.').default([]),
});
export type ActorInput = z.infer<typeof actorInput>;

const csv = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []))
    .pipe(z.array(z.enum(values)));

export const actorListQuery = z.object({
  q: z.string().trim().max(80).optional().default(''),
  network: csv(NETWORKS),
  generation: csv(GENERATIONS),
  gender: csv(GENDERS),
  genre: csv(GENRES),
  decade: csv(DECADES),
  creditType: csv(CREDIT_TYPES),
  spotlight: z.enum(['true', 'false']).optional(),
  mine: z.enum(['true', 'false']).optional(),
  sort: z.enum(['trending', 'name', 'newest']).optional().default('trending'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const slugParam = z
  .string()
  .max(120)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Invalid id.');

export const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);

export const signupInput = z.object({
  email,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(72),
  displayName: text(1, 60, 'Display name'),
});

export const loginInput = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(72),
});

export const refreshInput = z.object({ refreshToken: z.string().min(10).max(2000) });

export const profileUpdate = z.object({
  displayName: text(1, 60, 'Display name'),
  city: z.string().trim().max(60, 'City must be 60 characters or fewer.').optional().default(''),
  favoriteGenres: z.array(z.enum(GENRES)).max(GENRES.length).default([]).transform((v) => [...new Set(v)]),
});

export const triviaAnswer = z.object({ choice: z.number().int().min(0).max(3) });

export const triviaAttempt = z
  .object({
    score: z.number().int().min(0).max(100),
    total: z.number().int().min(1).max(100),
    bestStreak: z.number().int().min(0).max(100),
  })
  .refine((a) => a.score <= a.total && a.bestStreak <= a.score, 'Score cannot exceed the number of rounds.');
