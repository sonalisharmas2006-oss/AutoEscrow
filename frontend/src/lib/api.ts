export type ApiJson = Record<string, unknown>;

export interface ApiUser {
  id: string;
  wallet_address?: string | null;
  display_name?: string | null;
  email?: string | null;
  role?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApiWallet {
  id: string;
  address: string;
  chain_id?: number;
  label?: string | null;
  is_primary?: boolean;
  created_at?: string;
}

export interface ApiSession {
  id: string;
  user_id: string;
  device_name?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at?: string;
  last_seen_at?: string | null;
  revoked_at?: string | null;
  expires_at?: string | null;
}

export interface ApiAgent {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  capabilities?: string[];
  skills?: string[];
  supported_task_types?: string[];
  task_categories?: string[];
  pricing_model?: string;
  price_amount?: string | number | null;
  currency?: string;
  availability?: string;
  status?: "draft" | "active" | "inactive" | "suspended";
  is_public?: boolean;
  external_id?: string;
  endpoint_url?: string | null;
  metadata?: Record<string, unknown>;
  demo_performance_stats?: Record<string, unknown>;
  estimated_completion_minutes?: number | null;
  supported_output_formats?: string[];
  created_at?: string;
}

export interface ApiJob {
  id: string | number;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  required_capabilities: string[];
  budget_amount: string | number | null;
  currency: string;
  deadline: string | null;
  expected_deliverables: string[];
  status: string;
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  public_id: string;
  requester_agent_id: number | null;
  executor_agent_id: number | null;
  selected_agent_id: number | null;
  selected_match_run_id: string | null;
  selected_matching_score: string | null;
  selected_scoring_version: string | null;
  task_category: string;
  expected_output: string;
  acceptance_criteria: string[];
  additional_instructions: string | null;
  budget: string;
  requirements: Record<string, unknown>;
}

export interface ApiMatchCandidate {
  agent_id: string | number;
  agent_name: string;
  score: string | number;
  matched_skills: string[];
  missing_skills: string[];
  breakdown: Record<string, unknown>;
  explanation: string;
  warnings: string[];
  eligible: boolean;
  exclusion_reasons: string[];
}

export interface ApiMatchRun {
  matches: ApiMatchCandidate[];
  run_id: string;
  scoring_version: string;
  computed_at: string;
  candidates: ApiMatchCandidate[];
  excluded_agents: ApiMatchCandidate[];
  job_id: string | number;
}

export interface ApiAgreement {
  id: string | number;
  job_id: string | number;
  agent_id: string | number;
  status: string;
  terms: Record<string, unknown>;
  terms_hash: string | null;
  version_number: number;
  current_version: number;
  accepted_by_buyer: boolean;
  accepted_by_agent: boolean;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  currency: string;
  amount: string;
  pending_acceptance: boolean;
  proposal_version: number;
  accepted_version: number | null;
  proposal_history: Record<string, unknown>[];
  accepted_amount?: string;
  accepted_currency?: string;
}

export interface ApiEscrow {
  id: string | number;
  agreement_id: string | number;
  status: string;
  amount: string;
  currency: string;
  available_amount: string;
  escrow_locked: string;
  funded_at: string | null;
  created_at: string;
  updated_at: string;
  accepted_amount: string;
  accepted_currency: string;
  ledger_entries: ApiLedgerEntry[];
  reference?: string | null;
}

export interface ApiLedgerEntry {
  id: string | number;
  entry_type: string;
  amount: string;
  currency: string;
  description?: string;
  created_at: string;
  occurred_at: string;
  reference?: string | null;
  idempotency_key?: string | null;
  balance_after?: Record<string, unknown>;
}

export interface ApiSubmission {
  id: string | number;
  job_id: string | number;
  agent_id: string | number;
  status: string;
  submitted_at: string;
  submitted_output: string;
  notes: string | null;
  evidence: Record<string, unknown>;
  version?: string | number;
  submission_id?: string | number;
}

export interface ApiVerification {
  id: string | number;
  job_id: string | number;
  submission_id?: string | number | null;
  overall_result: "pending" | "passed" | "failed" | "manual_review" | "needs_revision";
  details: Record<string, unknown>;
  score: string | number | null;
  created_at: string;
  individual_checks: Array<{ status?: string; name?: string; explanation?: string }>;
  reasons: string[];
}

export interface ApiExecution {
  job_id: string | number;
  execution_status: string;
  can_start: boolean;
  can_submit: boolean;
  can_verify: boolean;
  started_at: string | null;
  start_reason: string;
  submit_reason: string;
  verify_reason: string;
}

export interface ApiDashboardMetrics {
  total_jobs?: number;
  jobs_in_progress?: number;
  completed_jobs?: number;
  open_disputes?: number;
  total_simulated_escrow_funded?: string;
  total_simulated_escrow_settled?: string;
  risk_score?: string;
}

export interface ApiDashboardExecutionMetrics {
  jobs_running?: number;
  jobs_awaiting_submission?: number;
  jobs_awaiting_verification?: number;
  jobs_eligible_for_settlement?: number;
  recent_submissions?: ApiSubmission[];
  recent_verifications?: ApiVerification[];
}

export interface ApiList<T> {
  items: T[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface ApiErrorShape {
  detail?: unknown;
  message?: string;
  error?: string;
}

export interface AuthChallengeResponse {
  message: string;
  nonce: string;
  domain?: string;
  address?: string;
  chain_id?: number;
  issued_at?: string;
  expires_at?: string;
}

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  token_type: string;
  user: ApiUser;
}

export interface ApiJobCreateRequest {
  title: string;
  description: string;
  category?: string;
  task_category?: string;
  required_skills?: string[];
  required_capabilities?: string[];
  budget_amount?: string;
  budget?: string;
  currency?: string;
  deadline?: string;
  expected_deliverables?: string[];
  expected_output?: string;
  acceptance_criteria?: string[];
  status?: string;
  visibility?: "private" | "public";
  additional_instructions?: string;
  requester_agent_id?: number;
  requirements?: Record<string, unknown>;
}

export interface ApiAgreementCreateRequest {
  job_id?: string | number;
  agent_id?: string | number;
  terms?: Record<string, unknown>;
  version_number?: number;
  rationale?: string;
  currency?: string;
  proposed_budget?: string;
  proposed_deadline?: string | null;
}

export interface ApiSubmissionCreateRequest {
  submitted_output: string;
  evidence?: Record<string, unknown>;
  notes?: string;
  agent_id?: number | string;
}

export interface ApiAgreementTerms {
  scope: string;
  expected_deliverable?: string;
  deliverables?: string[];
  acceptance_criteria?: string[];
  verification_method?: string;
  cancellation_conditions?: string;
  dispute_conditions?: string;
  instructions?: string;
  responsibilities?: string[];
  acceptance_conditions?: string[];
  budget_amount?: string;
  currency?: string;
  deadline?: string;
  [key: string]: unknown;
}

export interface ApiDispute {
  id: string | number;
  job_id: string | number;
  escrow_id?: string | number | null;
  category: string;
  status: string;
  reason: string;
  description: string;
  evidence: Record<string, unknown>;
  submission_id?: string | number | null;
  verification_id?: string | number | null;
  previous_job_status?: string | null;
  previous_escrow_status?: string | null;
  resolution?: string | null;
  resolution_rationale?: string | null;
  created_at: string;
  updated_at?: string;
  reviewed_at?: string | null;
  resolved_at?: string | null;
  agreement_terms: Record<string, unknown>;
  job_requirements?: Record<string, unknown>;
  submission?: ApiSubmission | null;
  verification?: ApiVerification | null;
  events?: ApiJobEvent[];
  raised_by_agent_id?: string | number;
}

export interface ApiJobEvent {
  id: string | number;
  job_id?: string | number | null;
  actor_agent_id?: string | number | null;
  event_type: string;
  description: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface ApiDisputeStatus {
  status?: string;
}

export interface ApiDisputeResolution {
  resolution?: string;
  rationale?: string;
}

export interface ApiDemoSession {
  token: string;
  expires_at: string;
  session_scope: string;
  max_jobs: number;
  max_budget: string;
  simulated_escrow: boolean;
}

export class AutoEscrowApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, detail: unknown) {
    const message = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "msg" in item) return String((item as Record<string, unknown>).msg);
            return JSON.stringify(item);
          }).join("; ")
        : typeof detail === "object" && detail !== null && "detail" in detail
          ? JSON.stringify((detail as Record<string, unknown>).detail)
          : JSON.stringify(detail) || "AutoEscrow V2 API request failed";
    super(message);
    this.name = "AutoEscrowApiError";
    this.status = status;
    this.detail = detail;
  }
}

