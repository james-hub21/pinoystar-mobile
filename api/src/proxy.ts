import { NextResponse, type NextRequest } from 'next/server';

// The API authenticates with Bearer tokens (never cookies), so a wildcard origin is safe:
// browsers never attach credentials to these requests. Native apps ignore CORS entirely;
// this is for Expo web, Postman-in-browser and the docs page.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS') return new NextResponse(null, { status: 204, headers: CORS });
  const response = NextResponse.next();
  for (const [k, v] of Object.entries(CORS)) response.headers.set(k, v);
  return response;
}

export const config = { matcher: '/api/:path*' };
