# DashSimple

A single-page dashboard UI with an Express + Postgres (Supabase) API.

## Local Development

Set environment variables (copy `.env.example` and fill values):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
AUTH_SECRET="change-me"
POSTBACK_SECRET="change-me"
FX_BASE="USD"
FX_TARGET="USD"
FX_PROVIDER="google"
FX_TTL_SECONDS="3600"
```

Install dependencies:

```bash
npm install
```

Run frontend + API together:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

API: `http://localhost:5174`

## Build (Frontend)

```bash
npm run build
```

Output: `dist/`

## Deploy (Netlify + Render)

### Supabase (Database)
1. Create a Supabase project.
2. Copy the Postgres connection string (Settings → Database → Connection string → URI).
3. Use that value for `DATABASE_URL` (or `SUPABASE_DB_URL`).

### Render (API)
- Build command: `npm install`
- Start command: `node server/index.js`
- Add env var `DATABASE_URL` (Supabase connection string)
- Optional FX env vars: `FX_BASE`, `FX_TARGET`, `FX_PROVIDER`, `FX_TTL_SECONDS`
- Optional Keitaro cron env vars: `KEITARO_BASE_URL`, `KEITARO_API_KEY`, `KEITARO_REPORT_PAYLOAD`,
  `KEITARO_REPORT_PATH`, `KEITARO_MAPPING`, `KEITARO_TARGET`, `KEITARO_REPLACE`, `KEITARO_RANGE_DAYS`,
  `KEITARO_CRON_SECRET`, `KEITARO_DEVICE_REPORT_PATH`, `KEITARO_DEVICE_REPORT_PAYLOAD`,
  `KEITARO_DEVICE_MAPPING`, `KEITARO_DEVICE_REPLACE`

Notes:
- For placement reporting, include `sub1` in `KEITARO_REPORT_PAYLOAD.dimensions`.
- Set `KEITARO_MAPPING.placementField` to `sub1` (or your placement field key).
- Render provides `PORT` automatically

### Keitaro Cron Sync (Render Cron Job)
1. Set env vars on the API service:
   - `KEITARO_BASE_URL` (tracker root, no `/admin`)
   - `KEITARO_API_KEY`
   - `KEITARO_REPORT_PAYLOAD` (JSON from Keitaro report build)
   - `KEITARO_CRON_SECRET` (any random string)
2. Create a Render Cron Job that calls:
   - `POST https://YOUR-RENDER-APP.onrender.com/api/keitaro/cron?secret=KEITARO_CRON_SECRET`
3. Choose the schedule you want (e.g. every 15 minutes).

### Netlify (Frontend)
- Build command: `npm run build`
- Publish directory: `dist`
- Ensure `netlify.toml` has the correct Render URL:

```toml
[[redirects]]
from = "/api/*"
to = "https://RENDER_APP_URL/api/:splat"
status = 200
```

Replace `RENDER_APP_URL` with your Render service domain.
