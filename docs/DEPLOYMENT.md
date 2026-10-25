# Manual gated-demo deployment

**Nothing has been deployed. No public URL has been verified.** Do not publish an unrestricted anonymous demo yet: actual PostgreSQL behavior, dependency advisories, and provider-specific security checks remain launch gates. Keep `DEMO_PUBLIC_ACCESS=false`. An access code reduces exposure; it does not fix vulnerable dependencies or replace production authentication.

## Architecture and cost choice

Use the existing repository, not a provider starter template:

```text
Browser → Render Static Site (frontend/out)
        → public HTTPS FastAPI service (one worker, one instance)
        → dedicated managed PostgreSQL (private connection from the service)
```

The frontend is an actual Next static export. No Next server, database, payment processor, Redis, external agent executor, or blockchain is needed for this demo. All persisted state belongs to the API/database.

Provider documentation checked **October 25, 2026**; confirm the checkout/dashboard before paying:

- Render Hobby workspace: $0/month plus compute; listed allowance 5 GB outbound bandwidth and 500 standard pipeline minutes/month.
- Optional always-on API compute starts at $7/month; paid PostgreSQL compute starts at $6/month. The nominal $13/month combination is **not an all-inclusive quote**: storage, usage, taxes, and chosen plans can add charges. Static hosting has no separate compute charge. Local SQLite operation requires none of these paid services.
- Free API services idle after 15 minutes; restart can take about a minute. There are 750 free instance hours per workspace/month and no free-service shell/one-off jobs. Local files are ephemeral: **never host the database as SQLite on that filesystem**.
- Free PostgreSQL has 1 GB storage, expires after 30 days, then has a 14-day upgrade grace period before deletion. It has no managed backups. It is suitable only for disposable demonstrations, not promised durable storage.