const DEFAULT_BACKEND = "https://autoescrow-api-zaa0.onrender.com";
const configuredApiUrl = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");
const API_BASE_URL = configuredApiUrl.endsWith("/api/v1") ? configuredApiUrl : `${configuredApiUrl}/api/v1`;
const ACCESS_TOKEN_STORAGE_KEY = "autoescrow_v2_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "autoescrow_v2_refresh_token";
const USER_STORAGE_KEY = "autoescrow_v2_user";

const readStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
};

const writeStorage = (key: string, value: string | null) => {
  if (typeof window === "undefined") return;
  if (value === null) {
    window.sessionStorage.removeItem(key);
    return;
  }
  window.sessionStorage.setItem(key, value);
};

let refreshTokenPromise: Promise<string | null> | null = null;

export const authState = {
  getAccessToken: () => readStorage<string>(ACCESS_TOKEN_STORAGE_KEY),
  getRefreshToken: () => readStorage<string>(REFRESH_TOKEN_STORAGE_KEY),
  getUser: () => readStorage<ApiUser>(USER_STORAGE_KEY),
  setTokens: (accessToken: string | null, refreshToken: string | null, user?: ApiUser | null) => {
    writeStorage(ACCESS_TOKEN_STORAGE_KEY, accessToken ?? null);
    writeStorage(REFRESH_TOKEN_STORAGE_KEY, refreshToken ?? null);
    if (user) writeStorage(USER_STORAGE_KEY, JSON.stringify(user));
    else if (typeof window !== "undefined") window.sessionStorage.removeItem(USER_STORAGE_KEY);
  },
  clear: () => {
    writeStorage(ACCESS_TOKEN_STORAGE_KEY, null);
    writeStorage(REFRESH_TOKEN_STORAGE_KEY, null);
    if (typeof window !== "undefined") window.sessionStorage.removeItem(USER_STORAGE_KEY);
    refreshTokenPromise = null;
  },
};

