import type { NextRequest } from 'next/server';
import { fromDbError, json, readJson, route } from '@/lib/http';
import { requireAuth } from '@/lib/supabase';
import { triviaAttempt } from '@/lib/validation';

// POST /api/trivia/attempts — record a finished round (signed in)
export const POST = route(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  const a = triviaAttempt.parse(await readJson(req));
  const { data, error } = await auth.client
    .from('trivia_attempts')
    .insert({ score: a.score, total: a.total, best_streak: a.bestStreak })
    .select('id, score, total, best_streak, created_at')
    .single();
  if (error) throw fromDbError(error);
  return json(
    { id: data.id, score: data.score, total: data.total, bestStreak: data.best_streak, createdAt: data.created_at },
    201,
  );
});
