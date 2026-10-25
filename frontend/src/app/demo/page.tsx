"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  FileCheck2,
  Info,
  Landmark,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WalletCards,
  XCircle,
} from "lucide-react";
import {
  ApiAgent,
  ApiAgreement,
  ApiAgreementTerms,
  ApiDispute,
  ApiEscrow,
  ApiExecution,
  ApiJob,
  ApiJobEvent,
  ApiMatchRun,
  ApiSubmission,
  ApiVerification,
  AutoEscrowApiError,
  autoEscrowApi,
  formatMoney,
} from "@/lib/api";

const JOB_STORAGE_KEY = "autoescrow-guided-demo-job";
const AGENT_STORAGE_KEY = "autoescrow-guided-demo-agent";
const DRAFT_KEY = "autoescrow-job-draft";

const steps = [
  { id: 1, label: "Discover", description: "Choose a suitable synthetic agent." },
  { id: 2, label: "Define the job", description: "Describe the work and its acceptance rules." },
  { id: 3, label: "Compare matches", description: "Review the backend's explainable ranking." },
  { id: 4, label: "Accept terms", description: "Freeze the agreement before funding." },
  { id: 5, label: "Fund escrow", description: "Record a simulated ledger funding entry." },
  { id: 6, label: "Submit work", description: "Run the safe local demo execution." },
  { id: 7, label: "Verify result", description: "Check the output against the criteria." },
  { id: 8, label: "Resolve", description: "Release after a pass or open a dispute after a failure." },
  { id: 9, label: "Review record", description: "Read the persisted audit and ledger trail." },
];

type FormState = {
  title: string;
  description: string;
  requiredSkills: string;
  category: string;
  expectedOutput: string;
  criteria: string;
  budget: string;
  deadline: string;
};

const initialForm: FormState = {
  title: "Synthetic data quality brief",
  description: "Review a small synthetic data sample and return a structured quality summary.",
  requiredSkills: "analysis, data-cleaning",
  category: "analysis",
  expectedOutput: "A JSON quality summary with findings and a recommendation.",
  criteria: "Valid JSON output\nMinimum length: 20",
  budget: "35.00",
  deadline: "",
};

const errorText = (error: unknown) => error instanceof Error ? error.message : "The backend request failed. Retry the step or reset the demo.";

