import type { NextRequest } from 'next/server';
import { absUrl } from '@/lib/actors';
import { fromDbError, json, route } from '@/lib/http';
import { db } from '@/lib/supabase';

// GET /api/trivia — today's rounds. Answers are never sent; check them via POST /api/trivia/:id/answer.
export const GET = route(async (req: NextRequest) => {
  const { data, error } = await db()
    .from('trivia_questions')
    .select('id, prompt, choices, position, actors ( photo_url )')
    .order('position');
  if (error) throw fromDbError(error);
  return json({
    data: (data ?? []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choices: q.choices,
      photoUrl: absUrl(req, q.actors?.photo_url ?? null),
    })),
  });
});
