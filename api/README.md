# PinoyStars API

Next.js route handlers on Vercel, backed by Supabase (Postgres + Auth + Storage). See the
[root README](../README.md) for setup, the endpoint table and deployment.

```bash
cp .env.example .env.local   # fill in SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev -- -H 0.0.0.0    # 0.0.0.0 so the Android emulator / your phone can reach it
node scripts/smoke-test.mjs  # 40 end-to-end checks against http://localhost:3000
```
