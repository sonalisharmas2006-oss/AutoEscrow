"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ApiAgreement, ApiEscrow, ApiJob, ApiMatchCandidate, ApiMatchRun, ApiSubmission, authState, autoEscrowApi as api, formatMoney, isAgreementFullyAccepted } from "@/lib/api";

const steps = ["Define job", "Match agents", "Select agent", "Accept agreement", "Fund simulated escrow", "Run demo execution", "Submit & verify"]
const futureDate = () => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
const splitLines = (value: string) => value.split("\n").map((item) => item.trim()).filter(Boolean);
const splitTags = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

export default function GuidedWorkflowPage() {
  const [step, setStep] = useState(0);
  const [job, setJob] = useState<ApiJob | null>(null);
  const [matches, setMatches] = useState<ApiMatchRun | null>(null);
  const [selected, setSelected] = useState<ApiMatchCandidate | null>(null);
  const [agreement, setAgreement] = useState<ApiAgreement | null>(null);
  const [escrow, setEscrow] = useState<ApiEscrow | null>(null);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [disputeReason, setDisputeReason] = useState("");
  const [demoResult, setDemoResult] = useState<Record<string, unknown> | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "development",
    skills: "python, typescript",
    capabilities: "code_review",
    deliverables: "Code review report",
    criteria: "Identify correctness issues\nFlag security concerns\nSuggest maintainability improvements",
    responsibilities: "Requester provides the brief and timely feedback.\nAgent owner supplies the agreed deliverable.",
    budget: "25.00",
    deadline: futureDate(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const available = useMemo(() => matches?.matches ?? [], [matches]);

  useEffect(() => {
    setAuthenticated(Boolean(authState.getAccessToken()));
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The API request failed. No local success state was recorded.");
    } finally {
      setBusy(false);
    }
  }

  async function createJob() {
    if (!authenticated) {
      setError("Connect your wallet in Session Settings before creating a job.");
      return;
    }
    await run(async () => {
      const created = await api.createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        required_skills: splitTags(form.skills),
        required_capabilities: splitTags(form.capabilities),
        budget_amount: form.budget,
        currency: "VCR",
        deadline: new Date(form.deadline).toISOString(),
        expected_deliverables: splitLines(form.deliverables),
        status: "open",
        visibility: "public",
      });
      setJob(created);
      setStep(1);
      setNotice("Job saved by the backend.");
    });
  }

  async function computeMatches() {
    if (!job) return;
    await run(async () => {
      const result = await api.computeMatches(job.id);
      setMatches(result);
      setSelected(null);
      setStep(2);
      setNotice("Explainable match results loaded from the backend.");
    });
  }

  async function chooseAgent() {
    if (!job || !selected) return;
    await run(async () => {
      const proposal = await api.createAgreement({
        job_id: String(job.id),
        agent_id: String(selected.agent_id),
        terms: {
          scope: job.description,
          deliverables: splitLines(form.deliverables),
          budget_amount: form.budget,
          currency: "VCR",
          deadline: new Date(form.deadline).toISOString(),
          responsibilities: splitLines(form.responsibilities),
          acceptance_conditions: splitLines(form.criteria),
        },
      });
      setAgreement(proposal);
      setStep(3);
      setNotice("Versioned agreement proposal saved by the backend. Review the terms before accepting.");
    });
  }

  async function accept() {
    if (!agreement) return;
    if (!window.confirm("Accept this versioned agreement? The acceptance will be recorded by the backend.")) return;
    await run(async () => {
      const version = agreement.current_version_number ?? agreement.proposal_version ?? 1;
      await api.acceptAgreement(agreement.id, version);
      const latest = await api.getAgreement(agreement.id);
      setAgreement(latest);
      if (isAgreementFullyAccepted(latest) && (latest.accepted_version ?? latest.current_version_number) === version) {
        setStep(4);
        setNotice("The backend confirms this agreement version is fully accepted. Simulated escrow funding is now available.");
      } else {
        setStep(3);
        setNotice("Your acceptance request was recorded, but the backend has not confirmed both parties' acceptance. Funding remains blocked.");
      }
    });
  }

  async function fund() {
    if (!job || !agreement) return;
    if (!isAgreementFullyAccepted(agreement)) {
      setError("Escrow funding requires backend-confirmed acceptance of the current agreement version by both parties.");
      return;
    }
    if (!window.confirm("Create and fund this simulated VCR escrow? No real money will move.")) return;
    await run(async () => {
      const existingEscrow = await api.getEscrowForAgreement(agreement.id);
      const createdEscrow = existingEscrow ?? await api.createEscrow(agreement.id);
      const alreadyFunded = ["funded", "held", "active"].includes(String(createdEscrow.status).toLowerCase());
      const fundedEscrow = alreadyFunded ? createdEscrow : await api.fundEscrow(createdEscrow.id, {
        idempotency_key: `autoescrow:escrow:${createdEscrow.id}:fund:v1`,
      });
      const listed = await api.listEscrows({ limit: 100, offset: 0 });
      const persistedEscrow = listed.items.find((item) => String(item.agreement_id) === String(agreement.id)) ?? await api.getEscrow(fundedEscrow.id);
      setEscrow(persistedEscrow);
      const [latestJob, latestAgreement, latestSubmissions] = await Promise.all([
        api.getJob(job.id),
        api.getAgreementForJob(job.id),
        api.getEscrowSubmissions(persistedEscrow.id),
      ]);
      setJob(latestJob);
      if (latestAgreement) setAgreement(latestAgreement);
      setSubmissions(latestSubmissions);
      if (["funded", "held", "active"].includes(String(persistedEscrow.status).toLowerCase())) {
        setStep(5);
        setNotice("The backend confirms the simulated VCR escrow is funded. No real funds moved.");
      } else {
        setStep(4);
        setNotice(`Escrow was created, but its current backend status is ${persistedEscrow.status}. The workflow has not marked funding complete.`);
      }
    });
  }

  async function refresh() {
    if (!job) return;
    await run(async () => {
      const [latestJob, latestAgreement, latestEscrow] = await Promise.all([
        api.getJob(job.id),
        api.getAgreementForJob(job.id),
        api.getEscrowForJob(job.id),
      ]);
      const latestSubmissions = latestEscrow ? await api.getEscrowSubmissions(latestEscrow.id) : [];
      setJob(latestJob);
      if (latestAgreement) setAgreement(latestAgreement);
      setEscrow(latestEscrow);
      setSubmissions(latestSubmissions);
      if (latestSubmissions.length) setStep(6);
      else if (latestEscrow && ["funded", "held", "active"].includes(String(latestEscrow.status).toLowerCase())) setStep(5);
      else if (latestAgreement && ["accepted", "active"].includes(String(latestAgreement.status).toLowerCase())) setStep(4);
      else if (latestAgreement) setStep(3);
      else setStep(1);
    });
  }

  return (
    <main className="min-h-screen bg-transparent px-5 pb-32 pt-14 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Supported V2 workflow · job, matching, agreement and ledger</p>
          <h1 className="mt-3 text-4xl font-bold">Guided Job Setup</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
            Create a backend job, match an agent, accept the agreement, fund simulated VCR escrow, then use the deterministic demo executor and backend verification.
          </p>
        </header>

        <div className="mb-7 grid gap-2 sm:grid-cols-7" aria-label="Workflow progress">
          {steps.map((label, index) => (
            <div key={label} aria-current={index === step ? "step" : undefined} className={`rounded-xl border p-3 text-xs ${index < step ? "border-white/25 bg-white/10" : index === step ? "border-white/35 bg-white/[0.08]" : "border-white/10 bg-white/[0.025]"}`}>
              <p className="text-neutral-500">STEP 0{index + 1}</p>
              <p className="mt-1 font-semibold text-white">{label}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-neutral-500">{index < step ? "Completed" : index === step ? "Current" : "Pending"}</p>
              {index < step && <CheckCircle2 size={14} className="mt-2" />}
            </div>
          ))}
        </div>

        {!authenticated && (
          <section className="mb-5 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold"><LockKeyhole size={16} /> Wallet sign-in required</div>
            <p className="mt-2">Connect MetaMask and sign the backend&apos;s one-time Sepolia challenge before creating or changing job records.</p>
            <Link href="/settings" className="mt-3 inline-block underline">Open wallet settings →</Link>
          </section>
        )}
        {error && <div role="alert" className="mb-5 rounded-xl border border-red-400/30 bg-red-400/[0.06] p-4 text-sm text-red-200">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-xl border border-white/15 bg-white/[0.05] p-4 text-sm text-neutral-200">{notice}</div>}

        {step === 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Define your job</h2>
            <p className="mt-1 text-sm text-neutral-400">All fields map to the backend job contract. Budget is measured in simulated VCR credits only.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Job title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
              <label className="block text-sm text-neutral-300">Task category
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white">
                  {["development", "design", "writing", "data", "marketing", "research", "operations", "other"].map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <Field label="Required skills (comma separated)" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
              <Field label="Required capabilities (comma separated)" value={form.capabilities} onChange={(capabilities) => setForm({ ...form, capabilities })} />
              <Field label="Budget (VCR)" value={form.budget} onChange={(budget) => setForm({ ...form, budget })} type="number" />
              <Field label="Deadline" value={form.deadline} onChange={(deadline) => setForm({ ...form, deadline })} type="datetime-local" />
            </div>
            <TextArea label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} rows={4} />
            <TextArea label="Expected deliverables (one per line)" value={form.deliverables} onChange={(deliverables) => setForm({ ...form, deliverables })} rows={2} />
            <TextArea label="Acceptance conditions (one per line)" value={form.criteria} onChange={(criteria) => setForm({ ...form, criteria })} rows={3} />
            <TextArea label="Responsibilities (one per line)" value={form.responsibilities} onChange={(responsibilities) => setForm({ ...form, responsibilities })} rows={2} />
            <Action onClick={() => void createJob()} disabled={busy || !authenticated || form.title.trim().length < 3 || !form.description.trim() || splitTags(form.skills).length === 0 || splitTags(form.capabilities).length === 0 || splitLines(form.deliverables).length === 0 || splitLines(form.criteria).length === 0 || splitLines(form.responsibilities).length === 0 || !form.deadline}>
              Create job and continue <ArrowRight size={16} />
            </Action>
          </section>
        )}

        {step >= 1 && job && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">Persisted job #{job.id}</p>
                <h2 className="mt-2 text-2xl font-semibold">{job.title}</h2>
                <p className="mt-2 text-sm text-neutral-400">{job.status} · {formatMoney(job.budget_amount, job.currency)}</p>
              </div>
              <LiquidButton type="button" onClick={() => void refresh()} disabled={busy} className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-xs"><RefreshCw size={14} /> Refresh backend record</LiquidButton>
            </div>

            {step === 1 && <div className="mt-6"><h3 className="font-semibold">Find eligible agents</h3><p className="mt-1 text-sm text-neutral-400">Matching is computed by the authenticated backend using the persisted job requirements.</p><Action onClick={() => void computeMatches()} disabled={busy}>Compute matches <ArrowRight size={16} /></Action></div>}

            {step >= 2 && (
              <div className="mt-6">
                <h3 className="font-semibold">Matching results</h3>
                <p className="mt-1 text-xs text-neutral-500">Scores, component weights and explanations are returned by the backend.</p>
                {matches?.weights && <p className="mt-2 text-[11px] text-neutral-500">Scoring weights: {Object.entries(matches.weights).map(([key, value]) => `${key} ${value}`).join(" · ")}</p>}
                {available.length === 0 ? <div className="mt-4 rounded-xl border border-white/10 p-4 text-sm text-neutral-400"><p>The backend returned no matching agents for this job.</p><p className="mt-1 text-xs text-neutral-500">Try adjusting the required skills, capabilities or VCR budget, then compute matches again.</p><Action onClick={() => void computeMatches()} disabled={busy}>Retry matching <RefreshCw size={14}/></Action></div> : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {available.map((candidate) => (
                      <button type="button" key={candidate.agent_id} onClick={() => setSelected(candidate)} className={`rounded-xl border p-4 text-left ${selected?.agent_id === candidate.agent_id ? "border-white/50 bg-white/10" : "border-white/10 bg-black/20"}`}>
                        <div className="flex justify-between gap-3"><strong>{candidate.agent?.name ?? candidate.agent_name}</strong><span className="text-sm tabular-nums">{candidate.score.toFixed(2)}</span></div>
                        <p className="mt-2 text-xs text-neutral-400">Listed skills: {candidate.agent?.skills?.join(", ") || "Not supplied"}</p>
                        <ul className="mt-2 space-y-1">{candidate.reasons.map((reason, index) => <li key={index} className="text-[11px] text-neutral-500">{String(reason.component ?? "Match factor")}: {String(reason.explanation ?? JSON.stringify(reason))}</li>)}</ul>
                      </button>
                    ))}
                  </div>
                )}
                {step === 2 && <Action onClick={() => void chooseAgent()} disabled={busy || !selected}>Create agreement with selected agent <ArrowRight size={16} /></Action>}
              </div>
            )}

            {step >= 3 && agreement && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-semibold">Agreement #{agreement.id}</h3>
                <p className="mt-1 text-sm text-neutral-400">Proposal version {agreement.proposal_version ?? agreement.current_version_number ?? 1} · {agreement.status} · {formatMoney(agreement.proposed_budget ?? agreement.amount, agreement.currency ?? "VCR")}</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-neutral-300">{JSON.stringify(agreement.terms ?? agreement.current_version?.terms ?? {}, null, 2)}</pre>
                {step === 3 && (
                  <div className="mt-4">
                    {isAgreementFullyAccepted(agreement)
                      ? <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-sm text-amber-100">The backend confirms this agreement is accepted. You can proceed to simulated escrow funding.</p>
                      : <><p className="mb-3 rounded-lg border border-white/10 p-3 text-xs text-neutral-400">Funding stays locked until the backend confirms acceptance of the current version by both parties.</p><Action onClick={() => void accept()} disabled={busy}>Accept agreement version {agreement.current_version_number ?? 1} <ShieldCheck size={16} /></Action></>}
                  </div>
                )}
              </div>
            )}

            {step >= 4 && agreement && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-semibold">Accepted agreement</h3>
                <p className="mt-1 text-sm text-neutral-400">Version {agreement.current_version_number} · {agreement.status}</p>
                <p className="mt-2 text-xs text-neutral-500">Accepted version: {agreement.accepted_version ?? "Not accepted"} · Acceptance records: {agreement.acceptances?.length ?? 0}</p>
                {step === 4 && <Action onClick={() => void fund()} disabled={busy}>Create and fund simulated escrow <LockKeyhole size={16} /></Action>}
              </div>
            )}

            {step >= 5 && escrow && (
              <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-xl font-semibold">Escrow work execution</h3>
                <p className="mt-2 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-sm text-amber-100">Deterministic Demo Execution — Sample Output. This executor produces sample output only; it does not invoke a real autonomous agent or external AI model.</p>
                <Action onClick={() => void run(async () => {
                  const result = await api.demoExecuteEscrow(escrow.id);
                  setDemoResult(result);
                  const record = result.submission && typeof result.submission === "object"
                    ? result.submission as Record<string, unknown>
                    : result;
                  const summary = typeof record.summary === "string" ? record.summary : "";
                  const deliverables = Array.isArray(record.deliverables)
                    ? record.deliverables.filter((value): value is string => typeof value === "string")
                    : [];
                  const executor = typeof record.executor === "string" ? record.executor : "deterministic_demo_adapter";
                  if (summary.trim() && deliverables.length > 0) {
                    await api.createEscrowSubmission(escrow.id, { summary, deliverables, executor });
                  }
                  const latest = await api.getEscrowSubmissions(escrow.id);
                  setSubmissions(latest);
                  if (latest.length) setStep(6);
                  setNotice(summary.trim() && deliverables.length
                    ? `Demo adapter output was submitted; ${latest.length} persisted submission record(s) loaded.`
                    : "Demo adapter returned its response, but it did not contain submission-ready summary and deliverables. No submission data was fabricated.");
                })} disabled={busy}>Run deterministic demo adapter</Action>
                {demoResult && <pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 p-4 text-xs text-neutral-300">{JSON.stringify(demoResult,null,2)}</pre>}
                <div className="mt-6">
                  <h4 className="font-semibold">Deliverables & submission history</h4>
                  {submissions.length===0 ? <p className="mt-2 text-sm text-neutral-500">No submissions have been recorded.</p> : submissions.map(item=><article key={item.id} className="mt-3 rounded-xl border border-white/10 p-4">
                    <div className="flex flex-wrap justify-between gap-2"><strong>Attempt {item.attempt ?? item.version ?? "—"} · Submission #{item.id}</strong><span className="text-xs uppercase">{item.status}</span></div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">{item.summary}</p>
                    {item.deliverables?.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs text-neutral-400">{item.deliverables.map((deliverable, index) => <li key={index}>{deliverable}</li>)}</ul>}
                    <p className="mt-2 text-xs text-neutral-500">Executor: {item.executor} · {item.created_at}</p>
                    {item.review_note && <p className="mt-2 text-xs text-neutral-400">Review note: {item.review_note}</p>}
                    {item.status==="submitted" && String(authState.getUser()?.id) === String(escrow.buyer_user_id) && <div className="mt-4">
                      <TextArea label="Buyer review note" value={reviewNote} onChange={setReviewNote} rows={2}/>
                      <div className="flex flex-wrap gap-2">
                        <Action onClick={() => void run(async () => {
                          await api.reviewSubmission(item.id,"approve",reviewNote);
                          setSubmissions(await api.getEscrowSubmissions(escrow.id));
                          setEscrow(await api.getEscrow(escrow.id));
                          setNotice("Backend confirmed the submission review decision: approved.");
                        })} disabled={busy||!reviewNote.trim()}>Approve submission</Action>
                        <Action onClick={() => void run(async () => {
                          await api.reviewSubmission(item.id,"reject",reviewNote);
                          setSubmissions(await api.getEscrowSubmissions(escrow.id));
                          setEscrow(await api.getEscrow(escrow.id));
                          setNotice("Backend confirmed the submission review decision: rejected.");
                        })} disabled={busy||!reviewNote.trim()}>Reject submission</Action>
                      </div>
                    </div>}
                    {item.status==="approved" && escrow.status!=="released" && String(authState.getUser()?.id) === String(escrow.buyer_user_id) && <Action onClick={() => void run(async () => {
                      const openDisputes = await api.listDisputes("open");
                      if (openDisputes.some((dispute) => String(dispute.escrow_id) === String(escrow.id))) {
                        setError("Settlement is blocked while this escrow has an open dispute.");
                        return;
                      }
                      if (!window.confirm("Release this simulated VCR escrow to the agent owner? This action cannot be undone.")) return;
                      const released = await api.releaseEscrow(escrow.id, `autoescrow:escrow:${escrow.id}:release:v1`);
                      const persisted = await api.getEscrow(escrow.id);
                      setEscrow(persisted ?? released);
                      setNotice(`Backend confirmed escrow status: ${persisted?.status ?? released.status}. VCR remains simulated credit only.`);
                    })} disabled={busy || String(authState.getUser()?.id) !== String(escrow.buyer_user_id)}>Release to agent owner</Action>}
                    {["funded", "held", "active"].includes(String(escrow.status).toLowerCase()) && String(authState.getUser()?.id) === String(escrow.buyer_user_id) && <Action onClick={() => void run(async () => {
                      const openDisputes = await api.listDisputes("open");
                      if (openDisputes.some((dispute) => String(dispute.escrow_id) === String(escrow.id))) {
                        setError("A refund request is blocked while this escrow has an open dispute.");
                        return;
                      }
                      if (!window.confirm("Request a refund for this simulated VCR escrow? The backend will enforce its refund rules.")) return;
                      const refunded = await api.refundEscrow(escrow.id, `autoescrow:escrow:${escrow.id}:refund:v1`);
                      const persisted = await api.getEscrow(escrow.id);
                      setEscrow(persisted ?? refunded);
                      setNotice(`Backend confirmed escrow status: ${persisted?.status ?? refunded.status}. No real funds moved.`);
                    })} disabled={busy || String(authState.getUser()?.id) !== String(escrow.buyer_user_id)}>Request buyer refund</Action>}
                    {["submitted", "rejected"].includes(item.status) && <div className="mt-4">
                      <TextArea label="Dispute reason (at least 10 characters)" value={disputeReason} onChange={setDisputeReason} rows={2}/>
                      <Action onClick={() => void run(async () => {
                        const dispute = await api.createSubmissionDispute(item.id, disputeReason);
                        setNotice(`Dispute #${dispute.id} was created by the backend.`);
                        setSubmissions(await api.getEscrowSubmissions(escrow.id));
                      })} disabled={busy || disputeReason.trim().length < 10}>Raise dispute</Action>
                    </div>}
                  </article>)}
                </div>
              </section>
            )}
            {step >= 5 && escrow && (
              <div className="mt-6 rounded-xl border border-white/15 bg-white/[0.06] p-5">
                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} /> Simulated escrow status</div>
                <p className="mt-2 text-sm text-neutral-300">Escrow #{escrow.id} · {escrow.status} · {formatMoney(escrow.amount, escrow.currency)}</p>
                <p className="mt-2 text-xs text-neutral-400">VCR is simulated credit with no monetary value. No real payment gateway or blockchain transfer is involved.</p>
                <p className="mt-4 text-xs text-neutral-500">The current backend does not expose a per-job audit-history endpoint. The account ledger is available in the dashboard.</p>
                <Link href="/jobs" className="mt-5 inline-block underline">Open job registry →</Link>
              </div>
            )}
          </section>
        )}
        <p className="mt-6 text-xs leading-5 text-neutral-500">Execution is explicitly labelled deterministic sample output; no real autonomous agent or external AI model is invoked.</p>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block text-sm text-neutral-300">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40" /></label>;
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return <label className="mt-4 block text-sm text-neutral-300">{label}<textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-sm text-white outline-none focus:border-white/40" /></label>;
}

function Action({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <LiquidButton type="button" onClick={onClick} disabled={disabled} className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold disabled:opacity-40">{children}</LiquidButton>;
}
