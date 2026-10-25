# Auto Escrow

Auto Escrow is a hackathon MVP for coordinating AI-agent work with clearer task requirements, explainable matching, versioned agreements, simulated escrow accounting, deterministic verification, guarded settlement, disputes, and audit history.

## What the prototype demonstrates

1. Discover a synthetic agent by its capabilities and availability.
2. Define a job with a deliverable, budget, deadline, and acceptance criteria.
3. Compare real backend match results, including score factors and exclusions.
4. Review and accept immutable agreement terms.
5. Record simulated escrow funding in a fixed-point ledger.
6. Start a safe local demo execution and persist a submission.
7. Verify the submission against the accepted criteria.
8. Release only when the existing backend rules permit it, or demonstrate the failed-verification dispute/refund path.
9. Review the persisted ledger and audit timeline.

Start with the guided prototype at `/demo`.

## Important limitations

This is a synthetic hackathon prototype. It does not process real payments, hold real funds, execute arbitrary submitted code, provide production user authentication, use a blockchain, or claim real-world agent performance. See `DEMO_GUIDE.md`, `DEMO_USER_GUIDE.md`, and `docs/SECURITY_REVIEW.md`.

## Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS.
- Backend: FastAPI, Pydantic, SQLAlchemy 2, Alembic.
- Local database: SQLite. Hosted persistence: PostgreSQL-compatible SQLAlchemy URL.
- Verification: deterministic, safe checks over stored output; unsupported or subjective criteria remain manual review.

## Run locally on Windows

Local operation is free and uses SQLite. Python 3.14.4 was tested, including a fresh virtual environment. Do not assume `py -3.11` is installed. See `backend/README.md` for CMD alternatives and `docs/TESTING.md` for evidence.

From the repository root, in PowerShell:

```powershell
Set-Location backend
if (-not (Test-Path .venv\Scripts\python.exe)) { python -m venv .venv }
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Privately confirm the existing environment uses `APP_ENV=development` and the intended local SQLite database. Back up any existing database with the API stopped before migrating. Never replace an existing `.env` with the example. Then:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.seed
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

In another PowerShell window, from the repository root:

```powershell
Set-Location frontend
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm ci
npm run dev
```

Open `http://localhost:3000` and choose **Try the guided demo**, then **Synthetic Beacon**. The frontend automatically acquires its own sandbox; no browser-side API configuration is needed beyond the developer's environment file. Before a sandbox is created, local read-only workspace pages can show existing seeded records; once a session is active, workspace data is correctly scoped to that sandbox.

## Checks

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m compileall -q app migrations
.\.venv\Scripts\python.exe -m pytest -q --disable-warnings

Set-Location ..\frontend
npm run lint
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm run build
```

## Deployment

Browser tests require `python` on PATH (activate the backend venv if needed). They use a temporary migrated SQLite database, not `backend/auto_escrow.db`. Run the normal build after E2E to replace its test-only API URL.

Manual deployment instructions, environment variables, migration guidance, and post-deploy checks are in `docs/DEPLOYMENT.md`, `docs/ENVIRONMENT.md`, and `docs/TESTING.md`. Hosting is **not performed**. Production admission is presenter-code gated by default. PostgreSQL verification and unresolved dependency advisories block an unrestricted launch; see `docs/SECURITY_REVIEW.md`.
