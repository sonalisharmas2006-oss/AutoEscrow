# Auto Escrow backend

FastAPI + SQLAlchemy 2 + Alembic backend for jobs, matching, agreements, simulated escrow, execution, verification, disputes, and audit workflows. SQLite is the tested local default. PostgreSQL URL/driver support exists, but deployment must verify an actual PostgreSQL instance before launch. Migrations 0011–0012 add demo ownership and persisted expiring sessions.

## Setup

From the repository root on Windows PowerShell:

```powershell
Set-Location backend
if (-not (Test-Path .venv\Scripts\python.exe)) { python -m venv .venv }
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Python 3.14.4 passed the full suite in a clean virtual environment. No activation or execution-policy change is required with these explicit interpreter paths. Python 3.11 and the existing Docker image were not tested here.

Windows CMD alternative, from the repository root:

```bat
cd backend
if not exist .venv\Scripts\python.exe python -m venv .venv
if not exist .env copy .env.example .env
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Privately check that the real `.env` targets the intended **local SQLite** database in development mode. Stop the API and back up any existing DB before the following commands (same syntax in PowerShell and CMD):

```text
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m app.seed
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The application never creates, resets, drops, or downgrades tables during startup. Full variable descriptions and defaults are in `../docs/ENVIRONMENT.md`. Never expose development mode beyond loopback: its no-header API deliberately retains legacy unscoped behavior.

## Environment

```text
APP_ENV=development
DATABASE_URL=sqlite:///./auto_escrow.db
FRONTEND_ORIGIN=http://localhost:3000
DEMO_RESOLUTION_OPERATOR=demo-operator
```

When `APP_ENV=test`, `TEST_DATABASE_URL` may point tests or migration checks at an isolated database. PostgreSQL URLs can use `postgresql+psycopg://...`.

## Migrations

The current chain is:

```text
0001_phase1_foundation
  -> 0002_escrow_domain
  -> 0003_explicit_domain_fields
  -> 0004_optional_job_requester
  -> 0005_audit_event_description
  -> 0006_matching_results
  -> 0007_agreement_negotiation
  -> 0008_simulated_escrow_lifecycle
  -> 0009_dispute_workflow
  -> 0010_harden_ledger_idempotency
  -> 0011_demo_session_scope
  -> 0012_demo_sessions (head)
```

Run:

```powershell
python -m alembic upgrade head
python -m alembic current
```

For a disposable SQLite migration check (the test creates a temporary file and verifies legacy-row preservation):

```powershell
python -m pytest -q tests/test_demo_migrations.py
```

Do not run downgrade commands against a production database.

## Seed data

Load six deterministic synthetic agents:

```powershell
python -m app.seed
```

Load agents plus two synthetic jobs and complete mock workflows:

```powershell
python -m app.seed --with-jobs
```

The two workflows include one funded, running job and one verified, completed
job with a released escrow. The command also records their audit and ledger
events and is safe to rerun without duplicating workflow records.

The command is repeatable and does not reset existing records. Seed records are marked as synthetic demo data in their metadata. It refuses to run unless `APP_ENV` is `development` or `test`; never point it at a production database.

The browser uses scoped sessions, so unscoped seeded jobs do **not** appear in its workspace. Create jobs through `/demo/` for a presentation. Profile performance statistics in the seed are synthetic fixtures, not measured results.

For a dedicated hosted **synthetic-only** database, the operator CLI provides explicit agent-only seeding without bypassing production mode:

```text
python -m app.demo_admin seed-agents --confirm-synthetic-database
python -m app.demo_admin cleanup-expired --confirm-synthetic-database
```

The first command inserts missing synthetic profiles, does not modify existing ones, and refuses a colliding private profile. The second permanently deletes expired sessions and their owned workflow children, preserving live and unscoped records. It does not reset all users. Pause API traffic before operator maintenance: the CLI does not share the web process's mutation lock. Do not seed or clean up automatically at application startup.

The dashboard risk score is a calculated 0–100 metric where higher is riskier:
50 points when any dispute is open or under review, up to 20 points for the
largest funded/held escrow relative to the maximum job budget, up to 15 points
for weighted active-agent success-rate shortfall, and up to 15 points for
failed verification history. Missing history contributes no penalty; amounts
in different currencies are not summed or converted.

