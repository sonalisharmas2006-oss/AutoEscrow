"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ApiAgreement, ApiEscrow, ApiExecution, ApiJob, ApiMatchCandidate, ApiMatchRun, ApiSubmission, ApiVerification, authState, autoEscrowApi as api, formatMoney } from "@/lib/api";

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
  const [execution, setExecution] = useState<ApiExecution | null>(null);
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([]);
  const [verification, setVerification] = useState<ApiVerification | null>(null);
  const [output, setOutput] = useState("Sample deliverable: processed by the deterministic local demo executor. Illustrative output only.");
  const [outputNotes, setOutputNotes] = useState("Deterministic Demo Execution — Sample Output");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
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
        title: form.title.trim(), description: form.description.trim(), task_category: form.category,
        required_skills: splitTags(form.skills), expected_output: splitLines(form.deliverables).join("\n"),
        acceptance_criteria: splitLines(form.criteria), budget: form.budget, currency: "VCR",
        deadline: new Date(form.deadline).toISOString(),
        additional_instructions: splitLines(form.responsibilities).join("\n"),
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
      await api.selectJobAgent(job.id, selected.agent_id, matches?.run_id);
      const proposal = await api.createAgreement(job.id, {
        proposed_budget: form.budget, proposed_deadline: new Date(form.deadline).toISOString(), currency: "VCR",
        terms: { scope: job.description, expected_deliverable: splitLines(form.deliverables).join("\n"),
          acceptance_criteria: splitLines(form.criteria), instructions: splitLines(form.responsibilities).join("\n"),
          verification_method: "Deterministic checks against the accepted agreement criteria" },
      });
      setAgreement(proposal);
      setStep(3);
      setNotice("Versioned agreement proposal saved by the backend. Review the terms before accepting.");
    });
  }

  async function accept() {
    if (!agreement) return;
    await run(async () => {
      const accepted = await api.acceptAgreement(agreement.id, {
        version_number: agreement.current_version_number,
      });
      setAgreement(accepted);
      if (accepted.status === "accepted") {
        setStep(4); setNotice("Your authenticated acceptance was recorded by the backend. Funding can proceed.");
      } else { setStep(3); setNotice("The backend did not mark this agreement accepted. Funding remains blocked."); }
    });
  }

  async function fund() {
    if (!job || !agreement) return;
    if (agreement.status !== "accepted" || agreement.accepted_version == null) {
      setError("Escrow funding requires an accepted agreement version."); return;
    }
    await run(async () => {
      const funded = await api.createEscrow(job.id, `autoescrow-job-${job.id}-fund-v1`);
      setEscrow(funded);
      const [latestJob, latestAgreement, latestEscrow, latestExecution] = await Promise.all([
        api.getJob(job.id), api.getAgreementForJob(job.id), api.getEscrowForJob(job.id), api.getExecution(job.id),
      ]);
      setJob(latestJob); setAgreement(latestAgreement); setEscrow(latestEscrow); setExecution(latestExecution);
      setStep(5); setNotice("Simulated VCR escrow funding was persisted by the backend. No real funds moved.");
    });
  }

  async function refresh() {
    if (!job) return;
    await run(async () => {
      const [latestJob, latestAgreement, latestEscrow, latestExecution, latestSubmissions, latestVerification] = await Promise.all([
        api.getJob(job.id), api.getAgreementForJob(job.id), api.getEscrowForJob(job.id),
        api.getExecution(job.id), api.getSubmissions(job.id), api.getVerification(job.id),
      ]);
      setJob(latestJob); setAgreement(latestAgreement); setEscrow(latestEscrow); setExecution(latestExecution);
      setSubmissions(latestSubmissions); setVerification(latestVerification);
      if (latestVerification || latestSubmissions.length) setStep(6);
      else if (latestEscrow) setStep(5);
      else if (latestAgreement?.status === "accepted") setStep(4);
      else if (latestAgreement) setStep(3);
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

        <div className="mb-7 grid gap-2 sm:grid-cols-5" aria-label="Workflow progress">
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
                {available.length === 0 ? <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm text-neutral-400">The backend returned no eligible matches for this job. Revise the required skills, capabilities or budget and compute matches again.</p> : (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {available.map((candidate) => (
                      <button type="button" key={candidate.agent_id} onClick={() => setSelected(candidate)} className={`rounded-xl border p-4 text-left ${selected?.agent_id === candidate.agent_id ? "border-white/50 bg-white/10" : "border-white/10 bg-black/20"}`}>
                        <div className="flex justify-between gap-3"><strong>{candidate.agent_name}</strong><span className="text-sm tabular-nums">{candidate.score.toFixed(2)}</span></div>
                        <p className="mt-2 text-xs text-neutral-400">Listed skills: {candidate.agent.skills?.join(", ") || "Not supplied"}</p>
                        <ul className="mt-2 space-y-1">{candidate.reasons.map((reason, index) => <li key={index} className="text-[11px] text-neutral-500">{reason.component}: {reason.explanation}</li>)}</ul>
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
                <p className="mt-1 text-sm text-neutral-400">Version {agreement.current_version_number} · {agreement.status} · {formatMoney(agreement.current_version.terms.budget_amount, agreement.current_version.terms.currency)}</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs text-neutral-300">{JSON.stringify(agreement.current_version.terms, null, 2)}</pre>
                {step === 3 && (agreement.acceptances.some((item) => item.user_id === authState.getUser()?.id && item.version_number === agreement.current_version_number)
                  ? <p className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-sm text-amber-100">Your acceptance is recorded. Waiting for the agent owner to accept this version before escrow can be created.</p>
                  : <Action onClick={() => void accept()} disabled={busy}>Accept agreement version {agreement.current_version_number} <ShieldCheck size={16} /></Action>)}
              </div>
            )}

            {step >= 4 && agreement && (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="font-semibold">Accepted agreement</h3>
                <p className="mt-1 text-sm text-neutral-400">Version {agreement.current_version_number} · {agreement.status}</p>
                <p className="mt-2 text-xs text-neutral-500">Acceptance records: {agreement.acceptances.length}</p>
                {step === 4 && <Action onClick={() => void fund()} disabled={busy}>Create and fund simulated escrow <LockKeyhole size={16} /></Action>}
              </div>
            )}

            {step === 5 && escrow && (
              <div className="mt-6 rounded-xl border border-white/15 bg-white/[0.06] p-5">
                <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} /> M0–M3 workflow complete</div>
                <p className="mt-2 text-sm text-neutral-300">Escrow #{escrow.id} · {escrow.status} · {formatMoney(escrow.amount, escrow.currency)}</p>
                <p className="mt-2 text-xs text-neutral-400">This is a simulated VCR ledger record. No real payment, blockchain transaction, agent execution, verification, or dispute action occurred.</p>
                <p className="mt-4 text-xs text-neutral-500">The current backend does not expose a per-job audit-history endpoint. The account ledger is available in the dashboard.</p>
                <Link href="/jobs" className="mt-5 inline-block underline">Open job registry →</Link>
              </div>
            )}
          </section>
        )}
        <p className="mt-6 text-xs leading-5 text-neutral-500">M4 agent execution, verification, and dispute resolution are not exposed by the current backend. The interface will not claim those actions have happened until supported and verified by the backend.</p>
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
