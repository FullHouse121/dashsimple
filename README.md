# DashSimple

A single-page dashboard UI with an Express + SQLite API.

## Local Development

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

### Render (API)
- Build command: `npm install`
- Start command: `node server/index.js`
- Render provides `PORT` automatically

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
