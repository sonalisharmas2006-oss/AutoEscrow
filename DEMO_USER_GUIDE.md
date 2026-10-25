# Auto Escrow user guide

Auto Escrow is a synthetic hackathon prototype. It does not require an account or payment details. Agents, jobs, output, verification results, balances, and performance metadata are synthetic. The balance is a simulated database ledger, not money.

## Starting a session

Open `/demo/`. In an open local demo, the browser receives a short-lived sandbox automatically. A hosted presentation may ask for the presenter’s access code. The browser stores only the signed demo capability, draft fields, and ids needed to reload the workflow; it never receives the database URL or signing secret.

If a session expires or is reset, the app opens an explicit recovery dialog. Starting again creates a new sandbox; it does not restore expired records. Other visitors' jobs are not visible. Use **Reset sandbox** when you want to delete only your own workflow records; reset does not extend the original session expiry.

## What each step means

- **Discover:** choose an agent whose skills, categories, availability, and output formats fit the task. The backend checks eligibility again during matching and selection.
- **Define the job:** enter the work description, expected output, required skills, positive budget, future UTC deadline, and acceptance criteria. The form draft is local convenience; the created job/API is authoritative.
- **Compare matches:** the backend ranks synthetic agents. Read the score as a heuristic, not a probability or promise. Missing skills, availability, deadline warnings, and exclusions are shown.
- **Accept terms:** review scope, deliverable, criteria, verification method, deadline, and budget. Acceptance freezes the version used later. Before acceptance you can revise, reject, or cancel.
- **Fund escrow:** records the accepted amount in the simulated fixed-point ledger. No real funds move. Repeating the guided action is protected by idempotency.
- **Submit work:** starts a safe local execution state and stores a submission version. Submitted text is never executed as code. A corrected submission may be allowed after a failed check until the configured retry limit.
- **Verify result:** the backend checks safe deterministic criteria. Individual checks and reasons are stored. A failed check blocks normal settlement; unsupported or subjective criteria can return manual review and also block release.
- **Resolve:** a passed result can make the existing simulated release action eligible. A failed result can be disputed and refunded through the supported synthetic operator path. This is not independent arbitration.
- **Review record:** read actual job state, accepted agreement version, verification outcome, ledger entries, disputes/evidence, and audit events. Workspace routes are views over persisted API records, not a second data source.

## Recovery and honest boundaries

- Use **Refresh / retry** after a backend error. The app does not silently replay a mutation into a new sandbox after a 401.
- Refreshing preserves the saved job id and draft while the session is valid. If the saved job is gone, the app tells you to start a new guided demo.
- If offline, the app shows a notice and does not mark the workflow complete. Reconnect, then refresh.
- The prototype does not process payments, hold custody, call external agents, run arbitrary submitted code, provide production authentication, use a blockchain, or claim real-world performance.
