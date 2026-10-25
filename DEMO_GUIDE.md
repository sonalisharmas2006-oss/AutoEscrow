# Auto Escrow judge demo

## Before the presentation

- Use a fresh browser profile or choose **Reset sandbox**. The guided prototype acquires a short-lived scoped sandbox automatically.
- If the hosted demo is code-gated, enter the presenter code in the explicit admission dialog. The code is not a frontend environment variable and should not be written into slides or repository files.
- Keep the synthetic boundary visible: agents, jobs, submissions, verification, balances, and performance metadata are demo records. Escrow is a database ledger; no real payment, custody, blockchain, or external agent execution occurs.
- If the backend is cold or unavailable, wait for readiness and use the visible retry. Never narrate an empty/error state as a successful record.

## 2–3 minute passing script

1. Open the homepage and say: “Auto Escrow makes the trust transitions around AI-agent work visible: the brief, match, agreement, simulated escrow, verification, and record.”
2. Click **Try the guided demo**. Point out the synthetic-data and simulated-escrow disclosure.
3. **Discover:** choose **Synthetic Beacon** or another available profile. Explain that capabilities, availability, and output formats come from the backend registry—not an invented live rating.
4. **Define the job:** keep the prefilled brief or adjust the title, skills, deadline, budget, and acceptance criteria. Click **Create job and continue**. Mention that the deadline and criteria are saved in the browser draft until the API creates the job.
5. **Compare matches:** click **Compute matches**. Show matched skills, warnings, score factors, and excluded agents. Click **Persist selected agent**; the backend rechecks eligibility.
6. **Accept terms:** create the agreement, expand “What acceptance changes,” then accept the proposal. Say: “The accepted version is now immutable for this task.” If time permits, demonstrate revision before acceptance; the proposal becomes version 2, and the accepted amount follows that version.
7. **Fund escrow:** confirm the simulated funding action. Show the amount and explain that it writes a fixed-point ledger record, not a payment. Mention the stable idempotency key.
8. **Submit work:** choose the passing sample and submit it. Say: “The API stores a submission version and evidence metadata; it never executes submitted code.”
9. **Verify:** run deterministic verification. Show the individual checks and passed result. Explain that subjective/manual-review criteria would not authorize normal release here.
10. **Resolve:** click **Release eligible simulated funds** and confirm. Explain that the button is available only after the backend reports settlement-ready state.
11. **Review:** point to the persisted ledger and audit timeline. Say: “The important result is not a fake dashboard number; it is a readable record of why settlement happened.” Open the workspace record if useful.

## Optional failure / refund branch

1. Reset the sandbox or choose **Try another job** so the passing record remains available.
2. Submit the **failing sample** and run verification.
3. Show **Settlement blocked**. There should be no normal release action.
4. Open the dispute with evidence, review it, and refund the simulated balance through the explicitly limited synthetic operator path.
5. Point out the failed verification, `escrow.refunded` ledger event, dispute rationale, and audit events. Say: “The demo operator path is not independent arbitration.”

## Optional revision / retry branch

- Before acceptance, open **Revise, reject, or cancel the proposal**, save a new budget/criteria version, and accept version 2. Funding must use the accepted version's amount.
- After a failed verification, submit a corrected synthetic output while the backend retry limit permits it. Previous submissions remain in history; once the limit is exhausted, the execution state reports blocked and the dispute path remains available.

## Recovery language

- **Backend error:** “This step needs attention; the request did not create a fake record. I can retry or reset.”
- **Expired/reset session:** “The old capability is no longer valid. Starting a new session does not restore expired work.”
- **Offline:** “The browser has not marked this complete; reconnect, then refresh.”
- **Manual review:** “The deterministic verifier cannot make a subjective decision, so normal release remains blocked.”
