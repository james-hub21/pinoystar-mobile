import { NextResponse, type NextRequest } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) => new ApiError(400, 'bad_request', message);
export const unauthorized = (message = 'Sign in to do that.') => new ApiError(401, 'unauthorized', message);
export const forbidden = (message = "You don't have permission to do that.") =>
  new ApiError(403, 'forbidden', message);
export const notFound = (message = 'Not found.') => new ApiError(404, 'not_found', message);

export const json = <T>(data: T, status = 200) => NextResponse.json(data, { status });
export const noContent = () => new NextResponse(null, { status: 204 });

/** Parse a JSON body, turning malformed JSON into a clean 400 instead of a 500. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw badRequest('Request body must be valid JSON.');
  }
}

function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Map a PostgREST / Postgres error to an HTTP error without leaking SQL to the client. */
export function fromDbError(error: { code?: string; message?: string }): ApiError {
  switch (error.code) {
    case '42501': // insufficient_privilege (grants or RLS)
      return forbidden();
    case '23505':
      return new ApiError(409, 'conflict', 'That already exists.');
    case '23514': // check_violation
    case '22P02': // invalid_text_representation
    case '22007': // invalid_datetime_format
    case '22008':
      return new ApiError(422, 'validation_failed', 'Some fields have invalid values.');
    case '23503':
      return new ApiError(422, 'validation_failed', 'A referenced record does not exist.');
    case 'PGRST116':
      return notFound();
    default:
      console.error('[db]', error);
      return new ApiError(500, 'server_error', 'Something went wrong on our side. Please try again.');
  }
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

/** Wraps a route handler with uniform error responses: `{ error: { code, message, fields? } }`. */
export function route<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) {
        return json({ error: { code: e.code, message: e.message, fields: e.fields } }, e.status);
      }
      if (e instanceof ZodError) {
        return json(
          { error: { code: 'validation_failed', message: 'Please fix the highlighted fields.', fields: zodFields(e) } },
          422,
        );
      }
      console.error('[api]', e);
      return json({ error: { code: 'server_error', message: 'Something went wrong on our side. Please try again.' } }, 500);
    }
  };
}