export function normalizeApiPath(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("/api/")) return typeof window === "undefined" ? `${API_BASE_URL}${path.replace(/^\//, "")}` : path;
  if (path.startsWith("/")) return typeof window === "undefined" ? `${API_BASE_URL}${path}` : path;
  return `${API_BASE_URL}/${path}`;
}

const readJsonBody = async (response: Response) => {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as unknown;
  }
  const text = await response.text();
  return text ? text : null;
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authState.getRefreshToken();
  if (!refreshToken) return null;
  refreshTokenPromise ??= request<AuthTokenResponse>("/auth/token/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    skipAuthRefresh: true,
  }).then((payload) => {
    authState.setTokens(payload.access_token, payload.refresh_token, payload.user);
    return payload.access_token;
  }).catch(() => {
    authState.clear();
    return null;
  }).finally(() => {
    refreshTokenPromise = null;
  });
  return refreshTokenPromise;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const url = normalizeApiPath(path);
  const requiresAuth = !/\/auth\/(wallet\/nonce|wallet\/verify|token\/refresh)/.test(path) && !path.endsWith("/health") && !path.endsWith("/ready");
  if (requiresAuth) {
    const accessToken = authState.getAccessToken();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  if (response.status === 401 && requiresAuth && !options.skipAuthRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(url, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      });
    }
  }

  const payload = await readJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      authState.clear();
    }
    const detail = payload && typeof payload === "object" && "detail" in payload ? (payload as Record<string, unknown>).detail : payload;
    throw new AutoEscrowApiError(response.status, detail ?? "The AutoEscrow V2 API request failed.");
  }

  return (payload ?? null) as T;
}

const path = (value: number | string) => encodeURIComponent(String(value));

export async function connectWallet(): Promise<string[]> {
  if (typeof window === "undefined") {
    throw new AutoEscrowApiError(400, "MetaMask is not available in a non-browser environment.");
  }
  const provider = (window as Window & { ethereum?: { request: (args: Record<string, unknown>) => Promise<unknown> } }).ethereum;
  if (!provider) {
    throw new AutoEscrowApiError(400, "MetaMask is not installed or available in this browser.");
  }
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  return accounts;
}

