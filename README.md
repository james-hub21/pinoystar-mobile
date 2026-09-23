# PinoyStars — Filipino Actors Fan Directory

A mobile fan directory for Filipino screen stars, built for the **Midterm: Mobile Application, Custom REST
API & External API Integration**.

- **Mobile app:** Expo (React Native) — `mobile/`
- **Custom REST API (full CRUD):** Next.js route handlers, deployable to Vercel — `api/`
- **Database / Auth / File storage:** Supabase (Postgres with Row Level Security) — `supabase/`
- **Third-party API:** Wikipedia REST API — live article search, summaries and “Born on this day”

> The 16 seeded stars are **real Filipino actors**. Their birthdates, birthplaces, roles and awards were
> checked against English Wikipedia, and every bio is a short paraphrase. Photos come from
> **Wikimedia Commons** under free licenses; each profile shows its photo credit and links to the file page
> (full list below). Title posters and feature banners are generated art. Nothing is invented: no fake
> news, quotes, follower counts or social handles.

---

## Third-Party API

**Wikipedia REST API** (Wikimedia Foundation) — no API key required.

| Used for | Endpoint |
|---|---|
| Base URL | **https://en.wikipedia.org/api/rest_v1/** |
| Page summary (Discover → tap a result) | `https://en.wikipedia.org/api/rest_v1/page/summary/{title}` |
| “Born on this day” rail (Home) | `https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/{MM}/{DD}` |
| Live article search (Discover tab) | `https://en.wikipedia.org/w/rest.php/v1/search/page?q={query}&limit=15` |

The app calls Wikipedia **directly from the phone** with `fetch` (HTTP GET), parses the JSON, and renders it
as the Discover tab and the Home “Born on this day” banner. Requests send an `Api-User-Agent` header as
Wikimedia asks. Code: [`mobile/src/lib/wikipedia.ts`](mobile/src/lib/wikipedia.ts). Article text is
© Wikipedia contributors, CC BY-SA 4.0.

---

## How the requirements map to the app

| Requirement | Where |
|---|---|
| **Read (GET)** — list/grid, tap for details | Search tab: 2-column grid from `GET /api/actors` (search + filters) → Actor detail screen from `GET /api/actors/:id` |
| **Create (POST)** — validated form, list updates | “+ Add star” → form with client (Zod) **and** server validation → `POST /api/actors`; lists refresh immediately |
| **Update (PUT)** — pre-populated edit | Actor detail → **Edit** → form pre-filled from `GET /api/actors/:id` → `PUT /api/actors/:id` |
| **Delete (DELETE)** — confirmation dialog | Actor detail → **Delete** → “Delete {name}? This can’t be undone.” → `DELETE /api/actors/:id` |
| External API — fetch + parse + display | Discover tab (live search + summary sheet) and Home “Born on this day” rail |

Extra features: sign-up/login, favorites & watchlist synced to your account, photo upload, server-checked
trivia game, showbiz features, profile with stats.

---

## Architecture

```
 ┌──────────────────────┐   HTTPS + Bearer JWT    ┌──────────────────────────┐   supabase-js (user's JWT)  ┌───────────────────────┐
 │  Expo mobile app     │ ──────────────────────▶ │  Next.js REST API        │ ──────────────────────────▶ │  Supabase             │
 │  (Android / iOS)     │ ◀────────────────────── │  /api/* on Vercel        │ ◀────────────────────────── │  Postgres + RLS,      │
 │                      │        JSON             │  Zod validation          │                             │  Auth, Storage        │
 │                      │                         └──────────────────────────┘                             └───────────────────────┘
 │                      │   HTTPS GET (no key)    ┌──────────────────────────┐
 │                      │ ──────────────────────▶ │  Wikipedia REST API      │
 └──────────────────────┘ ◀────────────────────── └──────────────────────────┘
```

The app talks to exactly two APIs: ours and Wikipedia. Login goes through our API, which proxies
Supabase Auth and returns a JWT. Every database query runs **as the signed-in user** under Postgres Row
Level Security, so a user can only edit or delete stars they added, and nobody can read another user's
favorites. No service-role key exists anywhere in the project.

---

## Custom REST API

