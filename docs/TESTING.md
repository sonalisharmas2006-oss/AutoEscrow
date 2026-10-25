# Testing and QA

The repository has three distinct verification layers. Report them separately: a passing static build is not a passing workflow, and SQLite tests are not PostgreSQL certification.

## Backend checks

From `backend` in PowerShell:

```powershell
python -m compileall -q app migrations tests
python -m pytest -q tests/test_demo_sessions.py tests/test_demo_migrations.py tests/test_health.py --disable-warnings
python -m pytest -q --disable-warnings
```

Verified locally on October 25, 2026:

- Targeted session/migration/health checks: **29 passed** in the last targeted run.
- Full backend suite: **111 passed, 595 warnings** in the normal environment.
- Full backend suite in the fresh QA virtual environment `C:\Users\sonal\AppData\Local\Temp\agent-tmp\autoescrow-qa-venv`: **111 passed, 595 warnings**.
- `python -m compileall -q app migrations tests`: passed.
- `python -m pip check` in the fresh QA environment: `No broken requirements found.`

The backend tests cover health/readiness, exact CORS, model validation, matching and exclusions, immutable/versioned agreements, fixed-point escrow ledger/idempotency, execution/retry state, deterministic verification, disputes/refunds, audit events, seed boundaries, signed demo sessions, access gates, cross-session object denial, reset revocation, body/rate limits, cleanup, and actual Alembic migration preservation.

The migration test starts at revision `0010`, inserts an unscoped legacy job, upgrades to `0012_demo_sessions`, repeats `upgrade head`, verifies the legacy row remains, and exercises the explicit agent-seed/expired-cleanup CLI on a temporary SQLite file. It never uses the local development DB.

## Frontend static checks

From `frontend`:

```powershell
npm run lint
npm run typecheck
npm run build
```

These checks passed after the latest changes. `npm run build` creates the static export in `frontend/out`; it is not a deployment and does not test a hosted API. The normal build must be rerun after E2E because E2E intentionally builds with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8011`.

The installed Next version is `14.2.35` through the existing 14.x dependency range. `npm audit --omit=dev` currently reports **1 critical and 2 high findings** (`next`, transitive `postcss`, and `source-map-js`); the available Next fix is a major upgrade to 16.4.3. No major framework upgrade was attempted, so this remains a release blocker and is documented in `SECURITY_REVIEW.md`.

## Browser workflow checks

Prerequisites: Chromium installed with `npx playwright install chromium`, Python on PATH, and no separate backend/frontend server occupying ports 8011/3011.

```powershell
npm run test:e2e
```

The Playwright harness:

1. Builds the static export with an isolated API origin.
2. Starts FastAPI against a temporary SQLite file.
3. Applies `alembic upgrade head` to that file.
4. Loads synthetic agent records only.
5. Serves `frontend/out` at `127.0.0.1:3011` and the API at `127.0.0.1:8011`.
6. Deletes the temporary database when the server exits.

Latest run: **11 passed**. It covers:

- Passing workflow, reload/draft preservation, release idempotency, cross-session isolation, and reset revocation.
- Failed verification, blocked release, dispute review, and refund.
- Agreement revision to version 2, accepted revised amount, corrected submission, reload, and settlement.
- Aborted API request with truthful error, retry, registry filtering, and filtered-empty state.
- Invalid session recovery dialog, explicit session start, offline/reconnect notice, and no silent mutation replay.
- Primary routes at 1440, 768, and 390px, no horizontal overflow, no page exceptions, mobile navigation, and tablet marketplace filter bounds.
- Passing workflow at 390px with a screenshot.
- Workspace read recovery when a hosted read requires a session, local-read/session behavior, and persisted Light/Dark/System theme selection.

Screenshots and traces are ignored under `frontend/test-results/`; they are QA artifacts, not release evidence unless manually inspected. The latest visual review found the desktop homepage/demo record, failure/refund record, marketplace at 768px, job empty state at 390px, and passing workflow at 390px free of page overflow. A full visual design review of every filled route is still not claimed.

## Disposable migration smoke test

The repeatable test is preferred:

```powershell
python -m pytest -q tests/test_demo_migrations.py
```

For a manual temporary file, use a path outside the repo:

```powershell
$env:APP_ENV = "test"
$env:TEST_DATABASE_URL = "sqlite:///C:/Users/<you>/AppData/Local/Temp/autoescrow-migration-check.sqlite3"
python -m alembic upgrade head
python -m alembic current
```

Expect `0012_demo_sessions (head)`. Never run downgrade commands against a hosted database. `Base.metadata.create_all` is not a migration test.

## Manual local smoke test

1. Ensure the API uses local SQLite and `APP_ENV=development`; do not expose it beyond loopback.
2. Run `python -m alembic upgrade head`, then `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`.
3. Open the frontend and confirm `/api/health` is `ok`, `/api/ready` is `ready`, and `/demo` acquires a session automatically.
4. Complete passing and failing guided workflows. Refresh between stages. Confirm the job, immutable accepted terms, escrow entries, submission/verification, dispute, and events are read back from the API.
5. Open another browser context. Confirm it receives a different session and cannot read the first context's job or children.
6. Reset one context. Confirm its old token is rejected and another context's records remain.
7. Stop the API. Confirm the UI shows a truthful request error rather than an empty successful state. Reconnect and use the explicit retry/session flow.
8. Open `/marketplace`, `/discover`, `/dashboard`, `/jobs`, `/negotiation`, `/negotiate`, `/escrow`, `/execution`, `/verification`, `/disputes`, `/reputation`, `/audit`, `/risk`, `/identity`, `/initialize`, and `/settings` directly.
9. Check keyboard focus, the session dialog, 390px, 768px, and 1440px widths, and direct refreshes.

## Hosted PostgreSQL gate

This workspace did **not** provision or connect to PostgreSQL. Before an owner shares a hosted URL:

- Run migration `0012_demo_sessions` against a disposable managed PostgreSQL database.
- Run the full workflow and cross-session/reset/cleanup cases against PostgreSQL, not just SQLite.
- Restart the API with the same DB and signing secret and confirm persistence.
- Verify TLS/private networking, connection limits, backup/restore, CORS, access code, rate/request limits, readiness, provider cold starts, and direct static-route behavior.
- Keep production admission gated until the critical/high npm findings and any provider-specific gaps are resolved or consciously accepted for a short synthetic presentation.