export async function switchWalletToSepolia(): Promise<string> {
  if (typeof window === "undefined") {
    throw new AutoEscrowApiError(400, "MetaMask is not available in a non-browser environment.");
  }
  const provider = (window as Window & { ethereum?: { request: (args: Record<string, unknown>) => Promise<unknown> } }).ethereum;
  if (!provider) {
    throw new AutoEscrowApiError(400, "MetaMask is not installed or available in this browser.");
  }
  const chainId = (await provider.request({ method: "eth_chainId" })) as string;
  if (chainId !== "0xaa36a7") {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  }
  return "0xaa36a7";
}

export async function requestWalletNonce(address: string, chainId = 11155111, purpose = "login") {
  return request<AuthChallengeResponse>("/auth/wallet/nonce", {
    method: "POST",
    body: { address, chain_id: chainId, purpose },
  });
}

export async function verifyWalletSignature(message: string, signature: string) {
  return request<AuthTokenResponse>("/auth/wallet/verify", {
    method: "POST",
    body: { message, signature },
  });
}

export async function createWalletLinkChallenge(address: string, chainId = 11155111) {
  return request<AuthChallengeResponse>("/auth/wallet/link", {
    method: "POST",
    body: { address, chain_id: chainId },
  });
}

export async function linkWallet(address: string, message: string, signature: string) {
  return request<ApiWallet>("/users/me/wallets", {
    method: "POST",
    body: { address, message, signature },
  });
}

const normalizeListResponse = <T>(value: ApiList<T> | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return Array.isArray((value as ApiList<T>).items) ? (value as ApiList<T>).items : [];
};

