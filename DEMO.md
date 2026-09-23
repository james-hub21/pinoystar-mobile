# Demo video script (2–3 minutes)

Record on the Android emulator or a phone running Expo Go. Before recording: start the app, sign out,
and make sure the API is reachable (open `<API_URL>/api/health`).

| Time | Show | Say / point out |
|---|---|---|
| 0:00–0:15 | Home screen | “PinoyStars is an Expo React Native app. It uses my own Next.js REST API with Supabase, and the Wikipedia REST API.” |
| 0:15–0:35 | **Search** tab → scroll grid → type “probinsyano” → open filters, pick GMA | **READ**: `GET /api/actors` with search and filters |
| 0:35–0:50 | Tap a star (e.g. Kathryn Bernardo) → scroll the profile to the **From Wikipedia** card | **READ one**: `GET /api/actors/:id`, with filmography and awards from the database, plus a live Wikipedia summary |
| 0:50–1:05 | Tap **+ Add star** → it asks you to sign in → sign in as `demo@pinoystars.test` | Writes need a login. The API checks the token. |
| 1:05–1:35 | On the empty form tap **Add star** (errors show) → fill in name, tagline, TV5, Millennial, Female, Drama, a photo and one credit → **Add star** | **CREATE**: client and server validation, then `POST /api/actors`. The new profile opens. |
| 1:35–1:55 | Tap **Edit** → change the tagline → **Save changes** | **UPDATE**: the form is pre-filled from the API, then `PUT /api/actors/:id` |
| 1:55–2:10 | Tap **Delete** → confirmation dialog → **Delete** → back on Search, the star is gone | **DELETE**: confirm first, then `DELETE /api/actors/:id` |
| 2:10–2:35 | **Discover** tab → tap a topic chip, type a search → tap a result → summary sheet | **External API**: live Wikipedia search and page summary, parsed from JSON |
| 2:35–2:50 | Home → “Born on this day” rail (Live from Wikipedia) | Wikipedia “on this day” feed, filtered to actors and actresses |
| 2:50–3:00 | (Optional) Browser: `<API_URL>/api/actors?limit=2` | The raw JSON from my REST API |

Tip: the API docs page at `<API_URL>/` lists every endpoint if you want to show them on screen.
