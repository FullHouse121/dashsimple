# Handover

Everything the incoming team needs to take ownership, and the order to do it in.

Nothing in this file is a secret. It names variables and accounts; the values
travel separately (see [Passing the secrets](#passing-the-secrets)).

## What the system is made of

| Piece | Where | What breaks without it |
|---|---|---|
| Frontend | Netlify, built from `main` | The dashboard |
| API | Render — `dashsimple.onrender.com` | Everything; the frontend proxies `/api/*` to it |
| Database | Supabase Postgres | Everything |
| Tracker | Keitaro (external) | All ingestion — clicks, conversions, spend |
| Repo | `github.com/FullHouse121/dashsimple` | Deploys, since both hosts build from it |

The frontend has no database access. `netlify.toml` proxies `/api/*` to Render,
and Render alone holds the credentials.

## Order of operations

Do it in this order. Rotating before the new owners hold the values takes the
production dashboard down.

1. **Grant access** — repo, Render, Supabase, Netlify, Keitaro (below).
2. **Hand over the secret values** out of band.
3. **Confirm they can deploy** — have them run one deploy on Render and one on
   Netlify while you are still an owner to fall back on.
4. **Rotate every secret** (below). The app keeps working; the values you hold
   stop being useful.
5. **Remove yourself** from each account.

## Accounts

### Supabase

This app talks to Postgres directly over `DATABASE_URL`. It does **not** use the
Supabase JS client, so the anon and service-role keys are irrelevant — the
connection string is the whole of the access.

- **Full ownership:** Supabase supports transferring a project between
  organizations. That is the clean option if you are leaving entirely.
- **Shared:** invite their people to the org (Settings → Team) and remove
  yourself at step 5.
- After they hold the credentials: **Settings → Database → Reset database
  password**. That invalidates the old `DATABASE_URL`, which is the one secret
  most likely to have been pasted somewhere over the project's life.
- Worth doing while you are in there: the app currently connects as the
  superuser. A dedicated role with rights on the application tables only is a
  better position for the next team to start from.

### Render

- Transfer the service to their workspace, or invite them (Account → Team).
- Env vars live in the Render dashboard, not in the repo. Every name in
  [Environment](#environment) that is marked a secret has to be re-entered
  there by whoever holds the new values.
- Note whether background workers or cron are enabled — `KEITARO_CRON_SECRET`
  guards the ingestion trigger, so it has to survive the handover.

### Netlify

- Site → Members, or transfer to their team.
- Build is `npm run build`, publish `dist`, and the API proxy target is written
  into `netlify.toml`. If Render's URL changes, that file changes with it.

### GitHub

- Settings → Collaborators, or transfer the repository.
- Both Netlify and Render build from `main`, so repo access is deploy access.

### Keitaro

Not ours, but the dashboard is worthless without it. The new team needs an
admin API key on the tracker; `KEITARO_API_KEY` is the credential the server
uses for every report, click log and campaign write.

## Environment

Full names live in `.env.example`. What matters for a handover is which of them
are secrets — these must be rotated, and must never travel over chat or email:

| Secret | What it protects |
|---|---|
| `DATABASE_URL` / `SUPABASE_DB_URL` | The database. Full read/write. |
| `AUTH_SECRET` | Signs session tokens. Anyone holding it can mint a valid Boss session. |
| `CREDENTIAL_KEY` | Encrypts stored account passwords and 2FA secrets. **Rotating this without re-encrypting makes existing stored credentials unreadable — plan that migration before you touch it.** |
| `KEITARO_API_KEY` | Full admin on the tracker. |
| `KEITARO_CRON_SECRET` | The ingestion trigger. |
| `POSTBACK_SECRET` | The conversion postback endpoint. |
| `INBOUND_MAIL_SECRET` | The inbound mail route. |
| `META_APP_TOKEN`, `FB_APP_ACCESS_TOKEN` | Meta ad accounts. |
| `MS_GRAPH_CLIENT_SECRET` | Microsoft sign-in. |
| `TELEGRAM_BOT_TOKEN`, `ALERT_WEBHOOK_URL` | Alert delivery. |

Everything else in `.env.example` is configuration and can be copied as-is.

Two that are configuration but decide what the numbers say, so copy them
deliberately rather than accepting a default:

- `EXTERNAL_CAMPAIGN_GROUPS` — Keitaro groups excluded from reporting. It must
  read `Outsource`. It defaulted to a group name that did not exist, and while
  that was true the Outsource group's 163,066 clicks were being counted as
  buyer traffic.
- `ALLOW_PROD_DB` — lets a local machine connect to the **production**
  database. It is set in the current local `.env`. A new team should start with
  it unset and a database of their own.

## Passing the secrets

Not chat, not email, not a repo file. Any of:

- The password manager the team already uses (1Password, Bitwarden — a shared
  vault, then revoke your access at step 5).
- Entered directly into Render and Supabase by their own owner, so the values
  never sit in a document at all. This is the best option if it is available.
- A one-time secret link (onetimesecret.com or similar) if it has to be sent.

Then rotate anyway. Assume anything that has existed for the life of a project
has been pasted somewhere it should not have been.

## State they should know on day one

Things that are true right now and are not visible from the code:

- **The Meta spend pipeline is down.** `/api/cost-integrity` reports 0 of 10 ad
  accounts delivering spend. Every cost-derived figure — CPC, cost per
  register, cost per FTD, ROI — is withheld in the UI for that reason, and will
  stay withheld until the Meta app is rebuilt. This is the largest outstanding
  piece of work.
- **A Render deploy is pending.** `177dcce` added a verification pass that stops
  the `user_behavior_daily` rollup drifting from its source. The data itself was
  already repaired by hand; that deploy arms the guard. Until it ships the
  rollup is correct but unprotected.
- **`user_behavior_daily` is a cache.** It is rebuilt from `user_behavior`, and
  the refresh only covers a recent window. It once drifted far enough to report
  one player at 456 deposits against a true 3. If historical rows are edited in
  bulk, the rollup has to be rebuilt, not just refreshed.
- **Registrations and deposits land on different clicks.** A player's click ID
  ties their first deposit to their redeposits, but their registration usually
  arrives on an earlier click. Roughly 3% of depositors show both. This is the
  tracker's behaviour, not a bug to fix.
- **Conversion rates divide by unique clicks, not raw clicks** — about 37% of
  clicks here are unique, so the two differ by a factor of nearly three. Any new
  rate should follow the same basis.

## Verifying the handover worked

Have them do these, in order, before you step away:

```bash
npm install
npm test                                      # 255 tests
node scripts/dashboard-audit.test.mjs         # 50 design/data invariants
npm run build
```

Then, against the deployed API:

- `GET /api/health` returns 200
- Sign in and confirm the dashboard loads with data
- Confirm the Keitaro ingestion cron runs once on schedule

If the tests and the audit pass and the API answers, they have a working
environment. If the audit fails, read what it printed — each line names the
thing that regressed.