Base URL: `http://localhost:3000` locally, or your Vercel URL. Errors always look like
`{ "error": { "code", "message", "fields?" } }` with 400 / 401 / 403 / 404 / 409 / 422 status codes.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/actors?q&network&generation&gender&genre&decade&creditType&sort&limit&offset` | — | List / search stars |
| GET | `/api/actors/:id` | optional | Star profile + filmography + awards (`canEdit`, `isFavorite` when signed in) |
| POST | `/api/actors` | ✅ | **Create** a star (with credits & awards) → `201` |
| PUT | `/api/actors/:id` | ✅ owner/admin | **Update** a star → `200` |
| DELETE | `/api/actors/:id` | ✅ owner/admin | **Delete** a star → `204` |
| POST | `/api/uploads` | ✅ | Upload a photo (multipart `file`, JPEG/PNG/WebP ≤ 5 MB) → `{ url }` |
| POST | `/api/auth/signup` · `/api/auth/login` · `/api/auth/refresh` · `/api/auth/logout` | — | Accounts & tokens |
| GET / PUT | `/api/me` | ✅ | My profile & stats |
| GET · PUT / DELETE | `/api/me/favorites` · `/api/me/favorites/:actorId` | ✅ | Follow / unfollow |
| GET · PUT / DELETE | `/api/me/watchlist` · `/api/me/watchlist/:titleId` | ✅ | Save / unsave a title |
| GET | `/api/news`, `/api/news/:id` | — | Showbiz news |
| GET · POST | `/api/trivia`, `/api/trivia/:id/answer` | — | Trivia rounds (answers checked on the server) |
| POST | `/api/trivia/attempts` | ✅ | Save a finished round |
| GET | `/api/health` | — | Health check |

Try it with [`api/requests.http`](api/requests.http) (VS Code REST Client) or run the end-to-end check:
`node api/scripts/smoke-test.mjs` (40 checks: CRUD, validation, 401/403/404, cross-user isolation, uploads).

---

## Run it locally

**Prerequisites:** Node.js 20+, and either the **Expo Go** app on your phone (SDK 57) or an **Android
Studio emulator**.

### 1. API

```bash
cd api
cp .env.example .env.local      # fill in SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev -- -H 0.0.0.0       # http://localhost:3000 — 0.0.0.0 lets the emulator/phone reach it
```

### 2. Mobile app

```bash
cd mobile
cp .env.example .env            # set EXPO_PUBLIC_API_URL (see below)
npm install
npx expo start                  # press "a" for the Android emulator, or scan the QR code with Expo Go
```

`EXPO_PUBLIC_API_URL` should be:

- your **Vercel URL** (easiest, works everywhere), or
- `http://10.0.2.2:3000` for the **Android emulator** with a local API, or
- `http://<your PC's Wi-Fi IP>:3000` for **Expo Go on a real phone** with a local API (same Wi-Fi network).

### Demo accounts

| Email | Password | Notes |
|---|---|---|
| `demo@pinoystars.test` | `Kapamilya2026!` | Main demo account |
| `tester@pinoystars.test` | `Kapuso2026!` | Second user, used to show you can’t edit other people’s stars |

The 16 seeded “official” stars can only be edited by an admin. Sign in, add your own star, then edit
and delete it.

---

## Database (Supabase)

Everything needed to rebuild the database lives in [`supabase/`](supabase):

- `migrations/` — schema, RLS policies & column grants, private helpers, the atomic `save_actor` RPC, storage policies
- `seed.sql` — generated by `npx tsx supabase/scripts/build-seed.ts` from `supabase/scripts/real-data.ts` and `photo-credits.json`

To use your own Supabase project, run the migrations in order in the SQL editor, then `seed.sql`.
Title posters and feature banners are generated with `node api/scripts/generate-art.mjs` into `api/public/seed/`.
Actor photos live in `api/public/seed/actors/` (cropped to 4:5 from the Commons originals).

---

## Photo credits

