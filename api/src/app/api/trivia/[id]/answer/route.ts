import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromDbError, json, notFound, readJson, route } from '@/lib/http';
import { db } from '@/lib/supabase';
import { triviaAnswer } from '@/lib/validation';

// POST /api/trivia/:id/answer — { choice } → { correct, answerIndex, fact }
export const POST = route(async (req: NextRequest, ctx: RouteContext<'/api/trivia/[id]/answer'>) => {
  const id = z.string().max(40).parse((await ctx.params).id);
  const { choice } = triviaAnswer.parse(await readJson(req));
  const { data, error } = await db().rpc('answer_trivia', { p_question: id, p_choice: choice });
  if (error) throw fromDbError(error);
  const result = data?.[0];
  if (!result) throw notFound('That trivia round no longer exists.');
  return json({ correct: result.correct, answerIndex: result.answer_index, fact: result.fact });
});
