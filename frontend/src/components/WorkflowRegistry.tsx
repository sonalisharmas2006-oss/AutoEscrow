"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Workspace from "./layout/Workspace";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ApiAgreement, ApiEscrow, ApiJob, ApiLedgerBalance, ApiLedgerHistory, authState, autoEscrowApi as api, formatMoney } from "@/lib/api";

type View = "dashboard" | "jobs" | "agreements" | "escrow" | "execution" | "verification" | "disputes" | "history" | "risk";
const titles: Record<View, [string, string]> = {
  dashboard: ["Your V2 workspace", "Live jobs and virtual-credit ledger records returned for the authenticated wallet."],
  jobs: ["Job registry", "Review your persisted job briefs, requirements, status and linked agreements."],
  agreements: ["Agreements", "Review backend-issued versioned terms and acceptance records."],
  escrow: ["Simulated escrow ledger", "Virtual-credit escrow records. No real money is transferred or held."],
  execution: ["Work execution", "Inspect the backend local-demo execution state and submission attempts."],
  verification: ["Verification", "Inspect deterministic backend verification results."],
  disputes: ["Dispute management", "Open the authorized dispute workflow from an eligible job."],
  history: ["Ledger history", "Read actual virtual-credit transactions. A complete per-job audit timeline is not exposed by the current API."],
  risk: ["Risk safeguards · unavailable", "No financial-risk prediction or risk score is presented as an operational guarantee."],
};
type Row = { job: ApiJob; agreement: ApiAgreement | null; escrow: ApiEscrow | null; issues: string[] };

