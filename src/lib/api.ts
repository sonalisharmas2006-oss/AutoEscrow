export type ApiJson = Record<string, unknown>;

export interface ApiAgent {
  id: number;
  external_id: string;
  name: string;
  description: string;
  endpoint_url: string | null;
  status: "active" | "inactive" | "suspended";
  availability: "available" | "busy" | "unavailable";
  skills: string[];
  task_categories: string[];
  supported_output_formats: string[];
  estimated_completion_minutes: number | null;
  demo_performance_stats: Record<string, unknown>;
  capabilities: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiJob {
  id: number;
  public_id: string;
  requester_agent_id: number | null;
  executor_agent_id: number | null;
  selected_agent_id: number | null;
  selected_match_run_id: string | null;
  selected_matching_score: string | null;
  selected_scoring_version: string | null;
  title: string;
  description: string;
  required_skills: string[];
  task_category: string;
  expected_output: string;
  acceptance_criteria: string[];
  additional_instructions: string | null;
  budget: string;
  currency: string;
  deadline: string;
  status: "open" | "assigned" | "in_progress" | "submitted" | "under_review" | "completed" | "disputed" | "cancelled";
  requirements: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiMatchCandidate {
  agent_id: number;
  agent_name: string;
  score: string;
  matched_skills: string[];
  missing_skills: string[];
  breakdown: Record<string, unknown>;
  explanation: string;
  warnings: string[];
  eligible: boolean;
  exclusion_reasons: string[];
}

export interface ApiMatchRun {
  job_id: number;
  run_id: string;
  scoring_version: string;
  computed_at: string;
  candidates: ApiMatchCandidate[];
  excluded_agents: ApiMatchCandidate[];
}

export interface ApiAgreement {
  id: number;
  job_id: number;
  requester_agent_id: number;
  executor_agent_id: number;
  proposed_budget: string | null;
  proposed_deadline: string | null;
  currency: string;
  status: "draft" | "proposed" | "revision_requested" | "accepted" | "rejected" | "expired" | "cancelled";
  terms: Record<string, unknown>;
  proposal_history: Record<string, unknown>[];
  amount: string;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  proposal_version: number;
  accepted_version: number | null;
}

export interface ApiLedgerEntry {
  id: number;
  escrow_id: number;
  job_id: number | null;
  idempotency_key: string;
  entry_type: "deposit" | "funding" | "hold" | "release" | "refund" | "fee";
  amount: string;
  currency: string;
  reference: string | null;
  occurred_at: string;
}

export interface ApiEscrow {
  id: number;
  job_id: number;
  agreement_id: number;
  accepted_agreement_version: number | null;
  agreement_version: number | null;
  accepted_amount: string;
  accepted_currency: string;
  funded_amount: string | null;
  currency: string;
  status: "pending" | "funded" | "held" | "released" | "refunded" | "disputed";
  funding_state: "not_funded" | "funded" | "held" | "released" | "refunded" | "disputed";
  provider_reference: string | null;
  funded_at: string | null;
  released_at: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
  amount: string;
  ledger_entries: ApiLedgerEntry[];
}

export interface ApiSubmission {
  id: number;
  job_id: number;
  agent_id: number;
  version: number;
  artifact_url: string;
  content: string | null;
  submitted_output: string;
  evidence: Record<string, unknown>;
  notes: string | null;
  status: "pending" | "accepted" | "rejected";
  submitted_at: string;
}

export interface ApiVerification {
  id: number;
  job_id: number;
  submission_id: number;
  submission_version: number;
  status: "pending" | "passed" | "failed";
  overall_result: "pending" | "passed" | "failed" | "manual_review" | "needs_revision";
  individual_checks: Record<string, unknown>[];
  reasons: string[];
  evaluator_type: "automated" | "human" | "hybrid";
  score: string | null;
  feedback: Record<string, unknown>;
  evaluated_at: string | null;
  verified_at: string | null;
}

export interface ApiExecution {
  job_id: number;
  job_status: ApiJob["status"];
  execution_status: "blocked" | "ready" | "awaiting_submission" | "awaiting_verification" | "retry_available" | "manual_review" | "settlement_ready" | "completed" | "disputed" | "cancelled";
  selected_agent_id: number | null;
  executor_agent_id: number | null;
  agreement_id: number | null;
  accepted_agreement_version: number | null;
  escrow_status: ApiEscrow["status"] | null;
  executor_type: "local_demo";
  can_start: boolean;
  can_submit: boolean;
  can_verify: boolean;
  start_reason: string;
  submit_reason: string;
  verify_reason: string;
  started_at: string | null;
  latest_submission_version: number | null;
  latest_verification_result: ApiVerification["overall_result"] | null;
}

export type ApiDisputeStatus = "open" | "under_review" | "resolved" | "rejected";
export type ApiDisputeResolution = "release" | "refund" | "reject";

export interface ApiDispute {
  id: number;
  job_id: number;
  escrow_id: number | null;
  raised_by_agent_id: number;
  category: "failed_verification" | "deliverable_incomplete" | "agreement_mismatch" | "deadline_issue" | "other";
  status: ApiDisputeStatus;
  reason: string;
  description: string;
  evidence: Record<string, unknown>;
  submission_id: number | null;
  verification_id: number | null;
  previous_job_status: ApiJob["status"] | null;
  previous_escrow_status: ApiEscrow["status"] | null;
  resolution: ApiDisputeResolution | null;
  resolution_rationale: string | null;
  resolved_by_operator: string | null;
  created_at: string;
  reviewed_at: string | null;
  resolved_at: string | null;
  updated_at: string;
  agreement_terms: Record<string, unknown>;
  job_requirements: Record<string, unknown>;
  submission: ApiSubmission | null;
  verification: ApiVerification | null;
  events: ApiJobEvent[];
}

export interface ApiJobEvent {
  id: number;
  job_id: number | null;
  actor_agent_id: number | null;
  event_type: string;
  description: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ApiDashboardMetrics {
  total_jobs: number;
  jobs_in_progress: number;
  completed_jobs: number;
  open_disputes: number;
  total_simulated_escrow_funded: string;
  total_simulated_escrow_settled: string;
  risk_score: string;
}

export interface ApiDashboardExecutionMetrics {
  jobs_running: number;
  jobs_awaiting_submission: number;
  jobs_awaiting_verification: number;
  jobs_eligible_for_settlement: number;
  recent_submissions: ApiSubmission[];
  recent_verifications: ApiVerification[];
}

export interface ApiList<T> {
  items: T[];
  total: number;
}

export interface ApiJobCreateRequest {
  title: string;
  description: string;
  required_skills: string[];
  task_category: string;
  expected_output: string;
  acceptance_criteria: string[];
  budget: string;
  currency: string;
  deadline: string;
  additional_instructions?: string;
  requester_agent_id?: number;
  requirements?: Record<string, unknown>;
}

export interface ApiAgreementTerms {
  scope: string;
  expected_deliverable: string;
  acceptance_criteria: string[];
  verification_method: string;
  cancellation_conditions: string;
  dispute_conditions: string;
  instructions?: string;
  verification_rules?: Record<string, unknown>;
}

export interface ApiAgreementCreateRequest {
  proposed_budget?: string;
  proposed_deadline?: string;
  currency?: string;
  terms?: ApiAgreementTerms;
  rationale?: string;
}

export interface ApiSubmissionCreateRequest {
  submitted_output: string;
  evidence?: Record<string, unknown>;
  notes?: string;
  agent_id?: number;
}

export interface ApiDisputeCreateRequest {
  escrow_id: number;
  category: ApiDispute["category"];
  reason: string;
  description: string;
  evidence?: Record<string, unknown>;
  raised_by_agent_id: number;
}

export interface ApiErrorShape {
  detail?: unknown;
}

export class AutoEscrowApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, detail: unknown) {
    const message = typeof detail === "string" ? detail : JSON.stringify(detail) || "AutoEscrow API request failed";
    super(message);
    this.name = "AutoEscrowApiError";
    this.status = status;
    this.detail = detail;
  }
}

const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const API_BASE_URL = configuredApiUrl.endsWith("/api/v1") ? configuredApiUrl : `${configuredApiUrl}/api/v1`;

async function request<T>(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (response.status === 204) return null as T;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? ((await response.json()) as ApiErrorShape | T) : await response.text();
  if (!response.ok) {
    const detail = typeof payload === "object" && payload !== null && "detail" in payload ? payload.detail : payload;
    throw new AutoEscrowApiError(response.status, detail);
  }
  return payload as T;
}

const path = (value: number | string) => encodeURIComponent(String(value));

export const autoEscrowApi = {
  listAgents(params: { status?: ApiAgent["status"]; availability?: ApiAgent["availability"]; skip?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiAgent>>(`/agents${query.size ? `?${query}` : ""}`);
  },

  getAgent(agentId: number) {
    return request<ApiAgent>(`/agents/${path(agentId)}`);
  },

  createJob(payload: ApiJobCreateRequest) {
    return request<ApiJob>("/jobs", { method: "POST", body: payload });
  },

  listJobs(params: { status?: ApiJob["status"]; task_category?: string; search?: string; skip?: number; limit?: number; sort?: "newest" | "deadline" } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiJob>>(`/jobs${query.size ? `?${query}` : ""}`);
  },

  getJob(jobId: number) {
    return request<ApiJob>(`/jobs/${path(jobId)}`);
  },

  computeMatches(jobId: number) {
    return request<ApiMatchRun>(`/jobs/${path(jobId)}/matches`, { method: "POST" });
  },

  getMatches(jobId: number) {
    return request<ApiMatchRun | null>(`/jobs/${path(jobId)}/matches`);
  },

  selectAgent(jobId: number, agentId: number, runId?: string) {
    return request<ApiJob>(`/jobs/${path(jobId)}/matches/${path(agentId)}/select`, {
      method: "POST",
      body: runId ? { run_id: runId } : undefined,
    });
  },

  getAgreementForJob(jobId: number) {
    return request<ApiAgreement | null>(`/jobs/${path(jobId)}/agreement`);
  },

  createAgreement(jobId: number, payload: ApiAgreementCreateRequest) {
    return request<ApiAgreement>(`/jobs/${path(jobId)}/agreement`, { method: "POST", body: payload });
  },

  getAgreement(agreementId: number) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}`);
  },

  getAgreementHistory(agreementId: number) {
    return request<Record<string, unknown>[]>(`/agreements/${path(agreementId)}/history`);
  },

  reviseAgreement(agreementId: number, payload: ApiAgreementCreateRequest & { action: "request_revision" | "submit_revision" }) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/revise`, { method: "POST", body: payload });
  },

  acceptAgreement(agreementId: number, rationale?: string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/accept`, {
      method: "POST",
      body: rationale ? { rationale } : undefined,
    });
  },

  rejectAgreement(agreementId: number, rationale?: string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/reject`, {
      method: "POST",
      body: rationale ? { rationale } : undefined,
    });
  },

  cancelAgreement(agreementId: number, rationale?: string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/cancel`, {
      method: "POST",
      body: rationale ? { rationale } : undefined,
    });
  },

  fundEscrow(jobId: number, payload: { idempotency_key?: string; reference?: string } = {}) {
    return request<ApiEscrow>(`/jobs/${path(jobId)}/escrow/fund`, { method: "POST", body: payload });
  },

  getEscrowForJob(jobId: number) {
    return request<ApiEscrow | null>(`/jobs/${path(jobId)}/escrow`);
  },

  getEscrow(escrowId: number) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}`);
  },

  getLedger(escrowId: number) {
    return request<ApiLedgerEntry[]>(`/escrows/${path(escrowId)}/ledger`);
  },

  releaseEscrow(escrowId: number) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/release`, { method: "POST" });
  },

  refundEscrow(escrowId: number) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/refund`, { method: "POST" });
  },

  startExecution(jobId: number) {
    return request<ApiExecution>(`/jobs/${path(jobId)}/start`, { method: "POST" });
  },

  getExecution(jobId: number) {
    return request<ApiExecution>(`/jobs/${path(jobId)}/execution`);
  },

  submitJob(jobId: number, payload: ApiSubmissionCreateRequest) {
    return request<ApiSubmission>(`/jobs/${path(jobId)}/submit`, { method: "POST", body: payload });
  },

  getSubmissions(jobId: number) {
    return request<ApiSubmission[]>(`/jobs/${path(jobId)}/submissions`);
  },

  verifyJob(jobId: number) {
    return request<ApiVerification>(`/jobs/${path(jobId)}/verify`, { method: "POST" });
  },

  getVerification(jobId: number) {
    return request<ApiVerification | null>(`/jobs/${path(jobId)}/verification`);
  },

  createDispute(jobId: number, payload: ApiDisputeCreateRequest) {
    return request<ApiDispute>(`/jobs/${path(jobId)}/disputes`, { method: "POST", body: payload });
  },

  getJobDisputes(jobId: number, status?: ApiDisputeStatus) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<ApiDispute[]>(`/jobs/${path(jobId)}/disputes${query}`);
  },

  listDisputes(status?: ApiDisputeStatus) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<ApiDispute[]>(`/disputes${query}`);
  },

  getDispute(disputeId: number) {
    return request<ApiDispute>(`/disputes/${path(disputeId)}`);
  },

  reviewDispute(disputeId: number, rationale?: string, operator = "demo-operator") {
    return request<ApiDispute>(`/disputes/${path(disputeId)}/review`, {
      method: "POST",
      headers: { "X-Demo-Operator": operator },
      body: rationale ? { rationale } : undefined,
    });
  },

  resolveDispute(disputeId: number, resolution: ApiDisputeResolution, rationale: string, operator = "demo-operator") {
    return request<ApiDispute>(`/disputes/${path(disputeId)}/resolve`, {
      method: "POST",
      headers: { "X-Demo-Operator": operator },
      body: { resolution, rationale },
    });
  },

  getDisputeEvents(disputeId: number) {
    return request<ApiJobEvent[]>(`/disputes/${path(disputeId)}/events`);
  },

  getJobEvents(jobId: number) {
    return request<ApiJobEvent[]>(`/jobs/${path(jobId)}/events`);
  },

  getDashboardMetrics() {
    return request<ApiDashboardMetrics>("/dashboard/metrics");
  },

  getDashboardExecution() {
    return request<ApiDashboardExecutionMetrics>("/dashboard/execution");
  },
};

export const formatMoney = (value: string | number | null | undefined, currency = "USD") => {
  if (value === null || value === undefined || value === "") return "--";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} ${currency}`;
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};
