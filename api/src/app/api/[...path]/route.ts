import { json } from '@/lib/http';

// Unknown /api/* paths get a JSON 404 instead of an HTML page.
const notFound = async () =>
  json({ error: { code: 'not_found', message: 'No such endpoint. See / for the API reference.' } }, 404);

export { notFound as GET, notFound as POST, notFound as PUT, notFound as DELETE };
