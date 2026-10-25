# Security review and launch boundary

This is a scoped synthetic prototype, not a production identity, payment, or custody system. The repository deliberately keeps the UI honest: there are no real payments, real agents, arbitrary code execution, blockchain settlement, independent arbitration, production user accounts, or measured real-world performance claims.

## Protections implemented and tested

- Production API resources require a server-issued HMAC-signed credential. The token contains an unpredictable session id and expiry; the browser cannot choose an id. Persisted `demo_sessions` records enforce expiry/revocation after signature verification.
- Production admission is code-gated by default (`DEMO_PUBLIC_ACCESS=false`). Access code comparison is constant-time and the configured code must be at least 16 characters when gating is enabled. Issuance and requests have explicit no-store responses.
- Each public job stores its `demo_session_id`. Lists, job children, agreements, escrow/ledger, executions, submissions, verifications, disputes, events, and dashboard aggregates are scoped to the verified session. Cross-session reads/writes return not-found or unauthorized behavior rather than leaking whether another sandbox owns the id.
- Reset requires the current credential, deletes only that session's workflow children, removes/revokes the old persisted session, issues a replacement, and retains the original expiry. A stolen old token is rejected after reset. Expired sessions remain for explicit cleanup; they are not silently deleted in a request.
- Cleanup requires an explicit `--confirm-synthetic-database` operator flag and a database session. It deletes only expired session-owned jobs and dependent agreements, escrows, ledger entries, submissions, verifications, disputes, matches, and audit events. It preserves unscoped and live records and refuses to overwrite colliding non-synthetic seed identities.
- Registry/matching output in a scoped session is synthetic-only, hides endpoint URLs, and exposes only synthetic metadata. Public jobs cannot assert requester identity from client input.
- Per-session job count, budget, mutation count, stored-session capacity, body size, issuance rate, global rate, and bounded bucket cleanup limits apply. Body sizes are counted from the stream, not only `Content-Length`. CORS wraps admission errors so a browser can explain 413/429 responses.
- One process-local `asyncio.Lock` serializes writes; the supported hosted shape is one worker and one API instance. The API refuses no credential in production, while local development preserves legacy no-header tests on loopback.
- Funding derives amount/currency from the accepted version and uses fixed-point amounts plus idempotency. Release requires the existing completed-job, passed-verification, no-unresolved-dispute, balance, and state-transition checks. Failed verification cannot be released through the public dispute operator path.
- The frontend never receives `DATABASE_URL`, `DEMO_SESSION_SECRET`, provider credentials, or backend operator credentials. `NEXT_PUBLIC_API_URL` is the only public deployment variable. Client drafts are not treated as authoritative.

## Known limitations and blockers

1. **Not production authentication.** There are no users, login, roles, tenant administration, account recovery, CSRF/session-account model, or durable identity guarantees. A demo token is a scoped capability, not an account.
2. **Token theft remains possible.** A stolen unexpired token works until expiry, reset, or secret rotation. Local storage is exposed to same-origin XSS. Use HTTPS, a strict provider security-header policy, no third-party script injection, short TTLs, and a private presenter code.
3. **In-process controls do not scale.** Rate limits, write serialization, and capacity cleanup assumptions are process-local. Do not add workers, replicas, autoscaling, or a public load balancer shape without a shared limiter/lock and a reviewed transaction model. Provider/WAF DDoS mitigation is not application authorization.
4. **PostgreSQL is unverified here.** SQLite migrations and workflows pass; no actual PostgreSQL instance was provisioned. Hosted launch remains gated until migration, persistence, locking, backup, and rollback checks run against the chosen provider database.
5. **Frontend dependency audit is unresolved.** On October 25, 2026, `npm audit --omit=dev` reported 1 critical and 2 high findings. The available automatic Next fix is a major upgrade to 16.4.3. Static export reduces the exposed Next server surface but does not prove all advisories are irrelevant. Do not claim the audit is fixed.
6. **Runtime compatibility is only partially verified.** Python 3.14.4 and Node 25.8.0 local checks passed; Render's documented defaults/targets change over time. The existing Python 3.11 Dockerfile was not container-tested because Docker is unavailable. Pin and test provider runtimes before launch.
7. **Hosted route behavior is unverified.** Local static-server tests cover generated directory indexes, but the provider's CDN deep-link/404 behavior and cache rules must be checked manually. Do not install a blanket rewrite to `/index.html` without testing; it can mask real not-found routes.
8. **Free hosting is ephemeral/constrained.** Free API services sleep after idle; free PostgreSQL expires and has no managed backups. SQLite on an ephemeral service filesystem is not a persistence plan.
9. **Operator maintenance needs a quiet window.** The cleanup CLI is explicit but does not share the API process lock. Pause traffic before running it, and verify the target database. It is not a generic deletion job.
10. **No abuse/stress certification.** The bounded limiter is a small-instance guard, not DDoS protection, bot management, or a load-test result. Test provider/WAF behavior and privacy/abuse requirements separately.

## Safe launch posture

For a short private judge presentation only, use:

- one API worker/instance;
- managed PostgreSQL, not hosted SQLite;
- `APP_ENV=production`;
- `DEMO_PUBLIC_ACCESS=false` and a private presenter code;
- HTTPS exact CORS origin;
- private random signing secret;
- modest TTL, job, budget, mutation, rate, and body caps;
- synthetic profiles only and no real personal/payment data;
- explicit readiness/migration/persistence/cross-session checks;
- a manual owner rollback and backup plan;
- documented disclosure that the demo is synthetic and simulated.

Do not call the system production-ready until the blockers above are reviewed and the owner has performed the hosted checks. No deployment, account, database, or public URL exists from this coding session.
