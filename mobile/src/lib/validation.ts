// Client-side mirror of api/src/lib/validation.ts so users see errors before a round trip.
// The server validates again; its 422 field errors are mapped back onto the form too.
import { z } from 'zod';
import { CREDIT_TYPES, DECADES, GENDERS, GENERATIONS, GENRES, NETWORKS } from './types';

const thisYear = new Date().getFullYear();

/** True only for real calendar dates: rejects 1998-02-31, which JS Date would roll over to March 3. */
export const isRealDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

const required = (label: string, min = 1, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const optional = (label: string, max: number) => z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

const yearText = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'Use a 4-digit year.')
  .refine((v) => Number(v) >= 1900 && Number(v) <= thisYear + 5, `Year must be 1900–${thisYear + 5}.`);

const handle = z
  .string()
  .trim()
  .max(40, '40 characters max.')
  .regex(/^@?[A-Za-z0-9._]*$/, 'Letters, numbers, dots and underscores only.');

export const actorForm = z.object({
  name: required('Name', 2, 80),
  stageName: optional('Stage name', 60),
  tagline: required('Tagline', 5, 140),
  birthdate: z
    .string()
    .trim()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Use the format YYYY-MM-DD, e.g. 1995-08-21.')
    .refine((v) => !v || isRealDate(v), 'That date does not exist.')
    .refine((v) => !v || (v >= '1900-01-01' && new Date(`${v}T00:00:00Z`) <= new Date()), 'Birthdate must be in the past.'),
  hometown: optional('Hometown', 80),
  network: z.enum(NETWORKS, { error: 'Pick a network.' }),
  agency: optional('Agency', 80),
  generation: z.enum(GENERATIONS, { error: 'Pick a generation.' }),
  gender: z.enum(GENDERS, { error: 'Pick a gender.' }),
  decades: z.array(z.enum(DECADES)),
  genres: z.array(z.enum(GENRES)).min(1, 'Pick at least one genre.'),
  baseFans: z
    .string()
    .trim()
    .refine((v) => /^\d{0,10}$/.test(v.replace(/,/g, '')), 'Enter a whole number, e.g. 25000.'),
  bio: optional('Bio', 3000),
  photoUrl: z.string(),
  instagram: handle,
  x: handle,
  tiktok: handle,
  credits: z
    .array(
      z.object({
        title: required('Title', 1, 120),
        year: yearText,
        type: z.enum(CREDIT_TYPES, { error: 'Pick a type.' }),
        role: required('Role', 1, 80),
      }),
    )
    .max(30, 'Up to 30 credits.'),
  awards: z
    .array(
      z.object({
        title: required('Award', 1, 80),
        org: required('Organization', 1, 80),
        year: yearText,
        won: z.boolean(),
      }),
    )
    .max(30, 'Up to 30 awards.'),
});

export type ActorFormValues = z.infer<typeof actorForm>;

export const loginForm = z.object({
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const signupForm = z.object({
  displayName: required('Your name', 1, 60),
  email: z.string().trim().min(1, 'Enter your email.').email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(72, '72 characters max.'),
});

export const profileForm = z.object({
  displayName: required('Display name', 1, 60),
  city: optional('City', 60),
});
