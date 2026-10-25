# Manual GitHub publication checklist

No Git commands, commits, pushes, remotes, GitHub accounts, or hosting resources were accessed by the coding assistant.

## Before staging manually

- Review `git status`, the complete diff, and intended file names. Stage only project files you recognize; do not use a blanket add without inspection.
- Confirm `backend/.env`, `frontend/.env.local`, local SQLite/DB files, backups, private logs, tokens, Playwright traces/screenshots, and credentials are ignored and not already tracked.
- Run a secret scanner if available. Inspect every match manually for database URLs, HMAC/signing secrets, access codes, cookies, authorization headers, or personal data.
- Confirm the moved old frontend is not inside this repository and has not been copied back. The current `frontend/` remains the active implementation.
- Confirm intended new/changed files include migrations `0011_demo_session_scope.py` and `0012_demo_sessions.py`, scoped session code, cleanup/admin code, `frontend/.node-version`, `backend/.python-version`, and synchronized docs.
- Confirm the root `.gitignore` ignores `.env*` except examples, databases, `.venv`, `node_modules`, `.next`, `out`, and browser artifacts.
- Do not stage `frontend/out/` or `frontend/test-results/`.
- Never put `DATABASE_URL`, `DEMO_SESSION_SECRET`, `DEMO_ACCESS_CODE`, backend operator values, or provider credentials in `NEXT_PUBLIC_*`, `frontend/.env.example`, screenshots, README examples, or `render.yaml` values.

## Checks before publication

From `backend`:

```powershell
python -m compileall -q app migrations tests
python -m pytest -q --disable-warnings
```

From `frontend`:

```powershell
npm run lint
npm run typecheck
npm run test:e2e
npm run build
```

The E2E build intentionally points at the disposable API on port 8011; run the final normal `npm run build` afterward. Current local evidence is 111 backend tests passing and 9 browser tests passing, but PostgreSQL and hosting are not certified.

## Suggested manual sequence

1. Create/select the intended GitHub repository and branch.
2. Review the working tree and complete diff; verify no secrets or ignored artifacts are staged.
3. Publish using the owner's normal GitHub process. Do not create a second application or restore the old frontend.
4. Connect the published repository to the chosen host manually.
5. Create managed PostgreSQL separately. Run `alembic upgrade head` and verify `0012_demo_sessions` before the API accepts traffic.
6. Set private API variables and a private presenter access code. Keep `DEMO_PUBLIC_ACCESS=false` until hosted checks pass.
7. Deploy the API as one worker/instance, then deploy the frontend static export with the public HTTPS API origin.
8. Update exact CORS origin, verify readiness, run passing/failing/isolation/reset/persistence checks, then decide whether to share the URL.

Never paste `backend/.env`, a production `DEMO_SESSION_SECRET`, `DEMO_ACCESS_CODE`, database exports, or a token into GitHub. There is no deployment URL to add to the repository from this session.