export default function GuidedDemoPage() {
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [job, setJob] = useState<ApiJob | null>(null);
  const [matches, setMatches] = useState<ApiMatchRun | null>(null);
  const [agreement, setAgreement] = useState<ApiAgreement | null>(null);
  const [escrow, setEscrow] = useState<ApiEscrow | null>(null);
  const [execution, setExecution] = useState<ApiExecution | null>(null);
  const [submission, setSubmission] = useState<ApiSubmission | null>(null);
  const [verification, setVerification] = useState<ApiVerification | null>(null);
  const [dispute, setDispute] = useState<ApiDispute | null>(null);
  const [events, setEvents] = useState<ApiJobEvent[]>([]);
  const [ledger, setLedger] = useState<ApiEscrow["ledger_entries"]>([]);
  const [submissionMode, setSubmissionMode] = useState<"pass" | "fail">("pass");
  const [manualOutput, setManualOutput] = useState("");
  const deadline = form.deadline;
  const setDeadline = (value: string) => setForm(previous => ({ ...previous, deadline: value }));
  const [revisionBudget, setRevisionBudget] = useState("");
  const [revisionCriteria, setRevisionCriteria] = useState("");
  const [loading, setLoading] = useState("loading the synthetic registry");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) || null;
  const selectedMatch = matches?.candidates.find((candidate) => candidate.agent_id === selectedAgentId) || null;

  const completed = useMemo(() => ({
    1: Boolean(selectedAgentId),
    2: Boolean(job),
    3: Boolean(job?.selected_agent_id && matches),
    4: agreement?.status === "accepted",
    5: Boolean(escrow && ["funded", "held", "released", "refunded", "disputed"].includes(escrow.status)),
    6: Boolean(submission),
    7: Boolean(verification && verification.submission_id === submission?.id),
    8: Boolean(
      escrow && ["released", "refunded"].includes(escrow.status),
    ),
    9: Boolean(events.length && completedRecordAvailable(job, escrow)),
  }), [agreement?.status, escrow, events.length, job, matches, selectedAgentId, submission, verification]);

  const currentStep = steps.find((step) => !completed[step.id as keyof typeof completed])?.id || 9;

  useEffect(() => {
    const defaultDraft = { ...initialForm, deadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16) };
    setForm(defaultDraft);
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...defaultDraft, ...JSON.parse(saved) });
    } catch { /* A malformed local draft is not authoritative workflow state. */ }
    let active = true;
    const load = async () => {
      try {
        setLoading("connecting to the synthetic registry");
        const response = await autoEscrowApi.listAgents({ status: "active", availability: "available" });
        if (!active) return;
        setAgents(response.items);
        const query = new URLSearchParams(window.location.search);
        if (query.has("new")) { localStorage.removeItem(JOB_STORAGE_KEY); localStorage.removeItem(AGENT_STORAGE_KEY); }
        const storedAgent = Number(query.get("agent") || window.localStorage.getItem(AGENT_STORAGE_KEY));
        const storedAgentRecord = response.items.find((agent) => agent.id === storedAgent);
        if (storedAgentRecord) { setSelectedAgentId(storedAgentRecord.id); if (query.has("agent")) setForm(previous => ({ ...previous, requiredSkills: storedAgentRecord.skills.join(", "), category: storedAgentRecord.task_categories[0] || "general" })); }
        const storedJob = Number(query.get("job") || (query.has("agent") ? null : window.localStorage.getItem(JOB_STORAGE_KEY)));
        if (storedJob) window.localStorage.setItem(JOB_STORAGE_KEY, String(storedJob));
        if (storedJob) await refreshWorkflow(storedJob, response.items);
      } catch (caught) {
        if (active) setError(errorText(caught));
      } finally {
        if (active) {
          setLoaded(true);
          setLoading("");
        }
      }
    };
    void load();
    return () => { active = false; };
  // refreshWorkflow intentionally remains a local workflow helper. It reads
  // the current job/registry state and is not a stable dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (loaded) localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); }, [form, loaded]);

  async function refreshWorkflow(jobId = job?.id, registry = agents) {
    if (!jobId) return;
    setLoading("refreshing the authoritative workflow state");
    try {
      const currentJob = await autoEscrowApi.getJob(jobId);
      const [currentAgreement, currentEscrow, currentExecution, currentVerification, submissions, disputes, currentMatches] = await Promise.all([
        autoEscrowApi.getAgreementForJob(jobId),
        autoEscrowApi.getEscrowForJob(jobId),
        autoEscrowApi.getExecution(jobId),
        autoEscrowApi.getVerification(jobId),
        autoEscrowApi.getSubmissions(jobId),
        autoEscrowApi.getJobDisputes(jobId),
        autoEscrowApi.getMatches(jobId),
      ]);
      const currentEvents = await autoEscrowApi.getJobEvents(jobId);
      const currentLedger = currentEscrow ? await autoEscrowApi.getLedger(currentEscrow.id) : [];
      setJob(currentJob);
      setAgreement(currentAgreement);
      if (currentAgreement) { setRevisionBudget(currentAgreement.amount); setRevisionCriteria((currentAgreement.terms.acceptance_criteria as string[]).join("\n")); }
      setEscrow(currentEscrow);
      setExecution(currentExecution);
      setVerification(currentVerification?.submission_id === submissions.at(-1)?.id ? currentVerification : null);
      setSubmission(submissions.at(-1) || null);
      setDispute(disputes[0] || null);
      setMatches(currentMatches);
      setEvents(currentEvents);
      setLedger(currentLedger);
      const selected = registry.find((agent) => agent.id === currentJob.selected_agent_id);
      if (selected) setSelectedAgentId(selected.id);
      setError(null);
    } catch (caught) {
      if (caught instanceof AutoEscrowApiError && caught.status === 404) {
        window.localStorage.removeItem(JOB_STORAGE_KEY);
        setError("The saved demo job is no longer available. Start a new guided demo.");
      } else setError(errorText(caught));
    } finally {
      setLoading("");
    }
  }

  async function run(label: string, operation: () => Promise<void>) {
    setBusy(true);
    setLoading(label);
    setError(null);
    try {
      await operation();
    } catch (caught) {
      setError(errorText(caught));
    } finally {
      setBusy(false);
      setLoading("");
    }
  }

  async function createJob() {
    if (!selectedAgent) return setError("Choose an available synthetic agent first.");
    await run("creating the job and saving it to the backend", async () => {
      const created = await autoEscrowApi.createJob({
        title: form.title,
        description: form.description,
        required_skills: form.requiredSkills.split(",").map((item) => item.trim()).filter(Boolean),
        task_category: form.category,
        expected_output: form.expectedOutput,
        acceptance_criteria: form.criteria.split("\n").map((item) => item.trim()).filter(Boolean),
        budget: Number(form.budget).toFixed(2),
        currency: "USD",
        deadline: new Date(`${deadline}Z`).toISOString(),
        additional_instructions: "Synthetic guided-demo task. Do not use real personal or payment data.",
      });
      setJob(created);
      window.localStorage.setItem(JOB_STORAGE_KEY, String(created.id));
      await refreshWorkflow(created.id);
    });
  }

  async function computeMatches() {
    if (!job) return;
    await run("computing explainable matches", async () => {
      const result = await autoEscrowApi.computeMatches(job.id);
      setMatches(result);
    });
  }

  async function selectMatch() {
    if (!job || !selectedMatch || !selectedMatch.eligible) return;
    await run("persisting the selected match", async () => {
      await autoEscrowApi.selectAgent(job.id, selectedMatch.agent_id, matches?.run_id);
      await refreshWorkflow(job.id);
    });
  }

  async function proposeAgreement() {
    if (!job || !selectedAgent) return;
    await run("creating the versioned agreement", async () => {
      const result = await autoEscrowApi.createAgreement(job.id, {
        currency: "USD",
        proposed_budget: job.budget,
        proposed_deadline: job.deadline,
        terms: {
          scope: job.description,
          expected_deliverable: job.expected_output,
          acceptance_criteria: job.acceptance_criteria,
          verification_method: "Deterministic checks against the accepted criteria.",
          cancellation_conditions: "Cancellation is allowed before execution starts.",
          dispute_conditions: "Open a dispute with evidence when the result or verification is contested.",
          instructions: "This agreement is for synthetic demo data only.",
          verification_rules: { output_format: "json" },
        },
      });
      setAgreement(result);
      setRevisionBudget(result.amount); setRevisionCriteria((result.terms.acceptance_criteria as string[]).join("\n"));
    });
  }

  async function acceptAgreement() {
    if (!agreement || !window.confirm("Accept these terms? The accepted version becomes immutable for this task.")) return;
    await run("freezing the accepted agreement version", async () => {
      await autoEscrowApi.acceptAgreement(agreement.id, "Accepted for the guided synthetic demo.");
      await refreshWorkflow(job?.id);
    });
  }

  async function fundEscrow() {
    if (!job || !window.confirm("Record the simulated funding action? No real funds move or get held.")) return;
    await run("recording the simulated escrow funding ledger entry", async () => {
      await autoEscrowApi.fundEscrow(job.id, { idempotency_key: `guided-demo-${job.id}`, reference: "synthetic-guided-demo" });
      await refreshWorkflow(job.id);
    });
  }

  async function submitWork() {
    if (!job) return;
    await run("running the safe local demo execution and saving the submission", async () => {
      const latestExecution = execution?.can_start ? await autoEscrowApi.startExecution(job.id) : execution;
      setExecution(latestExecution || null);
      const output = manualOutput.trim() || (submissionMode === "pass"
        ? JSON.stringify({ result: "Synthetic quality review complete", findings: ["No blocking issues found"], recommendation: "Proceed" })
        : "invalid");
      await autoEscrowApi.submitJob(job.id, {
        submitted_output: output,
        evidence: { synthetic: true, source: "guided-demo", format: submissionMode === "pass" ? "json" : "text" },
        notes: submissionMode === "pass" ? "Passing synthetic sample." : "Failing synthetic sample for dispute demonstration.",
      });
      await refreshWorkflow(job.id);
    });
  }

  async function verifyWork() {
    if (!job) return;
    await run("evaluating the persisted submission against the accepted criteria", async () => {
      await autoEscrowApi.verifyJob(job.id);
      await refreshWorkflow(job.id);
    });
  }

  async function releaseFunds() {
    if (!escrow || !window.confirm("Release the simulated balance? This is allowed only because verification passed.")) return;
    await run("releasing the eligible simulated escrow balance", async () => {
      await autoEscrowApi.releaseEscrow(escrow.id);
      await refreshWorkflow(job?.id);
    });
  }

  async function openDispute() {
    if (!job || !escrow || !selectedAgent) return;
    await run("opening a persisted dispute with synthetic evidence", async () => {
      await autoEscrowApi.createDispute(job.id, {
        escrow_id: escrow.id,
        category: "failed_verification",
        reason: "The synthetic result did not satisfy the accepted checks.",
        description: "This dispute is intentionally created to demonstrate that failed verification blocks normal settlement.",
        evidence: { synthetic: true, source: "guided-demo", verification_id: verification?.id },
        raised_by_agent_id: selectedAgent.id,
      });
      await refreshWorkflow(job.id);
    });
  }

  async function resolveRefund() {
    if (!dispute || !window.confirm("Resolve this synthetic dispute as a refund? The escrow will be refunded, not released.")) return;
    await run("reviewing and resolving the dispute through the permitted demo operator path", async () => {
      if (dispute.status === "open") await autoEscrowApi.reviewDispute(dispute.id, "Synthetic evidence is ready for review.");
      await autoEscrowApi.resolveDispute(dispute.id, "refund", "The failed synthetic verification means the simulated balance is refunded.");
      await refreshWorkflow(job?.id);
    });
  }

  async function resetDemo() {
    if (!window.confirm("Reset your synthetic demo session? Your demo records will be deleted; other visitors are unaffected.")) return;
    await run("resetting only this browser's synthetic demo sandbox", async () => {
      await autoEscrowApi.resetDemoSession();
      window.localStorage.removeItem(JOB_STORAGE_KEY);
      window.localStorage.removeItem(AGENT_STORAGE_KEY);
      setSelectedAgentId(null);
      setJob(null); setMatches(null); setAgreement(null); setEscrow(null); setExecution(null);
      setSubmission(null); setVerification(null); setDispute(null); setEvents([]); setLedger([]);
      setForm({ ...initialForm, deadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16) });
      localStorage.removeItem(DRAFT_KEY); setManualOutput("");
      window.history.replaceState(null, "", window.location.pathname);
    });
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-tr from-slate-100 via-sky-50/50 to-slate-200 text-[#0b1b34]">
      <header className="border-b border-[#dbe7f1] bg-white/90 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b2447] text-xs font-bold text-white">AE</span>
            <span>Auto Escrow</span>
            <span className="hidden rounded-full bg-[#e8f3ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2466a6] sm:inline-flex">Guided prototype</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="hidden rounded-full px-3 py-2 text-sm text-[#46617e] hover:bg-[#f1f6fa] sm:inline-flex">Browse agents</Link>
            <button onClick={() => void resetDemo()} disabled={busy} className="inline-flex items-center gap-2 rounded-full border border-[#cad9e6] bg-white px-3 py-2 text-sm font-semibold text-[#21415e] hover:bg-[#f4f8fb] disabled:opacity-50">
              <RotateCcw size={15} /> Reset sandbox
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-6 pb-32 pt-8 sm:px-8 lg:px-12">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2b78b8]"><Sparkles size={14} /> Try the full workflow</div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[#0b2447] md:text-6xl">See how a task moves from a brief to a recorded outcome.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#55708c]">Auto Escrow connects a requester to a synthetic agent, freezes clear terms, records a simulated balance, checks the submitted result, and keeps the audit trail readable.</p>
          </div>
          <div className="rounded-3xl border border-[#cfe2f1] bg-[#eaf5ff] p-5 text-sm leading-6 text-[#315a7d]">
            <div className="mb-2 flex items-center gap-2 font-semibold text-[#0b4779]"><Info size={16} /> Honest demo boundary</div>
            <p>All agents and records are synthetic. Escrow is a database ledger entry: no payment provider, blockchain, or real funds are involved.</p>
          </div>
        </section>

        <div className="mb-8 overflow-x-auto rounded-3xl border border-[#dbe7f1] bg-white p-3 shadow-[0_16px_50px_rgba(32,73,110,0.06)]">
          <div className="grid min-w-[1000px] grid-cols-9 items-center gap-1">
            {steps.map((step, index) => {
              const isComplete = completed[step.id as keyof typeof completed];
              const isCurrent = currentStep === step.id;
              return <div key={step.id} className="flex min-w-0 items-center gap-1" aria-current={isCurrent ? "step" : undefined} aria-label={`${step.label}: ${isComplete ? "completed" : isCurrent ? "current" : "remaining"}`}>
                <div className={`flex min-w-0 items-center gap-2 rounded-2xl px-2 py-2 ${isCurrent ? "bg-[#0b2447] text-white" : ""}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${isComplete ? "border-[#a8d8c2] bg-[#e8f8ef] text-[#187447]" : isCurrent ? "border-white/30 bg-white/10 text-white" : "border-[#cbd9e5] bg-[#f8fbfd] text-[#758aa0]"}`}>
                    {isComplete ? <Check size={15} /> : step.id}
                  </span>
                  <span className="min-w-0"><span className={`block text-[10px] font-semibold ${isCurrent ? "text-white" : "text-[#24435f]"}`}>{step.label}</span></span>
                </div>
                {index < steps.length - 1 && <ArrowRight size={14} className="shrink-0 text-[#b7c8d7]" />}
              </div>;
            })}
          </div>
        </div>

        {(error || loading) && <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${error ? "border-[#f0c6c6] bg-[#fff5f5] text-[#8a3030]" : "border-[#cfe2f1] bg-white text-[#55708c]"}`} role={error ? "alert" : "status"}>
          {error ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <RefreshCw size={18} className="mt-0.5 shrink-0 animate-spin" />}
          <div className="flex-1"><p className="font-semibold">{error ? "This step needs attention" : "Working"}</p><p className="mt-1">{error || loading}</p></div>
          {error && <button onClick={() => job ? void refreshWorkflow() : window.location.reload()} className="rounded-full border border-current px-3 py-1.5 text-xs font-semibold">Refresh / retry</button>}
        </div>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-6">
            {currentStep === 1 && <StepCard number="01" title="Discover a suitable agent" intro="Start with capability, availability, and output format—not a made-up rating.">
              {!loaded ? <LoadingBlock label="Loading synthetic agents…" /> : agents.length === 0 ? <EmptyBlock label="No synthetic agents are available." action="Retry" onClick={() => window.location.reload()} /> : <div className="grid gap-3 md:grid-cols-2">
                {agents.map((agent) => <button key={agent.id} onClick={() => { setSelectedAgentId(agent.id); setForm(previous => ({ ...previous, requiredSkills: agent.skills.join(", "), category: agent.task_categories[0] || "general" })); window.localStorage.setItem(AGENT_STORAGE_KEY, String(agent.id)); }} className={`text-left rounded-2xl border p-4 transition ${selectedAgentId === agent.id ? "border-[#2f7bb7] bg-[#f0f8ff] ring-2 ring-[#c8e5fb]" : "border-[#dbe7f1] bg-white hover:border-[#aac9df]"}`}>
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#0b2447]">{agent.name}</p><p className="mt-1 text-xs text-[#6e8499]">{agent.external_id}</p></div>{selectedAgentId === agent.id ? <CheckCircle2 className="text-[#187447]" size={19} /> : <Circle className="text-[#b7c8d7]" size={19} />}</div>
                  <p className="mt-3 text-sm leading-6 text-[#55708c]">{agent.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{agent.skills.slice(0, 4).map((skill) => <span key={skill} className="rounded-full bg-[#f1f6fa] px-2.5 py-1 text-[11px] text-[#4c6882]">{skill}</span>)}</div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#e6eef4] pt-3 text-xs text-[#6b8298]"><span>{agent.availability}</span><span>{agent.supported_output_formats.join(" · ") || "format not specified"}</span></div>
                </button>)}
              </div>}
              <div className="mt-5 rounded-2xl bg-[#f7fafc] p-4 text-sm text-[#55708c]"><strong className="text-[#24435f]">Why this matters:</strong> the backend will later re-check eligibility. Selecting a card is not a guarantee that the work will pass.</div>
            </StepCard>}

            {currentStep === 2 && <StepCard number="02" title="Define the job" intro="These fields become the source of truth for matching, agreement terms, and verification.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Job title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
                <Field label="Task category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} hint="Use a category exposed by the synthetic registry, such as analysis or verification." />
                <Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} multiline />
                <Field label="Required skills" value={form.requiredSkills} onChange={(value) => setForm({ ...form, requiredSkills: value })} hint="Comma-separated skills used by the real matching policy." />
                <Field label="Expected deliverable" value={form.expectedOutput} onChange={(value) => setForm({ ...form, expectedOutput: value })} multiline />
                <Field label="Acceptance criteria" value={form.criteria} onChange={(value) => setForm({ ...form, criteria: value })} multiline hint="One criterion per line. Try “Valid JSON output” and “Minimum length: 20”." />
                <Field label="Simulated budget (USD)" value={form.budget} onChange={(value) => setForm({ ...form, budget: value })} type="number" />
                <Field label="Deadline (UTC)" value={deadline} onChange={setDeadline} type="datetime-local" hint="A future deadline, at most 365 days away. This example uses USD; other currencies remain supported by the API." />
              </div>
              <ActionButton onClick={() => void createJob()} disabled={busy || !form.title.trim() || !form.description.trim() || !form.criteria.trim() || !deadline || Number(form.budget) <= 0 || Number(form.budget) > 500}>Create job and continue <ArrowRight size={16} /></ActionButton>
            </StepCard>}

            {currentStep === 3 && <StepCard number="03" title="Compare the backend matches" intro="The score is a ranking signal. Read the matched skills, warnings, and exclusion reasons before selecting.">
              {!matches ? <ActionButton onClick={() => void computeMatches()} disabled={busy}>Compute matches <Sparkles size={16} /></ActionButton> : <div className="space-y-3">
                {matches.candidates.map((candidate) => <div key={candidate.agent_id} className={`rounded-2xl border p-4 ${candidate.agent_id === selectedAgentId ? "border-[#2f7bb7] bg-[#f0f8ff]" : "border-[#dbe7f1] bg-white"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-[#0b2447]">{candidate.agent_name}</p><p className="mt-1 text-xs text-[#55708c]">{candidate.explanation}</p></div><div className="text-right"><p className="text-2xl font-semibold text-[#0b4779]">{candidate.score}</p><p className="text-[10px] uppercase tracking-wider text-[#7890a5]">match score</p></div></div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#e8f8ef] px-2.5 py-1 text-[#187447]">Matched: {candidate.matched_skills.join(", ") || "none"}</span>{candidate.missing_skills.length > 0 && <span className="rounded-full bg-[#fff1e5] px-2.5 py-1 text-[#9a5b21]">Missing: {candidate.missing_skills.join(", ")}</span>}</div>
                  {candidate.warnings.length > 0 && <p className="mt-3 text-xs leading-5 text-[#7d6a4c]">Warning: {candidate.warnings[0]}</p>}
                  <details className="mt-3 text-xs"><summary>Score factors and all warnings</summary><pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(candidate.breakdown, null, 2)}</pre><p>{candidate.warnings.join(" ")}</p></details>
                  {candidate.eligible && <button onClick={() => setSelectedAgentId(candidate.agent_id)} className="mt-4 rounded-full border border-[#9bc8e7] px-3 py-2 text-xs font-semibold text-[#166394]">{candidate.agent_id === selectedAgentId ? "Selected" : "Use this match"}</button>}
                </div>)}
                {matches.excluded_agents.length > 0 && <details className="rounded-2xl border border-[#e7edf2] bg-[#fafcfd] p-4 text-sm text-[#55708c]"><summary className="cursor-pointer font-semibold text-[#36546f]">Show excluded agents ({matches.excluded_agents.length})</summary><div className="mt-3 space-y-2">{matches.excluded_agents.map((candidate) => <p key={candidate.agent_id}><strong>{candidate.agent_name}:</strong> {candidate.exclusion_reasons.join(" ")}</p>)}</div></details>}
                <ActionButton onClick={() => void selectMatch()} disabled={busy || !selectedMatch?.eligible}>Persist selected agent <ArrowRight size={16} /></ActionButton>
              </div>}
            </StepCard>}

            {currentStep === 4 && <StepCard number="04" title="Review and accept the agreement" intro="Acceptance freezes the terms version used by escrow and verification. Nothing is funded yet.">
              {!agreement ? <ActionButton onClick={() => void proposeAgreement()} disabled={busy}>Create agreement from this job <FileCheck2 size={16} /></ActionButton> : <div className="rounded-2xl border border-[#dbe7f1] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-[#f1f6fa] px-3 py-1 text-xs font-semibold text-[#46617e]">Proposal v{agreement.proposal_version}</span><span className="text-sm font-semibold text-[#0b4779]">{formatMoney(agreement.amount, agreement.currency)}</span></div>
                <dl className="mt-5 space-y-4 text-sm"><Term label="Scope" value={String(agreement.terms.scope || "")} /><Term label="Deliverable" value={String(agreement.terms.expected_deliverable || "")} /><Term label="Checks" value={Array.isArray(agreement.terms.acceptance_criteria) ? agreement.terms.acceptance_criteria.join(" · ") : ""} /><Term label="Verification" value={String(agreement.terms.verification_method || "")} /></dl>
                <details className="mt-5 rounded-xl bg-[#f7fafc] p-3 text-xs text-[#55708c]"><summary className="cursor-pointer font-semibold">What acceptance changes</summary><p className="mt-2 leading-5">The backend stores the accepted version and uses it for the funding amount and verification rules. The frontend cannot edit those terms afterward.</p></details>
                <ActionButton onClick={() => void acceptAgreement()} disabled={busy || agreement.status !== "proposed"}>Accept version {agreement.proposal_version} <Check size={16} /></ActionButton>
                {["proposed", "revision_requested"].includes(agreement.status) && <details className="mt-5 text-sm"><summary>Revise, reject, or cancel the proposal</summary><div className="grid gap-3 mt-3"><Field label="Revised simulated budget" value={revisionBudget} onChange={setRevisionBudget} type="number" /><Field label="Revised criteria (one per line)" value={revisionCriteria} onChange={setRevisionCriteria} multiline /></div><ActionButton disabled={busy} onClick={() => void run("saving the agreement revision", async () => {
                  if (agreement.status === "proposed") await autoEscrowApi.reviseAgreement(agreement.id, { action: "request_revision", rationale: "Requester is reviewing proposed terms." });
                  await autoEscrowApi.reviseAgreement(agreement.id, { action: "submit_revision", proposed_budget: revisionBudget, terms: { ...(agreement.terms as unknown as ApiAgreementTerms), acceptance_criteria: revisionCriteria.split("\n").filter(Boolean) }, rationale: "Requester revised synthetic task terms." });
                  await refreshWorkflow(job?.id);
                })}>Save a new proposal version</ActionButton><div className="mt-3 flex gap-4">{(["reject", "cancel"] as const).map(action => <button className="underline" key={action} disabled={busy} onClick={() => { if (window.confirm(`${action} this proposal? It cannot be reopened.`)) void run(`${action} agreement`, async () => { if (action === "reject") await autoEscrowApi.rejectAgreement(agreement.id); else await autoEscrowApi.cancelAgreement(agreement.id); await refreshWorkflow(job?.id); }); }}>{action} proposal</button>)}</div></details>}
                {["rejected", "cancelled", "expired"].includes(agreement.status) && <p className="mt-4 text-sm">This agreement is {agreement.status}. <Link href="/demo/?new=1" onClick={() => window.location.assign("/demo/?new=1")} className="underline">Create a new job</Link> to continue without changing this history.</p>}
              </div>}
            </StepCard>}

            {currentStep === 5 && <StepCard number="05" title="Fund the simulated escrow" intro="This records a fixed-point ledger entry using the accepted agreement amount. It is not a real payment.">
              <div className="grid gap-3 sm:grid-cols-3"><Summary label="Amount" value={formatMoney(agreement?.amount, agreement?.currency)} /><Summary label="State" value={escrow?.status || "not created"} /><Summary label="Protection" value="Verification required" /></div>
              <ActionButton onClick={() => void fundEscrow()} disabled={busy || Boolean(escrow)}>Record simulated funding <WalletCards size={16} /></ActionButton>
              {escrow && <p className="mt-3 text-xs text-[#55708c]">Ledger entry {escrow.ledger_entries[0]?.idempotency_key || "saved"} is persisted. Repeat funding requests are protected by idempotency.</p>}
            </StepCard>}

            {currentStep === 6 && <StepCard number="06" title="Submit the work" intro="The demo starts the backend's safe local execution state and stores output. It never executes submitted code.">
              <div className="grid gap-3 md:grid-cols-2"><button onClick={() => setSubmissionMode("pass")} className={`rounded-2xl border p-4 text-left ${submissionMode === "pass" ? "border-[#5bb78a] bg-[#effaf4]" : "border-[#dbe7f1] bg-white"}`}><p className="font-semibold text-[#176b43]">Passing sample</p><p className="mt-1 text-xs leading-5 text-[#55708c]">Valid JSON with enough content to satisfy the configured checks.</p></button><button onClick={() => setSubmissionMode("fail")} className={`rounded-2xl border p-4 text-left ${submissionMode === "fail" ? "border-[#e4a5a5] bg-[#fff5f5]" : "border-[#dbe7f1] bg-white"}`}><p className="font-semibold text-[#8a3030]">Failing sample</p><p className="mt-1 text-xs leading-5 text-[#55708c]">Intentionally fails so you can demonstrate the dispute path.</p></button></div>
              <div className="mt-5 rounded-2xl bg-[#f7fafc] p-4 text-sm text-[#55708c]"><p className="font-semibold text-[#24435f]">What will be stored</p><p className="mt-1">A submission version, safe local artifact reference, output text, evidence metadata, and an audit event.</p></div>
              <ActionButton onClick={() => void submitWork()} disabled={busy || !(execution?.can_start || execution?.can_submit)}>Submit {submissionMode === "pass" ? "passing" : "failing"} sample <ArrowRight size={16} /></ActionButton>
              {execution && !execution.can_start && !execution.can_submit && <p className="mt-3 text-sm">{execution.submit_reason}</p>}
              <details className="mt-5 text-sm"><summary>Or submit your own synthetic output</summary><Field label="Manual output (stored as text, never executed)" value={manualOutput} onChange={setManualOutput} multiline hint="Leave blank to use the selected sample. Your accepted criteria still apply." /></details>
            </StepCard>}

            {currentStep === 7 && <StepCard number="07" title="Verify the result" intro="The verifier reads the accepted criteria and returns individual checks. A failure blocks normal settlement.">
              <div className="rounded-2xl border border-[#dbe7f1] bg-white p-5"><p className="text-sm text-[#55708c]">Latest submission: <strong className="text-[#24435f]">version {submission?.version || "--"}</strong></p><p className="mt-2 text-xs text-[#7890a5]">Execution state: {execution?.execution_status || "awaiting refresh"}</p></div>
              <ActionButton onClick={() => void verifyWork()} disabled={busy || !execution?.can_verify}>Run deterministic verification <ShieldCheck size={16} /></ActionButton>
              {execution && !execution.can_verify && <p className="mt-3 text-sm">{execution.verify_reason}</p>}
            </StepCard>}

            {currentStep === 8 && <StepCard number="08" title="Resolve the outcome" intro={verification?.overall_result === "passed" ? "Release is available only when the backend reports settlement ready. Confirm before writing the ledger entry." : verification?.overall_result === "manual_review" ? "Some criteria require human judgment. No human review is implemented here; normal settlement stays blocked. The sandbox can demonstrate a dispute and refund." : "Verification did not pass, so settlement remains blocked. Open a dispute to demonstrate the permitted refund path."}>
              {execution?.can_submit && <div className="mb-4 text-sm"><p>You may submit a corrected result within the backend retry limit. Previous submissions are preserved.</p><Field label="Corrected synthetic output" value={manualOutput} onChange={setManualOutput} multiline /><ActionButton onClick={() => void submitWork()} disabled={busy}>Submit a correction</ActionButton></div>}
              {verification && (verification.overall_result === "passed" ? <><VerificationResult verification={verification} /><ActionButton onClick={() => void releaseFunds()} disabled={busy || execution?.execution_status !== "settlement_ready"}>Release eligible simulated funds <Landmark size={16} /></ActionButton>{execution?.execution_status !== "settlement_ready" && <p className="mt-3 text-sm">Release is blocked in the current backend state: {execution?.execution_status || "unknown"}. Refresh or inspect this job’s disputes in the workspace.</p>}</> : <><VerificationResult verification={verification} /><div className="rounded-2xl border border-[#f0c6c6] bg-[#fff5f5] p-4 text-sm text-[#8a3030]"><strong>Settlement blocked.</strong> The backend will reject release until a passed verification and completed job exist.</div>{!dispute ? <ActionButton onClick={() => void openDispute()} disabled={busy || !escrow}>Open dispute with evidence <AlertCircle size={16} /></ActionButton> : <><p className="text-sm text-[#55708c]">Dispute #{dispute.id} is <strong>{dispute.status}</strong>.</p><ActionButton onClick={() => void resolveRefund()} disabled={busy || !["open", "under_review"].includes(dispute.status)}>Review and refund the simulated balance <RotateCcw size={16} /></ActionButton></>}</>)}
            </StepCard>}

            {currentStep === 9 && <StepCard number="09" title="Review the persisted record" intro="The final view is assembled from the job, verification, escrow ledger, and audit APIs—not decorative progress flags.">
              <RecordSummary job={job} escrow={escrow} verification={verification} dispute={dispute} events={events} ledger={ledger} />
              <Link className="mt-5 block underline" href="/demo/?new=1" onClick={(event) => { event.preventDefault(); window.location.assign("/demo/?new=1"); }}>Try another job (keeps this record)</Link>
              <Link className="mt-3 block underline" href={`/jobs/?job=${job?.id}`}>Open this job in the workspace</Link>
              <button onClick={() => void refreshWorkflow()} className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#cad9e6] bg-white px-4 py-2 text-sm font-semibold text-[#21415e] hover:bg-[#f4f8fb]"><RefreshCw size={15} /> Refresh persisted record</button>
            </StepCard>}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#dbe7f1] bg-white p-5 shadow-[0_16px_50px_rgba(32,73,110,0.06)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7390a8]">Current state</p>
              <div className="mt-4 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf5ff] text-[#236a9e]"><Clock3 size={20} /></span><div><p className="font-semibold text-[#0b2447]">Step {currentStep} of {steps.length}</p><p className="text-xs text-[#6e8499]">{steps[currentStep - 1]?.label}</p></div></div>
              <div className="mt-5 space-y-2 text-sm">{[
                ["Agent", selectedAgent?.name || "Not selected"], ["Job", job?.public_id || "Not created"], ["Agreement", agreement?.status || "Not created"], ["Escrow", escrow?.status || "Not created"], ["Verification", verification?.overall_result || "Not run"],
              ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-[#edf2f6] py-2 last:border-0"><span className="text-[#7890a5]">{label}</span><span className="max-w-[170px] truncate text-right font-medium text-[#36546f]">{value}</span></div>)}</div>
            </div>
            <details className="rounded-3xl border border-[#dbe7f1] bg-white p-5 text-sm text-[#55708c]"><summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-[#24435f]">How to read this demo <ChevronDown size={17} /></summary><ul className="mt-4 space-y-3 leading-5"><li><strong>Matching:</strong> ranks candidates using skills, category, availability, deadline, and an explicitly neutral budget component.</li><li><strong>Escrow:</strong> simulated accounting only; the ledger is not a bank balance.</li><li><strong>Verification:</strong> deterministic checks can fail or request manual review. They do not prove factual accuracy.</li><li><strong>Disputes:</strong> the demo operator path is intentionally limited to the synthetic sandbox.</li></ul></details>
            <Link href="/" className="flex items-center gap-2 rounded-3xl border border-[#dbe7f1] bg-[#0b2447] p-5 text-sm font-semibold text-white hover:bg-[#12345d]"><ArrowLeft size={16} /> Back to the product overview</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

function completedRecordAvailable(job: ApiJob | null, escrow: ApiEscrow | null) { return Boolean(job && escrow && ["released", "refunded"].includes(escrow.status)); }

function StepCard({ number, title, intro, children }: { number: string; title: string; intro: string; children: React.ReactNode }) {
  return <div className="rounded-3xl border border-[#dbe7f1] bg-white p-5 shadow-[0_16px_50px_rgba(32,73,110,0.06)] md:p-7"><div className="mb-6 flex items-start gap-4"><span className="rounded-2xl bg-[#eaf5ff] px-3 py-2 text-xs font-bold tracking-[0.14em] text-[#2466a6]">{number}</span><div><h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0b2447]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#55708c]">{intro}</p></div></div>{children}</div>;
}

function Field({ label, value, onChange, hint, multiline = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; hint?: string; multiline?: boolean; type?: string }) {
  const common = "mt-2 w-full rounded-xl border border-[#cad9e6] bg-[#fbfdff] px-3.5 py-3 text-sm text-[#24435f] outline-none transition focus:border-[#3b83bc] focus:ring-4 focus:ring-[#dff0fc]";
  return <label className="block text-sm font-semibold text-[#36546f]"><span>{label}</span>{multiline ? <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} className={common} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={common} />}{hint && <span className="mt-1 block text-xs font-normal leading-5 text-[#7890a5]">{hint}</span>}</label>;
}

function ActionButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) { return <button onClick={onClick} disabled={disabled} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#0b2447] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(11,36,71,0.18)] transition hover:bg-[#12345d] disabled:cursor-not-allowed disabled:opacity-45">{children}</button>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#f7fafc] p-4"><p className="text-xs text-[#7890a5]">{label}</p><p className="mt-1 font-semibold text-[#24435f]">{value}</p></div>; }
function Term({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7890a5]">{label}</dt><dd className="mt-1 leading-6 text-[#36546f]">{value}</dd></div>; }
function LoadingBlock({ label }: { label: string }) { return <div className="flex items-center gap-3 rounded-2xl bg-[#f7fafc] p-6 text-sm text-[#55708c]"><RefreshCw size={17} className="animate-spin" />{label}</div>; }
function EmptyBlock({ label, action, onClick }: { label: string; action: string; onClick: () => void }) { return <div className="rounded-2xl border border-dashed border-[#cbd9e5] p-8 text-center text-sm text-[#55708c]"><p>{label}</p><button onClick={onClick} className="mt-4 rounded-full border border-[#cad9e6] px-4 py-2 text-xs font-semibold text-[#21415e]">{action}</button></div>; }
function VerificationResult({ verification }: { verification: ApiVerification }) { return <div className={`mb-5 rounded-2xl border p-4 ${verification.overall_result === "passed" ? "border-[#b8e0c8] bg-[#effaf4]" : "border-[#f0c6c6] bg-[#fff5f5]"}`}><div className="flex items-center gap-2 font-semibold">{verification.overall_result === "passed" ? <CheckCircle2 className="text-[#187447]" size={18} /> : <XCircle className="text-[#a33a3a]" size={18} />}<span className={verification.overall_result === "passed" ? "text-[#176b43]" : "text-[#8a3030]"}>{verification.overall_result.replaceAll("_", " ")}</span><span className="ml-auto text-xs text-[#6e8499]">score {verification.score ?? "--"}</span></div><div className="mt-3 space-y-2">{verification.individual_checks.map((check, index) => <div key={index} className="flex gap-2 text-xs text-[#55708c]"><span>{check.status === "passed" ? "✓" : "!"}</span><span>{String(check.name)} — {String(check.explanation)}</span></div>)}</div>{verification.reasons.length > 0 && <p className="mt-3 text-xs leading-5 text-[#8a3030]">{verification.reasons.join(" ")}</p>}</div>; }
function RecordSummary({ job, escrow, verification, dispute, events, ledger }: { job: ApiJob | null; escrow: ApiEscrow | null; verification: ApiVerification | null; dispute: ApiDispute | null; events: ApiJobEvent[]; ledger: ApiEscrow["ledger_entries"] }) { return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Summary label="Job state" value={job?.status || "--"} /><Summary label="Escrow state" value={escrow?.status || "--"} /><Summary label="Verification" value={verification?.overall_result || "--"} /><Summary label="Dispute" value={dispute ? `${dispute.status} · ${dispute.resolution || "unresolved"}` : "None"} /></div><div className="rounded-2xl border border-[#dbe7f1] bg-white p-4"><p className="font-semibold text-[#24435f]">Ledger</p>{ledger.length ? <div className="mt-3 space-y-2">{ledger.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 text-xs"><span className="font-medium text-[#36546f]">{entry.entry_type}</span><span className="text-[#55708c]">{formatMoney(entry.amount, entry.currency)}</span><span className="text-[#7890a5]">{new Date(entry.occurred_at).toLocaleString()}</span></div>)}</div> : <p className="mt-2 text-sm text-[#7890a5]">No ledger entries yet.</p>}</div><div className="rounded-2xl border border-[#dbe7f1] bg-white p-4"><p className="font-semibold text-[#24435f]">Audit timeline</p>{events.length ? <div className="mt-3 space-y-3">{events.map((event) => <div key={event.id} className="flex gap-3 text-sm"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2f7bb7]" /><div><p className="font-medium text-[#36546f]">{event.event_type}</p><p className="text-xs leading-5 text-[#7890a5]">{event.description} · {new Date(event.created_at).toLocaleString()}</p></div></div>)}</div> : <p className="mt-2 text-sm text-[#7890a5]">The timeline will appear after the workflow writes its events.</p>}</div></div>; }
