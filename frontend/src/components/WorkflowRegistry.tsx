"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Workspace from "./layout/Workspace";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import {
  ApiAgreement,
  ApiDispute,
  ApiEscrow,
  ApiExecution,
  ApiJob,
  ApiJobEvent,
  ApiVerification,
  autoEscrowApi as api,
  formatMoney,
} from "@/lib/api";

type View = "dashboard" | "jobs" | "agreements" | "escrow" | "execution" | "verification" | "disputes" | "history" | "risk";

const titles: Record<View, [string, string]> = {
  dashboard: ["Your V2 workspace", "Only records belonging to the active wallet session and connected backend data appear here."],
  jobs: ["Job registry", "A clear brief, recorded status, and a next step for every task."],
  agreements: ["Agreements", "Read the proposal history and accepted terms. Acceptance freezes the version before funding."],
  escrow: ["Simulated escrow ledger", "Funding and settlement entries are persisted accounting records, not real money transfers."],
  execution: ["Execution & submissions", "Workflow state is sourced from the backend; unsupported execution features remain clearly marked as coming soon."],
  verification: ["Verification results", "See each check and its explanation. Failed and manual-review results block normal release."],
  disputes: ["Disputes & evidence", "Read evidence, status, rationale, and the recorded backend resolution. This is not independent arbitration."],
  history: ["Audit history", "A readable record of persisted actions. No reputation tokens or blockchain claims."],
  risk: ["Workflow safeguards", "Inspect real job states. Matching scores are not probabilities, and there is no financial-risk prediction."],
};

type Row = {
  job: ApiJob;
  agreement: ApiAgreement | null;
  escrow: ApiEscrow | null;
  execution: ApiExecution | null;
  verification: ApiVerification | null;
  disputes: ApiDispute[];
  events: ApiJobEvent[];
  detailIssues: string[];
};