export default function WorkflowRegistry({ view }: { view: View }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [jobTotal, setJobTotal] = useState(0);
  const [balance, setBalance] = useState<ApiLedgerBalance | null>(null);
  const [history, setHistory] = useState<ApiLedgerHistory | null>(null);
  const [ledgerError, setLedgerError] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setLedgerError("");
    try {
      const [jobsResult, agreementsResult, escrowsResult] = await Promise.all([
        api.listJobs({ limit: 100, offset: 0 }),
        api.listAgreements({ limit: 100, offset: 0 }).then((value) => ({ value, error: "" })).catch((reason) => ({ value: null, error: reason instanceof Error ? reason.message : "Agreement records could not be loaded." })),
        api.listEscrows({ limit: 100, offset: 0 }).then((value) => ({ value, error: "" })).catch((reason) => ({ value: null, error: reason instanceof Error ? reason.message : "Escrow records could not be loaded." })),
      ]);
      setJobTotal(jobsResult.total);
      const agreements = agreementsResult.value?.items ?? [];
      const escrows = escrowsResult.value?.items ?? [];
      const records = jobsResult.items.map((job): Row => {
        const agreement = agreements.find((item) => String(item.job_id) === String(job.id)) ?? null;
        const escrow = agreement ? escrows.find((item) => String(item.agreement_id) === String(agreement.id)) ?? null : null;
        return {
          job,
          agreement,
          escrow,
          issues: [agreementsResult.error ? "agreements" : "", escrowsResult.error ? "escrows" : ""].filter(Boolean),
        };
      });
      setRows(records);
      const query = new URLSearchParams(window.location.search).get("job");
      if (query) setSelected(query);

      if (view === "dashboard" || view === "escrow" || view === "history") {
        const [balanceResult, historyResult] = await Promise.allSettled([
          api.getLedgerBalance(),
          api.getLedgerTransactions({ limit: 20, offset: 0 }),
        ]);
        if (balanceResult.status === "fulfilled") setBalance(balanceResult.value);
        else setLedgerError(balanceResult.reason instanceof Error ? balanceResult.reason.message : "Ledger balance could not be loaded.");
        if (historyResult.status === "fulfilled") setHistory(historyResult.value);
        else setLedgerError((current) => [current, historyResult.reason instanceof Error ? historyResult.reason.message : "Ledger history could not be loaded."].filter(Boolean).join(" "));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load records from the V2 API.");
      setRows([]);
      setJobTotal(0);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => { void load(); }, [load, reload]);

  const visible = useMemo(() => rows.filter(({ job }) =>
    [job.title, job.id, job.status].join(" ").toLowerCase().includes(filter.toLowerCase())
  ), [rows, filter]);
  const detail = rows.find((row) => String(row.job.id) === String(selected));

  if (view === "disputes") {
    return <DisputeQueue />;
  }

  if (["execution", "verification", "risk"].includes(view)) {
    return <Workspace title={titles[view][0]} intro={titles[view][1]}>
      <section className="record-panel">
        <div className="warning-panel" role="status">
          <strong>Continue from a persisted job.</strong>
          <p>Open a saved job and continue its guided workflow to run the deterministic demo executor, inspect submission attempts and verification, or create a dispute when eligible.</p>
          <p className="mt-2 text-xs">No external autonomous agent or AI model is invoked. VCR is simulated credit with no monetary value.</p>
        </div>
        <Link href="/jobs" className="primary-button mt-4 inline-block">Open persisted jobs →</Link>
        <Link href="/demo" className="ml-4 mt-4 inline-block underline">Continue guided workflow</Link>
      </section>
    </Workspace>;
  }

  return (
    <Workspace title={titles[view][0]} intro={titles[view][1]}>
      <div className="toolbar">
        <label>Filter jobs<input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Title, job ID, or status" /></label>
        <LiquidButton type="button" onClick={() => setReload((value) => value + 1)} disabled={loading} className="px-4 py-2 text-sm">Refresh records</LiquidButton>
        <Link href="/demo">Create a job →</Link>
      </div>

      {error ? <div className="error-panel" role="alert"><h2>Live records unavailable</h2><p>{error}</p><p>Check wallet authentication and API availability. An API error is not treated as an empty account.</p><LiquidButton type="button" onClick={() => setReload((value) => value + 1)} className="mt-3 px-4 py-2 text-sm">Retry</LiquidButton><Link href="/settings" className="ml-4 underline">Wallet settings</Link></div>
        : loading ? <p role="status" className="empty-panel">Loading persisted records…</p>
          : <>
            {view === "dashboard" && <div className="workspace-stats">
              <article><span>Total jobs</span><strong>{jobTotal}</strong></article>
              <article><span>Jobs in progress</span><strong>{rows.filter((row) => row.job.status === "in_progress").length}</strong></article>
              <article><span>Completed jobs</span><strong>{rows.filter((row) => row.job.status === "completed").length}</strong></article>
              <article><span>Available VCR</span><strong>{balance ? formatMoney(balance.available, "VCR") : "Unavailable"}</strong></article>
              <article><span>Locked VCR</span><strong>{balance ? formatMoney(balance.escrow_locked, "VCR") : "Unavailable"}</strong></article>
            </div>}

            {ledgerError && (view === "dashboard" || view === "escrow" || view === "history") && <div className="warning-panel" role="status">Ledger data could not be fully loaded: {ledgerError}</div>}
            {rows.some((row) => row.issues.length > 0) && <div className="warning-panel" role="status">Some agreement or escrow collections could not be loaded: {Array.from(new Set(rows.flatMap((row) => row.issues))).join(", ")}. Failed requests are not represented as empty records.</div>}

            {view === "history" && <section className="record-panel">
              <h2>Recent virtual-credit transactions</h2>
              <p className="text-sm text-neutral-400">This is the authenticated account ledger history, not a complete per-job audit log.</p>
              {!history ? <p className="mt-3 text-sm text-neutral-500">Transaction history unavailable.</p>
                : history.items.length === 0 ? <p className="mt-3 text-sm text-neutral-500">The backend returned no transactions.</p>
                  : <div className="table-scroll mt-4"><table><thead><tr><th>Type</th><th>Description</th><th>Amount</th><th>Recorded</th></tr></thead><tbody>{history.items.map((item) => <tr key={item.id}><td>{item.kind}</td><td>{item.description}</td><td>{formatMoney(item.amount, item.currency)}</td><td>{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>}
            </section>}

            {visible.length === 0 ? <div className="empty-panel"><h2>{filter ? "No matching jobs" : "No jobs returned by the backend"}</h2><p>{filter ? "Try another search." : "Create a job after connecting your wallet. This view does not insert sample records."}</p><Link href="/demo">Start supported workflow →</Link></div>
              : <div className="registry-list">{visible.map((row) => <article key={row.job.id} className="registry-row">
                <div>
                  <p className="eyebrow">Job #{row.job.id}</p>
                  <h2><button type="button" onClick={() => { setSelected(row.job.id); window.history.replaceState(null, "", `?job=${row.job.id}`); }} className="text-left underline-offset-4 hover:underline">{row.job.title}</button></h2>
                  <p>{row.job.status} · {formatMoney(row.job.budget_amount, row.job.currency)} · due {row.job.deadline ? new Date(row.job.deadline).toLocaleString() : "Not specified"}</p>
                </div>
                <div className="row-state">
                  {view === "escrow" ? row.escrow?.status ?? "No escrow"
                    : view === "agreements" ? row.agreement?.status ?? "No agreement"
                      : row.job.status}
                  <button type="button" onClick={() => setSelected(row.job.id)} className="mt-2 block underline">View record</button>
                </div>
              </article>)}</div>}

            {selected && !detail && <p className="error-panel">That job is not present in the currently loaded backend records.</p>}
            {detail && <JobRecord row={detail} view={view} />}
          </>}
    </Workspace>
  );
}

function DisputeQueue() {
  const [openItems, setOpenItems] = useState<import("@/lib/api").ApiDispute[]>([]);
  const [resolvedItems, setResolvedItems] = useState<import("@/lib/api").ApiDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rationale, setRationale] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const user = authState.getUser();
  const canResolve = ["ADMIN", "ARBITRATOR", "admin", "arbitrator"].includes(user?.role ?? "");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const [open, resolved] = await Promise.all([
        api.listDisputes("open"),
        api.listDisputes("resolved"),
      ]);
      setOpenItems(open);
      setResolvedItems(resolved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load dispute records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  async function resolve(id: string | number, resolution: "release" | "refund") {
    const note = rationale[String(id)] ?? "";
    if (note.trim().length < 10) {
      setError("Resolution note must contain at least 10 characters.");
      return;
    }
    if (!window.confirm(`Resolve dispute #${id} with the ${resolution} decision? This records the dispute decision but does not itself settle escrow.`)) return;
    setBusy(String(id));
    setError("");
    setMessage("");
    try {
      const result = await api.resolveDispute(id, resolution, note);
      setMessage(`Dispute #${result.id} was marked ${result.status} by the backend. This decision does not itself settle the escrow ledger.`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dispute resolution failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Workspace title="Dispute management queue" intro="Open and resolved dispute records returned by the production API. Resolution is available only to authorized ADMIN/ARBITRATOR accounts.">
      <section className="record-panel">
        <div className="toolbar">
          <span>{openItems.length} open · {resolvedItems.length} resolved</span>
          <LiquidButton type="button" onClick={() => void refresh()} disabled={loading} className="px-4 py-2 text-sm">Refresh queue</LiquidButton>
        </div>
        {loading && <p role="status" className="empty-panel">Loading dispute records…</p>}
        {error && <div role="alert" className="error-panel">{error}</div>}
        {message && <div role="status" className="warning-panel">{message}</div>}
        {!loading && openItems.length === 0 && <p className="empty-panel">No open disputes were returned.</p>}
        {openItems.map((item) => (
          <article key={item.id} className="registry-row">
            <div className="min-w-0">
              <strong>Dispute #{item.id} · {item.status}</strong>
              <p>{item.category} · {item.reason}</p>
              <p>{item.description}</p>
              <p className="text-xs text-neutral-500">Job #{item.job_id} · Escrow #{item.escrow_id ?? "—"}</p>
              {canResolve ? <>
                <label className="mt-3 block">Resolution note (at least 10 characters)
                  <textarea rows={3} value={rationale[String(item.id)] ?? ""} onChange={(event) => setRationale((old) => ({ ...old, [String(item.id)]: event.target.value }))} />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <LiquidButton type="button" disabled={busy !== null || (rationale[String(item.id)] ?? "").trim().length < 10} onClick={() => void resolve(item.id, "release")} className="px-3 py-2">Resolve: release</LiquidButton>
                  <LiquidButton type="button" disabled={busy !== null || (rationale[String(item.id)] ?? "").trim().length < 10} onClick={() => void resolve(item.id, "refund")} className="px-3 py-2">Resolve: refund</LiquidButton>
                </div>
              </> : <p className="mt-3 text-xs text-amber-200">Read-only: sign in with an authorized ADMIN or ARBITRATOR account to resolve disputes.</p>}
            </div>
          </article>
        ))}
        <div className="mt-8 border-t border-white/10 pt-6">
          <h2 className="font-semibold">Resolved disputes</h2>
          {resolvedItems.length === 0 ? <p className="mt-3 text-sm text-neutral-500">No resolved disputes were returned.</p> : resolvedItems.map((item) => (
            <article key={item.id} className="registry-row">
              <div className="min-w-0">
                <strong>Dispute #{item.id} · {item.status}</strong>
                <p>{item.category} · {item.reason}</p>
                <p className="text-xs text-neutral-500">Job #{item.job_id} · Escrow #{item.escrow_id ?? "—"} · Resolution: {item.resolution ?? "Not supplied"}</p>
                {item.resolution_rationale && <p className="mt-1 text-xs text-neutral-400">Resolution note: {item.resolution_rationale}</p>}
                <p className="mt-1 text-xs text-neutral-500">A dispute decision is not an escrow settlement confirmation. Check the escrow status separately.</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Workspace>
  );
}

function JobRecord({ row, view }: { row: Row; view: View }) {
  const { job, agreement, escrow } = row;
  return <section className="record-panel">
    <h2>{job.title}</h2>
    <p>{job.description}</p>
    <h3>Job requirements</h3>
    <p>Category: {job.category || "Not specified"}</p>
    <p>Required skills: {(job.required_skills ?? []).join(", ") || "None specified"}</p>
    <p>Required capabilities: {(job.required_capabilities ?? []).join(", ") || "None specified"}</p>
    <p>Expected deliverables: {(job.expected_deliverables ?? []).join(", ") || "Not supplied"}</p>
    {["jobs", "agreements", "dashboard"].includes(view) && <>
      <h3>Agreement</h3>
      {agreement ? <>
        <p>#{agreement.id} · {agreement.status} · version {agreement.current_version_number ?? agreement.proposal_version ?? 1}</p>
        <p>Accepted version: {agreement.accepted_version ?? "Not accepted"}</p>
        <p>Acceptance records: {(agreement.acceptances ?? []).length || "Not supplied by this backend contract"}</p>
        <pre>{JSON.stringify(agreement.current_version?.terms ?? agreement.terms ?? {}, null, 2)}</pre>
        <details><summary>Version history</summary><pre>{JSON.stringify(agreement.versions ?? [], null, 2)}</pre></details>
      </> : <p>No agreement has been returned for this job.</p>}
    </>}
    {["jobs", "escrow", "dashboard"].includes(view) && <>
      <h3>Simulated escrow</h3>
      {escrow ? <p>Escrow #{escrow.id} · {escrow.status} · {formatMoney(escrow.amount, escrow.currency)}</p>
        : <p>No escrow record has been returned for this job. Creation and funding require an accepted agreement.</p>}
    </>}
    {["jobs", "history", "dashboard"].includes(view) && <p className="mt-4 text-xs text-neutral-500">The current backend does not expose a per-job audit-event endpoint. Use the Ledger History page to review actual VCR transactions.</p>}
  </section>;
}
