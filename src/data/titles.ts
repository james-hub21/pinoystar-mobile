import type { CreditType } from '../types';
import { actors } from './actors';

export interface Title {
  id: string;
  title: string;
  year: number;
  type: CreditType;
  poster: string;
  note?: string;
}

export const slugify = (value: string): string =>
value.
toLowerCase().
replace(/[^a-z0-9]+/g, '-').
replace(/^-|-$/g, '');

/** Progress / release notes shown on the watchlist for titles the user is tracking. */
const notes: Record<string, string> = {
  'bituin-sa-maynila': 'Ep. 42 of 60',
  'kalye-kings': 'Ep. 3 of 8',
  salamin: 'Out Dec 25',
  'gabi-ng-liwanag': 'Ep. 12 of 40'
};

/** One catalog entry per unique production across every actor's filmography. */
export const titles: Title[] = actors.
flatMap((actor) => actor.credits).
reduce<Title[]>((acc, credit) => {
  const id = slugify(credit.title);
  if (acc.some((t) => t.id === id)) return acc;
  acc.push({
    id,
    title: credit.title,
    year: credit.year,
    type: credit.type,
    poster: credit.poster,
    note: notes[id]
  });
  return acc;
}, []).
sort((a, b) => b.year - a.year);

export const getTitle = (id: string): Title | undefined => titles.find((t) => t.id === id);