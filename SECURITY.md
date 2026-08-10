# Security notes

## Do not run `npm audit fix --force`

It downgrades `exceljs` from 4.4.0 to **3.4.0**, which breaks the XLSX export in
the Reports section. Plain `npm audit fix` is not much better — it adds ~101
packages and changes ~38 to resolve advisories that this application cannot
reach.

## Standing assessment of the current advisories

Reviewed 10 August 2026 against the installed tree. All eight are transitive,
arriving through Express 4 and the charting stack rather than our own code, and
none is reachable in how this application uses them.

| Advisory | Trigger | Why it is not reachable here |
|---|---|---|
| `path-to-regexp` ReDoS | Attacker-influenced route **patterns** | All 123 routes are static string paths; none is built from a template literal |
| `body-parser` DoS | An **invalid** `limit` option silently disables size enforcement | `express.json()` is called with no options, so the default 100kb limit applies |
| `lodash` code injection / prototype pollution | `_.template`, `_.unset`, `_.omit` reached with user input | `lodash` is not imported anywhere in `src/` or `server/` |
| `d3-color` ReDoS | A malicious colour string parsed client-side | Chart colours are hardcoded design tokens |
| `uuid` buffer bounds | `v3/v5/v6` called with a caller-provided buffer | Internal to `exceljs`; we never pass a buffer |
| `qs` | Query-string parsing | Express-internal; superseded by the Express 5 upgrade below |

Re-check this table whenever the dependency tree changes. "Not reachable" is a
statement about current usage, not a property of the library.

## The real fix

Upgrading **Express 4 → 5** resolves `path-to-regexp`, `body-parser` and `qs`
together. It is a breaking upgrade — router behaviour, error handling and
middleware signatures all change — so it belongs in its own piece of work with
its own testing, not folded into an unrelated change.

## What is already in place

- Credentials (`login_password_enc`, `totp_secret_enc`, `backup_email_password_enc`)
  are AES-256-GCM encrypted under `CREDENTIAL_KEY`, absent from list responses,
  and readable only through audit-logged endpoints.
- The Reports catalog is a whitelist. Field names are validated against it
  before reaching SQL and every value is bound as a parameter — verified against
  crafted names such as `status") OR 1=1--`.
- Query ceilings: 30s by default, 20s for user-composed report queries. Set per
  connection, because the Pool's `statement_timeout` option has no effect
  against this database.
- No secrets appear in the built client bundle.

## Known gaps

- **No token revocation.** Removing access means waiting out the 7-day expiry or
  rotating `AUTH_SECRET`, which logs out everyone.
- **Rate limiting covers login only** (10 attempts / 10 minutes / IP).
- **`user_behavior` has no retention policy** — 11.1M rows and 5.6 GB as of
  10 August 2026, growing ~3M rows a month.