All actor photos are from [Wikimedia Commons](https://commons.wikimedia.org/), cropped to 4:5.
The license terms (CC BY / CC BY-SA or public domain) apply to each photo as listed.

| Star | Author | License | Source |
|---|---|---|---|
| Vilma Santos | Littlebeatlebum | CC BY-SA 4.0 | [File page](https://commons.wikimedia.org/wiki/File:Governor_Vilma_Santos-Recto.jpg) |
| Sharon Cuneta | ChasterJohn Luna | CC BY 3.0 | [File page](https://commons.wikimedia.org/wiki/File:Sharon_Cuneta_performing_%22Love_Again%22_in_2019.jpg) |
| Christopher de Leon | Rated Korina | CC BY 3.0 | [File page](https://commons.wikimedia.org/wiki/File:Boyet_Interview.jpg) |
| Maricel Soriano | Film Development Council of the Philippines | Public domain | [File page](https://commons.wikimedia.org/wiki/File:Maricel_Soriano_-_Parangal_ng_Sining_2023_(cropped).jpg) |
| Piolo Pascual | Gerry Edra | CC BY 3.0 | [File page](https://commons.wikimedia.org/wiki/File:Piolo_Pascual_at_the_Star_Magic_Concert_Tour_in_Ontario,_CA,_June_2009.jpg) |
| Coco Martin | SwarmCheng | CC BY-SA 4.0 | [File page](https://commons.wikimedia.org/wiki/File:Floats_of_the_48th_Metro_Manila_Film_Festival_Festival_Parade_of_Stars_27.jpg) |
| Marian Rivera | Malacañang Photo Bureau/Robert Viñas | Public domain | [File page](https://commons.wikimedia.org/wiki/File:Marian_Rivera_-_2014_(cropped).jpg) |
| Dingdong Dantes | Malacañang Photo Bureau/Robert Viñas | Public domain | [File page](https://commons.wikimedia.org/wiki/File:Dingdong_Dantes_-_2014_(cropped).jpg) |
| Anne Curtis | George Parrilla | CC BY 2.0 | [File page](https://commons.wikimedia.org/wiki/File:Anne_Curtis,_2009_(cropped).jpg) |
| Kathryn Bernardo | Patrick Cristiano | CC BY-SA 4.0 | [File page](https://commons.wikimedia.org/wiki/File:Kathryn_Bernardo_in_2025_(cropped).jpg) |
| Daniel Padilla | Faty Bhojara | CC BY-SA 3.0 | [File page](https://commons.wikimedia.org/wiki/File:Daniel_Padilla_at_Celebrate_Mega_in_Iceland_2016_(6).jpg) |
| Alden Richards | JmKissme | CC BY-SA 3.0 | [File page](https://commons.wikimedia.org/wiki/File:Alden_Richards_at_the_OMG_Awards.jpg) |
| Liza Soberano | Embassy of the United States, Manila / Ambassador Lee Lipton | Public domain | [File page](https://commons.wikimedia.org/wiki/File:Liza_Soberano_in_2026.jpg) |
| Donny Pangilinan | Patrick Cristiano | CC BY-SA 4.0 | [File page](https://commons.wikimedia.org/wiki/File:Donny_Pangilinan.jpg) |
| Barbie Forteza | Chareze Stamatelaky from Sta. Rosa, Philippines | CC BY 2.0 | [File page](https://commons.wikimedia.org/wiki/File:Barbie_Forteza.jpg) |
| Maris Racal | Anonnymuz | CC BY 4.0 | [File page](https://commons.wikimedia.org/wiki/File:Maris_Racal_2024.jpg) |

Actor facts and bios are based on the stars' English Wikipedia articles (CC BY-SA 4.0).

---

## Deploy the API to Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → import the repo**, set **Root Directory = `api`** (framework: Next.js).
3. Add environment variables `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (same values as `api/.env.local`).
4. Deploy, then open `https://<your-app>.vercel.app/api/health`. It should return `{"ok":true,…}`.
5. Put that URL in `mobile/.env` as `EXPO_PUBLIC_API_URL` and restart `npx expo start`.

---

## Project structure

```
api/          Next.js REST API (route handlers in src/app/api, helpers in src/lib), seed art in public/seed
mobile/       Expo app — screens in src/app (expo-router), UI in src/components, API + Wikipedia clients in src/lib
supabase/     SQL migrations, seed and the seed generator
prototype/    The original Vite web prototype this app was built from (design reference, not deployed)
DEMO.md       Script for the 2–3 minute demo video
```