Sources: [pricing](https://render.com/pricing), [free-service limits](https://render.com/docs/free). Workspace plan and compute plan are separate choices. The user selects/pays for resources manually; none were provisioned here.

## 1. Publication and dedicated database — owner only

1. Complete `GITHUB_PUBLICATION_CHECKLIST.md`. Publish the reviewed current frontend/backend yourself. Do not include `.env`, databases, backups, browser traces, or the moved old frontend.
2. In Render choose **New → Postgres**. Choose a dedicated synthetic-demo database, region, and consciously selected compute plan. Use the same region for API/database.
3. Copy the **internal** database URL privately into the API service's `DATABASE_URL` when creating it. Never share the database environment group with the frontend.
4. For initial migrations, use a paid service shell/one-off job if available, or the database's **external** TLS URL from your own machine. Restrict external database access to your IP, keep TLS enabled, and close that access afterward.

### Initial migration without relying on a free-service shell

In a **new PowerShell window**, from `backend`, with the existing virtual environment installed:

```powershell
# Hidden prompt avoids storing the connection string in command history.
$credential = New-Object System.Management.Automation.PSCredential('unused', (Read-Host 'Dedicated synthetic Postgres external URL (TLS)' -AsSecureString))
$env:DATABASE_URL = $credential.GetNetworkCredential().Password
$env:APP_ENV = 'production'
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m alembic current
```

Stop on any error. Expect **`0012_demo_sessions (head)`**. Confirm the target is the dedicated synthetic database, not a real environment. Never use `create_all`, a downgrade, or a startup reset as a deployment shortcut. For an existing hosted DB, take and verify a backup first.

Then seed only the public synthetic profiles, once:

```powershell
.\.venv\Scripts\python.exe -m app.demo_admin seed-agents --confirm-synthetic-database
```

Expected on an empty database: six profiles; repeating inserts zero. This operator command works in production without opening registration or changing `APP_ENV` to development. It refuses a conflicting non-synthetic identifier and never creates global jobs. Do **not** use `app.seed --with-jobs` in production. Close the PowerShell window to discard its private environment afterward.

These CLI commands passed against migrated disposable SQLite here. Their PostgreSQL execution is still an owner-run verification gate, not a claimed success.

## 2. Python API service

Choose **New → Web Service**, connect your reviewed repository and branch, and select **Python 3** (not Docker):

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `python -m pip install -r requirements.txt` |
| Start command | `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --no-proxy-headers --limit-concurrency 32` |
| Health check path | `/api/ready` |
| Instance count | `1`; no autoscaling |
| Python compatibility target | `PYTHON_VERSION=3.14.4` (tested locally; review/test newer security patches before broader launch) |

`$PORT` is Render's Linux-shell variable, **not** a Windows PowerShell command. Do not use reload, Gunicorn multi-workers, concurrent maintenance, or migrations in the web start command. A rolling deployment can briefly overlap processes: keep admission closed to new visitors during upgrades; a broadly available service needs shared database/distributed admission controls.

In **Environment**, enter private values and defaults from `ENVIRONMENT.md`, particularly:

```text
APP_ENV=production
DATABASE_URL=<private internal PostgreSQL URL>
FRONTEND_ORIGIN=https://<actual-static-site-host>
DEMO_SESSION_SECRET=<random private key of at least 32 characters>
DEMO_PUBLIC_ACCESS=false
DEMO_ACCESS_CODE=<random presenter code of at least 16 characters>
DEMO_SESSION_TTL_SECONDS=3600
DEMO_MAX_JOBS_PER_SESSION=3
DEMO_MAX_JOB_BUDGET=500.00
DEMO_MAX_SESSIONS=200
DEMO_MAX_MUTATIONS_PER_SESSION=100
DEMO_RATE_LIMIT_PER_MINUTE=300
DEMO_MAX_REQUEST_BYTES=200000
DEMO_PUBLIC_RESOLUTION_ENABLED=true
MAX_SUBMISSION_RETRIES=2
```

Generate/store secrets in a password manager or the provider's secret controls, not a repository file or chat. The placeholders above must not be copied literally. Without a real access code, production session issuance stays closed. Initially leave CORS empty if the static-site origin is not known; update it in step 3.

The proposed `--no-proxy-headers` avoids trusting arbitrary forwarded identities. Behind a proxy, IP-based quotas may therefore be shared by visitors. The global ceiling still applies; test actual hosted behavior and use provider/WAF controls before any large audience. Do not change to trusting all forwarded headers as a workaround.

## 3. Static frontend and CORS

Choose **New → Static Site**, the same repository/branch:

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm ci && npm run build` |
| Publish directory | `out` |
| Start command | **None**; do not use `npm start` or `next start` on a public web service |
| `NEXT_PUBLIC_API_URL` | Actual public HTTPS API origin from step 2, not localhost or an internal hostname |
| `NODE_VERSION` | `24.22.1` |
| `SKIP_INSTALL_DEPS` | `true` (explicit `npm ci` owns installation) |

No backend secrets belong in static-site variables. The browser must know only the public API address. The build configuration checks the Render API URL and exports per-route directory indexes, including `out/demo/index.html` and `out/jobs/index.html`.

Use those exported paths directly. **Do not add `/* → /index.html` SPA rewrites**: this is a multi-page static export, not a single index router. Verify directory index handling, direct reloads, query links (`/jobs/?job=...`), and HTTP 404 for an unknown route. The generated `out/404.html` supplies the app's not-found content where the host supports it. Provider routing/404 behavior is not certified by local browser tests.

Once Render assigns the static-site origin, set backend `FRONTEND_ORIGIN` to that exact HTTPS origin and redeploy the API. For multiple approved origins use a comma-separated allowlist, with no path, trailing slash, or wildcard. CORS is not authentication.

Changes to `NEXT_PUBLIC_API_URL` require **Save, rebuild, and deploy** on the static site. A runtime-only redeploy cannot change an address embedded in JavaScript. Do not upload `out` from E2E: it targets the isolated test API at port 8011.

## 4. PostgreSQL and hosted acceptance checks

Keep admission gated throughout. Run these against a disposable hosted database first; record results before reusing the settings for a presentation:

1. `/api/health` returns `ok`; `/api/ready` returns `ready` only when the database and new schema columns are reachable. Health alone proves no DB readiness.
2. Confirm `alembic current` is `0012_demo_sessions`. Repeating `upgrade head` should be a no-op; retain existing records. Do not downgrade an actual database.
3. Open the static frontend. Browser requests must go to the public HTTPS API, not port 8000/8011 on localhost. Without a token, API resources return 401; missing/wrong presenter code cannot issue a session.
4. Enter the presenter code. Complete the passing workflow, including immutable accepted terms and exactly one funding/release entry. Repeat funding and attempt duplicate release; no extra money effect should appear.
5. Run a failed submission. Normal release must remain blocked; demonstrate a recorded dispute/refund. Try revision-before-acceptance and a corrected submission separately.
6. Use another browser/incognito context to create another sandbox. Check cross-session job, agreement, ledger, submission, verification, dispute, audit, and dashboard access; owned objects must not leak. Reset A; A's old token must be rejected while B's records remain intact.
7. Restart/redeploy the API with the same database and signing secret, within the session TTL. Existing scoped records must still load. This is the persistence test missing from a purely in-memory demonstration.
8. Verify CORS from the exact frontend origin, disallowed-origin behavior, session expiry, request-size/rate errors, and shared-proxy quotas. No automated stress/load attack is authorized by these instructions.
9. Test direct links, unknown routes, 390/768/1440px widths, keyboard dialog/navigation, cold-start errors and explicit retry. A free-service cold start may outlast the browser's 30-second timeout; wait for readiness and retry rather than showing invented success.
10. Only after every gate and security finding is resolved or consciously accepted for a limited synthetic presentation should the owner share a URL. Record the actual URL after verifying it; none is supplied by this repository.

Pytest/browser automation here exercises SQLite, not PostgreSQL. Passing local tests does not replace steps 1–9.

## 5. Maintenance, backups, and rollback

- Session expiry denies access immediately but leaves rows for explicit cleanup. At 200 stored sessions admission returns 503. During an owner-controlled maintenance window, pause API traffic and run against the verified dedicated database:

  ```text
  python -m app.demo_admin cleanup-expired --confirm-synthetic-database
  ```

  It permanently deletes only expired session-owned workflows and their children. It preserves unscoped/local jobs, live sandboxes, and agent profiles. No automatic cleanup scheduler is provisioned; the CLI does not share the API's in-process lock.
- `DEMO_PUBLIC_ACCESS=false` means **code-gated**, not globally disabled. To stop new admissions, change/withhold the code; to invalidate existing tokens, rotate the signing secret as well. Suspend the service when fully stopping a demo. A code change alone does not revoke tokens.
- Back up before a migration. Render paid PostgreSQL supports PITR: currently 3 days on Hobby, 7 days on Pro+. Free PostgreSQL has no managed recovery. A backup is not verified until restored to a separate empty database and checked.
- Keep database exports outside the repository in private storage. Use the provider recovery UI or matching PostgreSQL client tools; never restore over the active database as a first attempt.
- Roll back application builds only to versions compatible with the current schema and access boundary. Rolling back to pre-session code could reopen unscoped access. Prefer a forward fix; do not blindly run `alembic downgrade`.
- For recovery, restore a **new** database, verify counts/ledger/audit/scoping, then manually switch the backend's private connection string and redeploy. Keep the old database until the new one is validated.

## Official references checked October 24, 2026

- [FastAPI service settings](https://render.com/docs/deploy-fastapi)
- [Next static export deployment](https://render.com/docs/deploy-nextjs-app)
- [Static-site setup and installation controls](https://render.com/docs/static-sites)
- [Redirect/rewrite matching](https://render.com/docs/redirects-rewrites)
- [Environment variables and rebuild options](https://render.com/docs/configure-environment-variables)
- [Python version selection](https://render.com/docs/python-version)
- [Node version selection](https://render.com/docs/node-version)
- [Pricing](https://render.com/pricing), [free limitations](https://render.com/docs/free), [PostgreSQL recovery](https://render.com/docs/postgresql-backups)

These are provider references, not evidence that a cloud deployment, backup, or public link was created here.