export default function WorkflowRegistry({ view }: { view: View }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<number | string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Read-only workspace pages may show local seeded records without
      // creating a new sandbox. Existing credentials are still attached.
      const jobs = await api.listJobs({}, { session: "optional" });
      const jobItems = Array.isArray(jobs?.items) ? jobs.items : Array.isArray(jobs) ? jobs : [];
      const results = await Promise.all(jobItems.map(async (job): Promise<Row> => {
        const detailRequests = await Promise.allSettled([
          api.getAgreementForJob(job.id, { session: "optional" }),
          api.getEscrowForJob(job.id, { session: "optional" }),
          api.getExecution(job.id, { session: "optional" }),
          api.getVerification(job.id, { session: "optional" }),
          api.getJobDisputes(job.id, undefined, { session: "optional" }),
          api.getJobEvents(job.id, { session: "optional" }),
        ]);
        const labels = ["agreement", "escrow", "execution", "verification", "disputes", "audit"];
        const value = <T,>(index: number, fallback: T): T => {
          const result = detailRequests[index];
          return result.status === "fulfilled" ? result.value as T : fallback;
        };
        return {
          job,
          agreement: value<ApiAgreement | null>(0, null),
          escrow: value<ApiEscrow | null>(1, null),
          execution: value<ApiExecution | null>(2, null),
          verification: value<ApiVerification | null>(3, null),
          disputes: value<ApiDispute[]>(4, []),
          events: value<ApiJobEvent[]>(5, []),
          detailIssues: detailRequests.flatMap((result, index) => result.status === "rejected" ? [labels[index]] : []),
        };
      }));
      setRows(results);
      const query = Number(new URLSearchParams(window.location.search).get("job"));
      if (query) setSelected(query);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "API unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = rows.filter((row) => {
    const job = row?.job ?? {};
    const title = typeof job.title === "string" ? job.title : "";
    const publicId = typeof job.public_id === "string" ? job.public_id : "";
    const status = typeof job.status === "string" ? job.status : "";
    const escrowStatus = typeof row?.escrow?.status === "string" ? row.escrow.status : "";
    return `${title} ${publicId} ${status} ${escrowStatus}`.toLowerCase().includes(filter.toLowerCase());
  });
  const detail = rows.find((row) => row.job.id === selected);

  return (
    <Workspace title={titles[view][0]} intro={titles[view][1]}>
      <div className="toolbar">
        <label>Filter your jobs<input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Title, job id, or status" /></label>
        <LiquidButton type="button" onClick={() => void load()} disabled={loading} className="px-4 py-2 text-sm">Refresh records</LiquidButton>
        <Link href="/demo/?new=1">Create another job →</Link>
      </div>
      {error ? <div className="error-panel" role="alert"><h2>Records could not be refreshed</h2><p>{error}</p>{/session|wallet|connect/i.test(error) ? <Link href="/settings">Connect wallet →</Link> : null}<LiquidButton type="button" onClick={() => void load()} className="px-4 py-2 text-sm">Retry</LiquidButton></div> : loading ? <p role="status" className="empty-panel">Loading persisted records…</p> : <>
        {view === "dashboard" && <div className="workspace-stats"><article><span>Your jobs</span><strong>{rows.length}</strong></article><article><span>Verified jobs</span><strong>{rows.filter((row) => row.verification?.overall_result === "passed").length}</strong></article><article><span>Unresolved disputes</span><strong>{rows.reduce((sum, row) => sum + (Array.isArray(row.disputes) ? row.disputes.filter((item) => ["open", "under_review"].includes(item.status)).length : 0), 0)}</strong></article></div>}
        {rows.some((row) => row.detailIssues.length > 0) && <div className="warning-panel" role="status">Some optional workflow details could not be loaded. The job list remains live; use Refresh records to retry.</div>}
        {visible.length === 0 ? <div className="empty-panel"><h2>{filter ? "No matching jobs" : "No live jobs yet"}</h2><p>{filter ? "Clear or change the filter." : "Connect your wallet, then create or discover a job through the V2 workflow."}</p><Link href="/marketplace">Browse marketplace →</Link></div> : <div className="registry-list">{visible.map((row) => <article key={row.job.id} className="registry-row"><div><p className="eyebrow">{typeof row.job.public_id === "string" ? row.job.public_id.slice(0, 20) : String(row.job.id)}…</p><h2><LiquidButton type="button" onClick={() => { setSelected(row.job.id); window.history.replaceState(null, "", `?job=${row.job.id}`); }} className="text-left px-1 py-1" contentClassName="justify-start">{row.job.title || "Untitled job"}</LiquidButton></h2><p>{row.job.status || "Pending"} · {formatMoney(row.job.budget ?? 0, row.job.currency || "VCR")} · due {row.job.deadline ? new Date(row.job.deadline).toLocaleString() : "No deadline"}</p></div><div className="row-state">{view === "escrow" ? row.escrow?.status || "Not funded" : view === "agreements" ? row.agreement?.status || "Not proposed" : view === "verification" ? row.verification?.overall_result || "Not verified" : view === "disputes" ? (Array.isArray(row.disputes) && row.disputes[0]?.status) || "No dispute" : row.execution?.execution_status || "Not started"}<Link href={`/marketplace`}>Open marketplace →</Link></div></article>)}</div>}
        {selected && !detail && <p className="error-panel">That job is not available in the current view.</p>}
        {detail && <JobRecord row={detail} view={view} />}
      </>}
    </Workspace>
  );
}

