# Environment variables

Never overwrite a real `.env`. Copy examples only when the destination does not exist; see the root README. Backend environment variables override `backend/.env`. Keep real files, database URLs, logs, tokens, and backups out of Git.

## Backend: private service configuration

| Variable | Default / required value | Meaning |
|---|---|---|
| `APP_NAME` | `Auto Escrow API` | API display name. |
| `APP_ENV` | `development` | Accepted values: development, test, production; whitespace/case normalized, typos rejected. Hosted services must use production. |
| `DATABASE_URL` | `sqlite:///./auto_escrow.db` | Local SQLite, or private managed PostgreSQL URL when hosted. Conventional `postgres://` and `postgresql://` are normalized to the installed psycopg driver. |
| `TEST_DATABASE_URL` | unset | Used only in test mode; never point it at a real database. Pytest and browser fixtures normally supply disposable SQLite. |
| `FRONTEND_ORIGIN` | local origins in development | Comma-separated exact scheme/host/port origins. Production has no implicit localhost allowlist; wildcards are ignored. No trailing path or slash. |
| `MAX_SUBMISSION_RETRIES` | `2` | Two corrections after the initial submission; previous versions stay stored. |
| `DEMO_RESOLUTION_OPERATOR` | `demo-operator` | Server-side label, not an authentication credential. |
| `DEMO_SESSION_SECRET` | blank locally | Random private signing key, at least 32 characters in production. Known example placeholders are rejected. A blank local key is process-ephemeral, so a restart invalidates its tokens. |
| `DEMO_SESSION_TTL_SECONDS` | `3600` | Session lifetime; effective minimum 60 seconds. Persisted expiry is also checked. Reset does not extend the original expiry. |
| `DEMO_MAX_JOBS_PER_SESSION` | `3` | Stored jobs per sandbox before a scoped reset. |
| `DEMO_MAX_JOB_BUDGET` | `500.00` | Positive fixed-point ceiling for job and agreement creation/revision. USD guided UI also caps at 500. |
| `DEMO_RATE_LIMIT_PER_MINUTE` | `300` | Requests per server-observed client IP, not per forged session/header. Shared proxy/NAT users may share a bucket. |
| `DEMO_MAX_REQUEST_BYTES` | `200000` | Actual streamed request-body limit, including chunked bodies. |
| `DEMO_PUBLIC_ACCESS` | `false` | In production, false requires presenter-code admission. Keep false while launch gates remain open. |
| `DEMO_ACCESS_CODE` | unset | Private presenter code, at least 16 characters when gated. Set via secret UI/password manager; never in frontend build variables. Visitors type it into the admission dialog. |
| `DEMO_MAX_SESSIONS` | `200` | Stored session capacity, including expired records until explicit operator cleanup. Full capacity returns 503. |
| `DEMO_MAX_MUTATIONS_PER_SESSION` | `100` | Mutation attempts per sandbox before reset. Reset is exempt but remains rate-limited and expiry-bound. |
| `DEMO_PUBLIC_RESOLUTION_ENABLED` | `true` | Allows the owned synthetic sandbox's demo refund/operator path. **Not** the admission gate. False disables that path, not all public access. |

Additional fixed limits: 600 requests/minute across the process, 10 session issuance attempts/minute per observed IP, 15-second body-read timeout, bounded limiter buckets. There is no distributed limiter. Keep one API worker/instance and keep values positive and small; most numeric settings are not independently range-validated at startup.

Rotate the signing secret to invalidate all tokens immediately. Changing only the access code stops new admissions with the old code; it does not revoke already-issued sessions. Reset revokes just the caller's old session in the database. Expiration denies access but does not automatically delete records; use the documented cleanup CLI.

## Frontend: public build configuration

`frontend/.env.example` documents the only application variable:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` locally; the public HTTPS API origin when hosted. A trailing `/api/v1` is also supported. Never include credentials, query secrets, or a private database URL. |

Next embeds this value at **build time**. On Render choose **Save, rebuild, and deploy** after changing it. The Render build rejects missing, loopback, non-HTTPS, or credential-bearing API origins. Do not deploy E2E artifacts, which intentionally point at port 8011.

The browser keeps a short-lived bearer token, a draft, and selected job/agent IDs in local storage. Do not share that token or enter real personal/payment data. Drafts are not proof of server completion; statuses are reloaded from the API. XSS or a compromised same-origin script could steal local-storage tokens. There is no account recovery.

## Hosting runtime controls

- Backend: `PYTHON_VERSION=3.14.4` is the locally tested compatibility target; test supported security patch updates before rollout. The existing Python 3.11 Dockerfile is not the recommended/verified deployment path.
- Frontend build: `NODE_VERSION=24.22.1`; `SKIP_INSTALL_DEPS=true` when using `npm ci && npm run build` so the explicit install owns the lockfile workflow.
- Provider supplies backend `PORT`; do not set secrets through command-line arguments. Deployment commands are in `DEPLOYMENT.md`.