export const autoEscrowApi = {
  startDemoSession(_accessCode = "") {
    return Promise.reject(new AutoEscrowApiError(410, "Demo session authentication has been removed. Use the V2 wallet SIWE flow instead."));
  },

  resetDemoSession() {
    authState.clear();
    return Promise.resolve({ token: "", expires_at: "", session_scope: "", max_jobs: 0, max_budget: "0", simulated_escrow: false } satisfies ApiDemoSession);
  },

  getDemoSessionToken() {
    return authState.getAccessToken();
  },

  auth: {
    requestWalletNonce,
    verifyWalletSignature,
    createWalletLinkChallenge,
    linkWallet,
    refreshToken: async () => {
      const refreshed = await refreshAccessToken();
      return refreshed ?? null;
    },
    logout: async () => {
      const accessToken = authState.getAccessToken();
      if (!accessToken) {
        authState.clear();
        return null;
      }
      const payload = await request<{ success?: boolean }>("/auth/logout", {
        method: "POST",
        skipAuthRefresh: true,
      });
      authState.clear();
      return payload;
    },
    getUser: async () => request<ApiUser>("/users/me"),
    updateUser: async (changes: Record<string, unknown>) => request<ApiUser>("/users/me", { method: "PATCH", body: changes }),
    listSessions: async () => request<ApiList<ApiSession>>("/auth/sessions"),
    revokeSession: async (sessionId: string) => request<{ success: true }>(`/auth/sessions/${encodeURIComponent(sessionId)}/revoke`, { method: "POST" }),
    listWallets: async () => request<ApiList<ApiWallet>>("/users/me/wallets"),
    unlinkWallet: async (walletId: string) => request<{ success: true }>(`/users/me/wallets/${encodeURIComponent(walletId)}`, { method: "DELETE" }),
  },

  listAgents(params: Record<string, string | number | undefined> = {}, options: { public?: boolean; session?: "required" | "optional" } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    const endpoint = options.public ? "/marketplace/agents" : "/agents";
    return request<ApiList<ApiAgent> | ApiAgent[]>(`${endpoint}${query.size ? `?${query}` : ""}`).then((response) => ({
      items: normalizeListResponse(response),
      total: Array.isArray(response) ? response.length : (response as ApiList<ApiAgent> | null)?.total ?? 0,
    } satisfies ApiList<ApiAgent>));
  },

  listMyAgents(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiAgent>>(`/agents${query.size ? `?${query}` : ""}`);
  },

  getAgent(agentId: number | string, options: { public?: boolean } = {}) {
    const endpoint = options.public ? "/marketplace/agents" : "/agents";
    return request<ApiAgent>(`${endpoint}/${path(agentId)}`);
  },

  createAgent(payload: Partial<ApiAgent> & { name: string }) {
    return request<ApiAgent>("/agents", { method: "POST", body: payload });
  },

  updateAgent(agentId: number | string, payload: Partial<ApiAgent>) {
    return request<ApiAgent>(`/agents/${path(agentId)}`, { method: "PATCH", body: payload });
  },

  deactivateAgent(agentId: number | string) {
    return request<ApiAgent>(`/agents/${path(agentId)}/deactivate`, { method: "POST" });
  },

  listMarketplaceAgents(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiAgent>>(`/marketplace/agents${query.size ? `?${query}` : ""}`);
  },

  getMarketplaceAgent(agentId: number | string) {
    return request<ApiAgent>(`/marketplace/agents/${path(agentId)}`);
  },

  createJob(payload: ApiJobCreateRequest) {
    return request<ApiJob>("/jobs", { method: "POST", body: payload });
  },

  listJobs(params: Record<string, string | number | undefined> = {}, options: { public?: boolean; session?: "required" | "optional" } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    const endpoint = options.public ? "/jobs/public" : "/jobs";
    return request<ApiList<ApiJob> | ApiJob[]>(`${endpoint}${query.size ? `?${query}` : ""}`).then((response) => ({
      items: normalizeListResponse(response),
      total: Array.isArray(response) ? response.length : (response as ApiList<ApiJob> | null)?.total ?? 0,
    } satisfies ApiList<ApiJob>));
  },

  getJob(jobId: number | string) {
    return request<ApiJob>(`/jobs/${path(jobId)}`);
  },

  updateJob(jobId: number | string, payload: Partial<ApiJob>) {
    return request<ApiJob>(`/jobs/${path(jobId)}`, { method: "PATCH", body: payload });
  },

  cancelJob(jobId: number | string) {
    return request<ApiJob>(`/jobs/${path(jobId)}/cancel`, { method: "POST" });
  },

  matchAgents(payload: Record<string, unknown>) {
    return request<{ matches: ApiMatchCandidate[] }>("/matching/agents", { method: "POST", body: payload });
  },

  matchJobAgents(jobId: number | string, payload: Record<string, unknown> = {}) {
    return request<{ matches: ApiMatchCandidate[] }>(`/matching/jobs/${path(jobId)}`, { method: "POST", body: payload });
  },

  createAgreement(...args: [ApiAgreementCreateRequest] | [number | string, ApiAgreementCreateRequest | Record<string, unknown>] | [Record<string, unknown>]) {
    const [first, second] = args;
    const payload = second ?? first;
    return request<ApiAgreement>("/agreements", { method: "POST", body: payload as Record<string, unknown> });
  },

  listAgreements() {
    return request<ApiList<ApiAgreement>>("/agreements");
  },

  getAgreement(agreementId: number | string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}`);
  },

  createAgreementVersion(agreementId: number | string, payload: Record<string, unknown>) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/versions`, { method: "POST", body: payload });
  },

  acceptAgreement(...args: unknown[]) {
    const [first, second] = args;
    const hasAgreementId = typeof first === "number" || typeof first === "string";
    const agreementId = hasAgreementId ? first as number | string : undefined;
    const payload = hasAgreementId ? (typeof second === "string" ? { rationale: second } : (second ?? { version_number: 1 })) : (first ?? { version_number: 1 });
    if (agreementId === undefined) {
      throw new Error("An agreement id is required to accept an agreement.");
    }
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/accept`, { method: "POST", body: payload as Record<string, unknown> });
  },

  createEscrow(payload: { agreement_id: string | number }) {
    return request<ApiEscrow>("/escrows", { method: "POST", body: payload });
  },

  listEscrows() {
    return request<ApiList<ApiEscrow>>("/escrows");
  },

  getEscrow(escrowId: number | string) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}`);
  },

  fundEscrow(escrowId: number | string, payload: { idempotency_key?: string; reference?: string } = {}) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/fund`, { method: "POST", body: payload });
  },

  releaseEscrow(escrowId: number | string, payload: { idempotency_key?: string } = {}) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/release`, { method: "POST", body: payload });
  },

  refundEscrow(escrowId: number | string, payload: { idempotency_key?: string } = {}) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/refund`, { method: "POST", body: payload });
  },

  computeMatches(jobId: number | string) {
    return request<ApiMatchRun>(`/matching/jobs/${path(jobId)}`, { method: "POST" });
  },

  getMatches(jobId: number | string) {
    return request<ApiMatchRun | null>(`/matching/jobs/${path(jobId)}`);
  },

  selectAgent(jobId: number | string, agentId: number | string, runId?: string) {
    return request<ApiJob>(`/jobs/${path(jobId)}`, {
      method: "PATCH",
      body: { selected_agent_id: agentId, selected_match_run_id: runId },
    });
  },

  getAgreementForJob(jobId: number | string, _options?: { session?: "required" | "optional" }) {
    return request<ApiAgreement | null>(`/agreements?job_id=${encodeURIComponent(String(jobId))}`);
  },

  getEscrowForJob(jobId: number | string, _options?: { session?: "required" | "optional" }) {
    return request<ApiEscrow | null>(`/escrows?job_id=${encodeURIComponent(String(jobId))}`);
  },

  getExecution(jobId: number | string, _options?: { session?: "required" | "optional" }) {
    return request<ApiExecution>(`/jobs/${path(jobId)}`);
  },

  getVerification(jobId: number | string, _options?: { session?: "required" | "optional" }) {
    return request<ApiVerification | null>(`/jobs/${path(jobId)}`);
  },

  startExecution(jobId: number | string) {
    return request<ApiExecution>(`/jobs/${path(jobId)}/start`, { method: "POST" });
  },

  submitJob(jobId: number | string, payload: ApiSubmissionCreateRequest) {
    return request<ApiSubmission>(`/jobs/${path(jobId)}/submit`, { method: "POST", body: payload });
  },

  verifyJob(jobId: number | string) {
    return request<ApiVerification>(`/jobs/${path(jobId)}/verify`, { method: "POST" });
  },

  getLedgerBalance() {
    return request<Record<string, unknown>>("/ledger/me");
  },

  getLedgerTransactions() {
    return request<ApiList<ApiLedgerEntry>>("/ledger/me/transactions");
  },

  listSessions() {
    return request<ApiList<ApiSession>>("/auth/sessions");
  },

  revokeSession(sessionId: string) {
    return request<{ success: true }>(`/auth/sessions/${encodeURIComponent(sessionId)}/revoke`, { method: "POST" });
  },

  getCurrentUser() {
    return request<ApiUser>("/users/me");
  },

  updateCurrentUser(payload: Partial<ApiUser>) {
    return request<ApiUser>("/users/me", { method: "PATCH", body: payload });
  },

  getMyWallets() {
    return request<ApiList<ApiWallet>>("/users/me/wallets");
  },

  unlinkWallet(walletId: string) {
    return request<{ success: true }>(`/users/me/wallets/${encodeURIComponent(walletId)}`, { method: "DELETE" });
  },

  getDashboardMetrics(_options?: { session?: "required" | "optional" }) {
    return request<ApiDashboardMetrics>("/dashboard/metrics");
  },

  getDashboardExecution(_options?: { session?: "required" | "optional" }) {
    return request<ApiDashboardExecutionMetrics>("/dashboard/execution");
  },

  getJobDisputes(jobId: number | string, status?: string, _options?: { session?: "required" | "optional" }) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<ApiDispute[]>(`/jobs/${path(jobId)}/disputes${query}`);
  },

  getJobEvents(jobId: number | string, _options?: { session?: "required" | "optional" }) {
    return request<ApiJobEvent[]>(`/jobs/${path(jobId)}/events`);
  },

  getSubmissions(jobId: number | string) {
    return request<ApiSubmission[]>(`/jobs/${path(jobId)}/submissions`);
  },

  getLedger(escrowId: number | string) {
    return request<ApiLedgerEntry[]>(`/escrows/${path(escrowId)}/ledger`);
  },

  createDispute(jobId: number | string, payload: Record<string, unknown>) {
    return request<ApiDispute>(`/jobs/${path(jobId)}/disputes`, { method: "POST", body: payload });
  },

  reviewDispute(disputeId: number | string, rationale: string) {
    return request<ApiDispute>(`/disputes/${path(disputeId)}/review`, { method: "POST", body: { rationale } });
  },

  resolveDispute(disputeId: number | string, resolution: string, rationale: string) {
    return request<ApiDispute>(`/disputes/${path(disputeId)}/resolve`, { method: "POST", body: { resolution, rationale } });
  },

  reviseAgreement(agreementId: number | string, payload: Record<string, unknown>) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/revise`, { method: "POST", body: payload });
  },

  rejectAgreement(agreementId: number | string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/reject`, { method: "POST" });
  },

  cancelAgreement(agreementId: number | string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/cancel`, { method: "POST" });
  },
};

export const formatMoney = (value: string | number | null | undefined, currency = "VCR") => {
  if (value === null || value === undefined || value === "") return "--";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} ${currency}`;
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
};