## Run

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Health: `http://127.0.0.1:8000/api/health`
- Database/schema readiness: `http://127.0.0.1:8000/api/ready`
- Docs: `http://127.0.0.1:8000/docs`
- Versioned API: `http://127.0.0.1:8000/api/v1`

## API surface

- `POST /api/v1/demo/session` (optional `{ "access_code": "..." }`; never log real codes)
- `POST /api/v1/demo/session/reset` (requires the current signed credential)
- `GET /api/v1/agents`
- `GET /api/v1/agents/{agent_id}`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs`
- `GET /api/v1/jobs/{job_id}`
- `POST /api/v1/jobs/{job_id}/matches`
- `GET /api/v1/jobs/{job_id}/matches`
- `POST /api/v1/jobs/{job_id}/matches/{agent_id}/select`
- `GET /api/v1/jobs/{job_id}/agreement`
- `POST /api/v1/jobs/{job_id}/agreement`
- `GET /api/v1/agreements/{agreement_id}`
- `GET /api/v1/agreements/{agreement_id}/history`
- `POST /api/v1/agreements/{agreement_id}/revise`
- `POST /api/v1/agreements/{agreement_id}/accept`
- `POST /api/v1/agreements/{agreement_id}/reject`
- `POST /api/v1/agreements/{agreement_id}/cancel`
- `POST /api/v1/jobs/{job_id}/escrow/fund`
- `GET /api/v1/jobs/{job_id}/escrow`
- `GET /api/v1/escrows/{escrow_id}/ledger`
- `POST /api/v1/escrows/{escrow_id}/release`
- `POST /api/v1/escrows/{escrow_id}/refund`
- `GET /api/v1/jobs/{job_id}/events`
- `GET /api/v1/escrows/{escrow_id}`
- `GET /api/v1/dashboard/metrics`
- `POST /api/v1/jobs/{job_id}/start`
- `GET /api/v1/jobs/{job_id}/execution`
- `POST /api/v1/jobs/{job_id}/submit`
- `GET /api/v1/jobs/{job_id}/submissions`
- `POST /api/v1/jobs/{job_id}/verify`
- `GET /api/v1/jobs/{job_id}/verification`
- `GET /api/v1/dashboard/execution`
- `POST /api/v1/jobs/{job_id}/disputes`
- `GET /api/v1/jobs/{job_id}/disputes`
- `GET /api/v1/disputes`
- `GET /api/v1/disputes/{dispute_id}`
- `POST /api/v1/disputes/{dispute_id}/review`
- `POST /api/v1/disputes/{dispute_id}/resolve`
- `GET /api/v1/disputes/{dispute_id}/events`

`GET /api/v1/jobs` accepts optional `status`, `task_category`, `min_budget`,
`max_budget`, `search`, `skip`, `limit`, and `sort` query parameters. `sort`
is either `newest` (the default) or `deadline`. Budget values use fixed-point
Decimal validation, and job creation always starts in the centralized `open`
state. The create request trims and normalizes text and required skills and
rejects client-supplied workflow or assignment state fields.

Production calls require `X-Demo-Session`, except issuance. Use `APP_ENV=production`, a private random signing secret, `DEMO_PUBLIC_ACCESS=false`, and a presenter access code. Run one worker/instance. See the gated deployment walkthrough and launch blockers in `../docs/DEPLOYMENT.md` and `../docs/SECURITY_REVIEW.md`.

## Phase 5 matching

`POST /api/v1/jobs/{job_id}/matches` evaluates every registered agent and
persists one `match_results` row per agent under a generated `run_id`.
`GET /api/v1/jobs/{job_id}/matches` returns the latest persisted run; it returns
`204` when the job exists but has no run yet. The response separates ranked
eligible `candidates` from `excluded_agents`, and every candidate includes its
score, matched/missing skills, component breakdown, explanation, warnings, and
eligibility reasons.

The scoring policy is versioned as `phase5-v1` in
`app/services/matching.py`. Its configurable default weights are skills 50%,
exact normalized category membership 20%, availability/deadline 20%, and
budget 10%. Required skills, active status, available status, and known
deadline incompatibility are eligibility rules rather than soft preferences.
Skills and categories are trimmed and compared case-insensitively. An agent
without a known completion estimate remains eligible and receives a deadline
warning with a neutral 0.5 deadline component. Agent pricing is not present in
the current data model, so budget is explicitly unknown, contributes neutral
0.5 / 5 points, and always emits a warning; no price is inferred.

`POST /api/v1/jobs/{job_id}/matches/{agent_id}/select` re-evaluates the agent
server-side and permits selection only while the job is `open`. It sets only
`selected_agent_id` and matching metadata, records one `job.agent_selected`
audit event with score/run/version, and leaves the job open. Repeating the same
selection is idempotent; replacing a different selection and selecting an
ineligible/missing agent are rejected. The endpoint accepts an optional
`{"run_id": "..."}` body to associate the selection with a persisted run.
It does not accept arbitrary state, create agreements, accept agreements, or
fund escrow.

## Phase 6 agreements

An agreement can be proposed only for an open job with a persisted selected
agent. Omitted proposal budget, deadline, currency, and terms use the job's
defaults; the generated terms include scope, expected deliverable, acceptance
criteria, verification method, cancellation conditions, dispute conditions,
and optional instructions. A proposal's append-only history is versioned from
1. `request_revision` moves a proposal to `revision_requested`, and
`submit_revision` records the next version and returns it to `proposed`.

Only a proposed agreement can be accepted. Acceptance freezes the current
proposal version, moves the job from `open` to `assigned` through the central
job transition policy, records an audit event, and does not fund escrow.
Repeated acceptance is idempotent; accepted, rejected, and cancelled
agreements cannot be revised or changed again.

## Phase 7 simulated escrow lifecycle

Funding is a server-derived operation. A job must have an accepted agreement,
the agreement must belong to that job and have an `accepted_version`, and the
job must be assigned or later in its lifecycle. The fund request may contain
only optional `idempotency_key` and safe `reference` metadata; amount and
currency are copied from the accepted agreement, so client-supplied money
fields cannot change the financial effect.

```http
POST /api/v1/jobs/{job_id}/escrow/fund
Content-Type: application/json

