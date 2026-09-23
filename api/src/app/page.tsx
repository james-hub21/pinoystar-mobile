import Link from 'next/link';

const endpoints: { method: string; path: string; auth: string; purpose: string }[] = [
  { method: 'GET', path: '/api/actors?q&network&generation&gender&genre&decade&creditType&sort&limit&offset', auth: '—', purpose: 'List / search stars' },
  { method: 'GET', path: '/api/actors/:id', auth: 'optional', purpose: 'Star profile with credits & awards' },
  { method: 'POST', path: '/api/actors', auth: 'required', purpose: 'Create a star' },
  { method: 'PUT', path: '/api/actors/:id', auth: 'owner / admin', purpose: 'Update a star' },
  { method: 'DELETE', path: '/api/actors/:id', auth: 'owner / admin', purpose: 'Delete a star' },
  { method: 'POST', path: '/api/uploads', auth: 'required', purpose: 'Upload a photo (multipart “file”, ≤ 5 MB)' },
  { method: 'POST', path: '/api/auth/signup', auth: '—', purpose: 'Create an account' },
  { method: 'POST', path: '/api/auth/login', auth: '—', purpose: 'Sign in → tokens' },
  { method: 'POST', path: '/api/auth/refresh', auth: '—', purpose: 'Refresh an access token' },
  { method: 'POST', path: '/api/auth/logout', auth: 'required', purpose: 'Sign out this device' },
  { method: 'GET', path: '/api/me', auth: 'required', purpose: 'My profile & stats' },
  { method: 'PUT', path: '/api/me', auth: 'required', purpose: 'Update my profile' },
  { method: 'GET', path: '/api/me/favorites', auth: 'required', purpose: 'Stars I follow' },
  { method: 'PUT', path: '/api/me/favorites/:actorId', auth: 'required', purpose: 'Follow a star' },
  { method: 'DELETE', path: '/api/me/favorites/:actorId', auth: 'required', purpose: 'Unfollow a star' },
  { method: 'GET', path: '/api/me/watchlist', auth: 'required', purpose: 'My watchlist' },
  { method: 'PUT', path: '/api/me/watchlist/:titleId', auth: 'required', purpose: 'Save a title' },
  { method: 'DELETE', path: '/api/me/watchlist/:titleId', auth: 'required', purpose: 'Unsave a title' },
  { method: 'GET', path: '/api/news', auth: '—', purpose: 'Latest showbiz news' },
  { method: 'GET', path: '/api/news/:id', auth: '—', purpose: 'News story' },
  { method: 'GET', path: '/api/trivia', auth: '—', purpose: 'Trivia rounds (no answers)' },
  { method: 'POST', path: '/api/trivia/:id/answer', auth: '—', purpose: 'Check an answer' },
  { method: 'POST', path: '/api/trivia/attempts', auth: 'required', purpose: 'Save a finished round' },
  { method: 'GET', path: '/api/health', auth: '—', purpose: 'Health check' },
];

export default function Home() {
  return (
    <main>
      <p className="eyebrow">REST API · v1</p>
      <h1>
        Pino<span>y</span>Stars API
      </h1>
      <p>
        The backend for the PinoyStars mobile fan directory. JSON in, JSON out. Send{' '}
        <code>Authorization: Bearer &lt;accessToken&gt;</code> from <code>/api/auth/login</code> for signed-in
        endpoints. Errors always look like <code>{'{ "error": { "code", "message", "fields?" } }'}</code>.
      </p>

      <h2>Endpoints</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Auth</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e) => (
              <tr key={e.method + e.path}>
                <td className={`m ${e.method}`}>{e.method}</td>
                <td>
                  <code>{e.path}</code>
                </td>
                <td className="lock">{e.auth}</td>
                <td>{e.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Try it</h2>
      <p>
        <Link href="/api/actors?limit=3" prefetch={false}>
          /api/actors?limit=3
        </Link>{' '}
        ·{' '}
        <Link href="/api/health" prefetch={false}>
          /api/health
        </Link>
      </p>
    </main>
  );
}
