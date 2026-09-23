// End-to-end check of the REST API: auth, full CRUD, validation, permissions, favorites, trivia.
// Usage (from api/):  API_URL=http://localhost:3000 node scripts/smoke-test.mjs
// Uses the demo accounts from the README. Deletes the star it creates; each run leaves one trivia
// attempt and one 1x1 test upload on the demo account.
const API = (process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const A = { email: process.env.DEMO_EMAIL ?? 'demo@pinoystars.test', password: process.env.DEMO_PASSWORD ?? 'Kapamilya2026!' };
const B = { email: process.env.TESTER_EMAIL ?? 'tester@pinoystars.test', password: process.env.TESTER_PASSWORD ?? 'Kapuso2026!' };

let passed = 0;
let failed = 0;
function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${JSON.stringify(detail).slice(0, 300)}` : ''}`);
  }
}

async function call(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API}${path}`, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data };
}

const newStar = {
  name: 'Smoke Test Star',
  stageName: 'Smokey',
  tagline: 'Created by the API smoke test',
  birthdate: '1999-06-12',
  hometown: 'Iloilo City, Iloilo',
  network: 'TV5',
  agency: 'Test Talents',
  generation: 'Millennial',
  gender: 'Female',
  decades: ['2010s', '2020s'],
  genres: ['Comedy'],
  baseFans: 1200,
  bio: 'Temporary record.',
  socials: { instagram: 'smokey' },
  credits: [{ title: 'Bagsik', year: 2017, type: 'Movie', role: 'Lead' }, { title: 'Salamin', year: 2025, type: 'Movie', role: 'Cameo' }],
  awards: [{ title: 'Best Test', org: 'CI Awards', year: 2025, won: true }],
};

console.log(`\nPinoyStars API smoke test → ${API}\n`);

console.log('Public reads');
const health = await call('GET', '/api/health');
check('GET /api/health → 200', health.status === 200 && health.data.ok, health.data);
const list = await call('GET', '/api/actors?limit=5');
check('GET /api/actors → 200 with data[]', list.status === 200 && Array.isArray(list.data.data) && list.data.total >= 12, list.data);
const one = await call('GET', '/api/actors/kathryn-bernardo');
check('GET /api/actors/:id → 200 with credits & awards', one.status === 200 && one.data.credits.length > 0 && one.data.awards.length > 0);
check('guest sees canEdit=false', one.data.canEdit === false);
check('GET unknown actor → 404', (await call('GET', '/api/actors/no-such-star')).status === 404);
const trivia = await call('GET', '/api/trivia');
check('GET /api/trivia hides answers', trivia.status === 200 && trivia.data.data.length >= 6 && !('answerIndex' in trivia.data.data[0]));
const ans = await call('POST', `/api/trivia/${trivia.data.data[0].id}/answer`, { body: { choice: 0 } });
check('POST /api/trivia/:id/answer → correct/answerIndex/fact', ans.status === 200 && typeof ans.data.correct === 'boolean' && ans.data.fact);
check('GET /api/news → 200', (await call('GET', '/api/news')).status === 200);

console.log('\nAuth');
check('POST /api/actors without token → 401', (await call('POST', '/api/actors', { body: newStar })).status === 401);
const badLogin = await call('POST', '/api/auth/login', { body: { email: A.email, password: 'wrong-password' } });
check('wrong password → 401', badLogin.status === 401, badLogin.data);
const la = await call('POST', '/api/auth/login', { body: A });
check('POST /api/auth/login (demo) → tokens', la.status === 200 && la.data.accessToken, la.data);
const lb = await call('POST', '/api/auth/login', { body: B });
check('POST /api/auth/login (tester) → tokens', lb.status === 200 && lb.data.accessToken, lb.data);
const ta = la.data?.accessToken;
const tb = lb.data?.accessToken;
const refreshed = await call('POST', '/api/auth/refresh', { body: { refreshToken: la.data?.refreshToken } });
check('POST /api/auth/refresh → new tokens', refreshed.status === 200 && refreshed.data.accessToken, refreshed.data);
const me = await call('GET', '/api/me', { token: ta });
check('GET /api/me → profile', me.status === 200 && me.data.displayName, me.data);
check('forged token → 401', (await call('GET', '/api/me', { token: 'eyJhbGciOiJIUzI1NiJ9.e30.bad' })).status === 401);

console.log('\nCRUD');
const invalid = await call('POST', '/api/actors', { token: ta, body: { ...newStar, name: 'X', network: 'HBO', genres: [] } });
check('POST invalid body → 422 with field errors', invalid.status === 422 && invalid.data.error.fields?.name && invalid.data.error.fields?.network && invalid.data.error.fields?.genres, invalid.data);
const created = await call('POST', '/api/actors', { token: ta, body: newStar });
check('POST /api/actors → 201', created.status === 201 && created.data.id, created.data);
const id = created.data?.id;
check('created record has 2 credits, 1 award, canEdit', created.data?.credits?.length === 2 && created.data?.awards?.length === 1 && created.data?.canEdit);
check('socials handle normalised to @smokey', created.data?.socials?.instagram === '@smokey', created.data?.socials);
const searched = await call('GET', '/api/actors?q=smoke%20test');
check('new star appears in search', searched.data?.data?.some((a) => a.id === id));

const updated = await call('PUT', `/api/actors/${id}`, { token: ta, body: { ...newStar, tagline: 'Updated by the smoke test', credits: [newStar.credits[0]] } });
check('PUT /api/actors/:id → 200 with changes', updated.status === 200 && updated.data.tagline === 'Updated by the smoke test' && updated.data.credits.length === 1, updated.data);

check("other user PUT → 403", (await call('PUT', `/api/actors/${id}`, { token: tb, body: newStar })).status === 403);
check("other user DELETE → 403", (await call('DELETE', `/api/actors/${id}`, { token: tb })).status === 403);
check('non-admin PUT on official star → 403', (await call('PUT', '/api/actors/kathryn-bernardo', { token: ta, body: newStar })).status === 403);

console.log('\nFavorites, watchlist, trivia attempts');
check('PUT favorite → 204', (await call('PUT', '/api/me/favorites/kathryn-bernardo', { token: ta })).status === 204);
check('PUT favorite again (idempotent) → 204', (await call('PUT', '/api/me/favorites/kathryn-bernardo', { token: ta })).status === 204);
const favs = await call('GET', '/api/me/favorites', { token: ta });
check('GET favorites includes it', favs.data?.data?.some((a) => a.id === 'kathryn-bernardo'), favs.data);
const favsB = await call('GET', '/api/me/favorites', { token: tb });
check("tester can't see demo's favorites", !favsB.data?.data?.some((a) => a.id === 'kathryn-bernardo'), favsB.data);
const withFan = await call('GET', '/api/actors/kathryn-bernardo', { token: ta });
check('detail shows isFavorite and fan count +1', withFan.data?.isFavorite === true && withFan.data?.fans === one.data.fans + 1, { fans: withFan.data?.fans, before: one.data.fans });
check('DELETE favorite → 204', (await call('DELETE', '/api/me/favorites/kathryn-bernardo', { token: ta })).status === 204);
check('PUT watchlist → 204', (await call('PUT', '/api/me/watchlist/salamin', { token: ta })).status === 204);
const wl = await call('GET', '/api/me/watchlist', { token: ta });
check('GET watchlist includes it', wl.data?.data?.some((t) => t.id === 'salamin'));
check('DELETE watchlist → 204', (await call('DELETE', '/api/me/watchlist/salamin', { token: ta })).status === 204);
const attempt = await call('POST', '/api/trivia/attempts', { token: ta, body: { score: 3, total: 6, bestStreak: 2 } });
check('POST trivia attempt → 201', attempt.status === 201, attempt.data);
check('impossible attempt → 422', (await call('POST', '/api/trivia/attempts', { token: ta, body: { score: 9, total: 6, bestStreak: 2 } })).status === 422);

console.log('\nUploads');
// 1×1 transparent PNG
const png = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='), (c) => c.charCodeAt(0));
const fd = new FormData();
fd.append('file', new Blob([png], { type: 'image/png' }), 'pixel.png');
const up = await call('POST', '/api/uploads', { token: ta, form: fd });
check('POST /api/uploads (png) → 201 with url', up.status === 201 && /^https:\/\/.+\/media\//.test(up.data?.url), up.data);
const fake = new FormData();
fake.append('file', new Blob(['<svg onload=alert(1)>'], { type: 'image/png' }), 'evil.png');
check('upload with fake PNG → 415', (await call('POST', '/api/uploads', { token: ta, form: fake })).status === 415);

console.log('\nDelete');
check('DELETE /api/actors/:id → 204', (await call('DELETE', `/api/actors/${id}`, { token: ta })).status === 204);
check('deleted star → 404', (await call('GET', `/api/actors/${id}`)).status === 404);
check('logout → 204', (await call('POST', '/api/auth/logout', { token: tb })).status === 204);

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