{"idempotency_key": "demo-funding-1", "reference": "synthetic-payment"}
```

The first funding operation creates an escrow in persisted `funded` status and
one canonical `funding` ledger entry with a positive fixed two-decimal amount,
currency, job id, and idempotency key. Existing `pending` escrows and legacy
`deposit` ledger entries remain readable. Repeating the same request returns
the existing financial effect; a conflicting idempotency key or reference is
rejected. `GET /api/v1/jobs/{job_id}/escrow` continues to return `204` when no
escrow exists, while escrow detail includes the accepted agreement version,
accepted amount/currency, funding state, and ledger entries.

The escrow state machine is centralized in `app/escrow_states.py`. It permits
`pending -> funded`, `funded -> held/released/refunded/disputed`, and
`held -> released/refunded/disputed`. A disputed escrow can settle only after
a persisted resolved dispute explicitly authorizes the requested release or
refund, and any unresolved dispute blocks settlement regardless of the escrow
status. Release is also guarded by a completed job and a passed verification
for normal non-dispute settlement. Refund is not an unrestricted client
operation and returns `409 refund requires a valid dispute resolution` without
an authoritative resolved dispute. Settlement entries are atomic and cannot
exceed the funded balance or combine released and refunded effects.

Funding, ledger persistence, state changes, and `escrow.created`/
`escrow.funded` audit events commit together or roll back together. Release
records `escrow.settled`; refund records `escrow.refunded`.

## Tests and checks

```powershell
make test
make compile
make migrate
make migrate-down
make migrate
```

Tests use temporary SQLite databases and cover health, schema initialization, agent retrieval, job validation/persistence, normalized creation, filtering/pagination, metrics, seed idempotency, audit events, missing records, deterministic matching, persisted match runs, eligibility explanations, selection revalidation, idempotency, and selection audit events.
They also cover selected-agent agreement creation, default and invalid terms,
versioned negotiation history, revision transitions, acceptance freezing and
idempotency, terminal transitions, agreement audit events, and missing history.
Phase 7 tests cover funding prerequisites, server-derived money fields,
idempotent and conflicting funding requests, ledger persistence, centralized
escrow transitions, guarded release/refund operations, balance limits, audit
events, and rollback after a forced transaction failure.