function JobRecord({ row, view }: { row: Row; view: View }) {
  const { job, agreement, escrow, verification, disputes, events, execution } = row;
  const safeSkills = Array.isArray(job?.required_skills) ? job.required_skills : [];
  const safeAcceptanceCriteria = Array.isArray(job?.acceptance_criteria) ? job.acceptance_criteria : [];
  const safeLedgerEntries = Array.isArray(escrow?.ledger_entries) ? escrow.ledger_entries : [];
  const safeChecks = Array.isArray(verification?.individual_checks) ? verification.individual_checks : [];
  const safeDisputes = Array.isArray(disputes) ? disputes : [];
  const safeEvents = Array.isArray(events) ? events : [];

  return <section className="record-panel"><h2>{job.title || "Untitled job"}: {titles[view][0]}</h2><p>{job.description || "No description available."}</p>
    <h3>Requirements</h3><p>Skills: {safeSkills.join(", ") || "None specified"}</p><p>Deliverable: {job.expected_output || "Not specified"}</p><ul>{safeAcceptanceCriteria.length ? safeAcceptanceCriteria.map((criterion, index) => <li key={index}>{criterion}</li>) : <li>No acceptance criteria were provided.</li>}</ul>
    {["jobs", "agreements", "dashboard"].includes(view) && <><h3>Agreement {agreement ? `v${agreement.proposal_version} · ${agreement.status}` : "not yet proposed"}</h3>{agreement && <><p>Accepted version: {agreement.accepted_version || "Not accepted"} · {formatMoney(agreement.amount, agreement.currency)}</p><p>{String((agreement.terms && typeof agreement.terms === "object" ? agreement.terms.scope : "") || "")}</p><details><summary>Full terms and revision history</summary><pre>{JSON.stringify({ terms: agreement.terms, history: agreement.proposal_history }, null, 2)}</pre></details></>}</>}
    {["jobs", "escrow", "dashboard"].includes(view) && <><h3>Simulated ledger</h3>{escrow ? <><p>Escrow #{escrow.id} · {escrow.status} · accepted {formatMoney(escrow.accepted_amount, escrow.currency)}</p><div className="table-scroll"><table><thead><tr><th>Entry</th><th>Amount</th><th>Recorded</th><th>Reference</th></tr></thead><tbody>{safeLedgerEntries.length ? safeLedgerEntries.map((entry) => <tr key={entry.id}><td>{entry.entry_type}</td><td>{formatMoney(entry.amount, entry.currency)}</td><td>{new Date(entry.occurred_at).toLocaleString()}</td><td>{entry.reference || "—"}</td></tr>) : <tr><td colSpan={4}>No ledger entries have been recorded yet.</td></tr>}</tbody></table></div></> : <p>Not funded. Accept an agreement first.</p>}</>}
    {["jobs", "verification", "execution", "risk"].includes(view) && <><h3>Execution eligibility</h3><p>{execution?.execution_status || "Unavailable"}</p><p>{execution?.start_reason || "Execution details are unavailable."}</p><p>{execution?.submit_reason || ""}</p><p>{execution?.verify_reason || ""}</p><h3>Verification: {verification?.overall_result || "not run"}</h3>{verification && <>{verification.overall_result !== "passed" && <p className="error-panel">Normal settlement remains blocked.</p>}<ul>{safeChecks.length ? safeChecks.map((check, index) => <li key={index}><strong>{String(check.status)}: {String(check.name)}</strong> — {String(check.explanation)}</li>) : <li>No verification checks were returned for this job.</li>}</ul></>}</>}
    {["jobs", "disputes"].includes(view) && <><h3>Disputes</h3>{safeDisputes.length ? safeDisputes.map((dispute) => <article key={dispute.id}><h4>#{dispute.id} · {dispute.status}</h4><p>{dispute.reason}</p><p>{dispute.description}</p><p>Resolution: {dispute.resolution || "Pending"} · {dispute.resolution_rationale}</p><details><summary>Stored evidence and frozen agreement</summary><pre>{JSON.stringify({ evidence: dispute.evidence, terms: dispute.agreement_terms }, null, 2)}</pre></details></article>) : <p>No dispute has been opened.</p>}</>}
    <h3>Persisted timeline</h3><ol className="record-timeline">{safeEvents.length ? safeEvents.map((event) => <li key={event.id}><strong>{event.event_type.replaceAll(".", " ").replaceAll("_", " ")}</strong><time>{new Date(event.created_at).toLocaleString()}</time><details><summary>Event details</summary><pre>{JSON.stringify(event.data, null, 2)}</pre></details></li>) : <li>No audit events have been recorded yet.</li>}</ol>
  </section>;
}
