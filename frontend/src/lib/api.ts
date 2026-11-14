import { isUnexpectedApiPayload, normalizeApiBaseUrl, normalizeApiRequestPath, parseJsonResponse, summarizeApiFailure } from "./apiHelpers.mjs";

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
  owner_display_name?: string | null;
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
  updated_at?: string;
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
}

export interface ApiMatchReason {
  component?: string;
  score?: number;
  weight?: number;
  contribution?: number;
  explanation?: string;
  [key: string]: unknown;
}

export interface ApiMatchCandidate {
  agent_id: string | number;
  agent_name: string;
  agent: ApiAgent;
  score: number;
  reasons: ApiMatchReason[];
  explanation?: string;
  eligible?: boolean;
  matched_skills?: string[];
  missing_skills?: string[];
  breakdown?: Record<string, unknown>;
  warnings?: string[];
  exclusion_reasons?: string[];
  [key: string]: unknown;
}

export interface ApiMatchRun {
  matches: ApiMatchCandidate[];
  weights?: Record<string, number>;
  run_id?: string;
  scoring_version?: string;
  computed_at?: string;
  candidates?: ApiMatchCandidate[];
  excluded_agents?: ApiMatchCandidate[];
  job_id?: string | number;
  [key: string]: unknown;
}

export interface ApiAgreementVersion {
  id: string;
  version_number: number;
  terms: ApiAgreementTerms;
  terms_hash: string;
  created_by_user_id: string;
  created_at: string;
}

export interface ApiAgreementAcceptance {
  id: string;
  version_number: number;
  user_id: string;
  party: string;
  accepted_at: string;
}

export interface ApiAgreement {
  id: string;
  job_id: string;
  agent_id: string;
  owner_user_id: string;
  agent_owner_user_id: string;
  status: string;
  current_version_number: number;
  current_version: ApiAgreementVersion;
  versions: ApiAgreementVersion[];
  acceptances: ApiAgreementAcceptance[];
  created_at: string;
  updated_at: string;
}

export interface ApiEscrow {
  id: string;
  agreement_id: string;
  buyer_user_id: string;
  agent_owner_user_id: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  job_id?: string | number;
  accepted_amount?: string;
  accepted_currency?: string;
  ledger_entries?: ApiLedgerEntry[];
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

export interface ApiLedgerBalance {
  currency: string;
  label: string;
  available: string;
  escrow_locked: string;
}

export interface ApiLedgerTransaction {
  id: string;
  kind: string;
  amount: string;
  currency: string;
  description: string;
  created_at: string;
}

export interface ApiLedgerHistory {
  items: ApiLedgerTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiSubmission {
  id: string | number;
  escrow_id: string;
  job_id: string;
  attempt: number;
  status: "submitted" | "approved" | "rejected" | "disputed" | string;
  summary: string;
  deliverables: string[];
  executor: string;
  review_note?: string | null;
  created_at: string;
  agent_id?: string | number;
  version?: number;
  artifact_url?: string | null;
  content?: string | null;
  submitted_output?: string;
  evidence?: Record<string, unknown>;
  notes?: string | null;
  submitted_at?: string;
  [key: string]: unknown;
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
  job_id: string | number; job_status: string; execution_status: string;
  selected_agent_id?: number | null; executor_agent_id?: number | null; agreement_id?: number | null;
  accepted_agreement_version?: number | null; escrow_status?: string | null; executor_type: "local_demo";
  can_start: boolean; can_submit: boolean; can_verify: boolean; start_reason: string;
  submit_reason: string; verify_reason: string; started_at: string | null;
  latest_submission_version?: number | null; latest_verification_result?: string | null;
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
  category: string;
  required_skills: string[];
  required_capabilities: string[];
  budget_amount: string;
  currency: "VCR";
  deadline: string;
  expected_deliverables: string[];
  status: "open";
  visibility: "public";
}

export interface ApiAgreementCreateRequest {
  job_id: string;
  agent_id: string;
  terms: {
    scope: string;
    deliverables: string[];
    budget_amount: string;
    currency: "VCR" | string;
    deadline: string;
    responsibilities: string[];
    acceptance_conditions: string[];
  };
}

export interface ApiSubmissionCreateRequest {
  summary: string;
  deliverables: string[];
  executor: string;
}

export interface ApiAgreementTerms {
  scope: string;
  deliverables: string[];
  budget_amount: string;
  currency: string;
  deadline: string;
  responsibilities: string[];
  acceptance_conditions: string[];
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
const configuredApiUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_BACKEND;
const API_BASE_URL = normalizeApiBaseUrl(configuredApiUrl);
const ACCESS_TOKEN_STORAGE_KEY = "autoescrow_v2_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "autoescrow_v2_refresh_token";
const USER_STORAGE_KEY = "autoescrow_v2_user";
const DEMO_SESSION_STORAGE_KEY = "autoescrow_v2_demo_session";

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
  getDemoSessionToken: () => readStorage<string>(DEMO_SESSION_STORAGE_KEY),
  setDemoSessionToken: (token: string | null) => writeStorage(DEMO_SESSION_STORAGE_KEY, token),
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
    writeStorage(DEMO_SESSION_STORAGE_KEY, null);
    refreshTokenPromise = null;
  },
};

export function normalizeApiPath(path: string): string {
  return normalizeApiRequestPath(path, API_BASE_URL);
}

const readJsonBody = async (response: Response) => {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  if (!rawText) return null;

  if (contentType.includes("application/json") || rawText.trim().startsWith("{") || rawText.trim().startsWith("[")) {
    const parsed = parseJsonResponse(rawText, contentType);
    return parsed === rawText ? rawText : parsed;
  }

  if (contentType.includes("text/html") || /<html|<!doctype/i.test(rawText)) {
    if (process.env.NODE_ENV !== "production") {
      console.error("AutoEscrow API returned HTML instead of JSON", { url: response.url, status: response.status, contentType });
    }
    return rawText;
  }

  return rawText;
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
  public?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const url = normalizeApiPath(path);
  const requiresAuth = !options.public && !/\/auth\/(wallet\/nonce|wallet\/verify|token\/refresh)/.test(path) && !path.endsWith("/health") && !path.endsWith("/ready");
  if (requiresAuth) {
    const accessToken = authState.getAccessToken();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const demoSessionToken = options.public ? null : authState.getDemoSessionToken();
  if (demoSessionToken) headers.set("X-Demo-Session", demoSessionToken);

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
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (response.status === 401 && !options.public) {
      authState.clear();
    }

    const detail = summarizeApiFailure(response.status, contentType, payload, url);
    if (process.env.NODE_ENV !== "production") {
      console.error("AutoEscrow API failure", { url, status: response.status, contentType, payload });
    }

    throw new AutoEscrowApiError(response.status, detail);
  }

  if (isUnexpectedApiPayload(payload, contentType)) {
    throw new AutoEscrowApiError(502, summarizeApiFailure(response.status, contentType, payload, url));
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

const normalizeApiList = <T>(value: ApiList<T> | T[] | null | undefined): ApiList<T> => {
  const items = normalizeListResponse(value);
  if (Array.isArray(value)) return { items, total: items.length, limit: items.length, offset: 0 };
  return {
    items,
    total: Number((value as ApiList<T> | null)?.total ?? items.length),
    limit: (value as ApiList<T> | null)?.limit,
    offset: (value as ApiList<T> | null)?.offset,
  };
};

const normalizeMatchRun = (response: ApiMatchRun): ApiMatchRun => {
  const rawMatches = Array.isArray(response.matches) ? response.matches : Array.isArray(response.candidates) ? response.candidates : [];
  const matches = rawMatches.map((candidate) => {
    const rawAgent = candidate.agent && typeof candidate.agent === "object" ? candidate.agent : null;
    const agent = (rawAgent ?? {
      id: candidate.agent_id ?? "",
      name: candidate.agent_name ?? "Unnamed agent",
    }) as ApiAgent;
    return {
      ...candidate,
      agent,
      agent_id: candidate.agent_id ?? agent.id,
      agent_name: candidate.agent_name ?? agent.name,
      score: Number(candidate.score ?? 0),
      reasons: Array.isArray(candidate.reasons) ? candidate.reasons : [],
    };
  });
  return { ...response, matches, candidates: matches };
};

export const isAgreementFullyAccepted = (agreement: ApiAgreement): boolean => {
  const version = agreement.current_version_number;
  const versionAcceptances = (agreement.acceptances ?? []).filter((item) => item.version_number === version);
  const distinctParties = new Set(versionAcceptances.map((item) => item.party || item.user_id).filter(Boolean));
  return ["accepted", "active"].includes(String(agreement.status).toLowerCase()) &&
    version > 0 &&
    distinctParties.size >= 2;
};

export const autoEscrowApi = {
  async startDemoSession(accessCode = "") {
    const session = await request<ApiDemoSession>("/demo/session", { method: "POST", body: { access_code: accessCode } });
    authState.setDemoSessionToken(session.token);
    return session;
  },

  async resetDemoSession() {
    const session = await request<ApiDemoSession>("/demo/session/reset", { method: "POST" });
    authState.setDemoSessionToken(session.token);
    return session;
  },

  getDemoSessionToken() {
    return authState.getDemoSessionToken();
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
    return request<ApiList<ApiAgent> | ApiAgent[]>(`${endpoint}${query.size ? `?${query}` : ""}`, { public: options.public }).then(normalizeApiList);
  },

  listMyAgents(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiAgent>>(`/agents${query.size ? `?${query}` : ""}`);
  },

  getAgent(agentId: number | string, options: { public?: boolean } = {}) {
    const endpoint = options.public ? "/marketplace/agents" : "/agents";
    return request<ApiAgent>(`${endpoint}/${path(agentId)}`, { public: options.public });
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
    return request<ApiList<ApiAgent> | ApiAgent[]>(`/marketplace/agents${query.size ? `?${query}` : ""}`, { public: true }).then(normalizeApiList);
  },

  getMarketplaceAgent(agentId: number | string) {
    return request<ApiAgent>(`/marketplace/agents/${path(agentId)}`, { public: true });
  },

  createJob(payload: ApiJobCreateRequest) {
    return request<ApiJob>("/jobs", { method: "POST", body: payload });
  },

  listJobs(params: Record<string, string | number | undefined> = {}, options: { public?: boolean; session?: "required" | "optional" } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    void options;
    const endpoint = "/jobs";
    return request<ApiList<ApiJob> | ApiJob[]>(`${endpoint}${query.size ? `?${query}` : ""}`).then(normalizeApiList);
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
    void payload;
    return Promise.reject(new AutoEscrowApiError(501, "V2 matching requires an existing job. Create a job before requesting matches."));
  },

  matchJobAgents(jobId: number | string) {
    return request<ApiMatchRun>(`/matching/jobs/${path(jobId)}`, { method: "POST" }).then(normalizeMatchRun);
  },

  createAgreement(payload: ApiAgreementCreateRequest) {
    return request<ApiAgreement>("/agreements", { method: "POST", body: payload });
  },

  async getAgreementForJob(jobId: number | string) {
    const agreements = normalizeApiList(await request<ApiList<ApiAgreement> | ApiAgreement[]>("/agreements?limit=100&offset=0"));
    return agreements.items.find((agreement) => String(agreement.job_id) === String(jobId)) ?? null;
  },

  listAgreements(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiAgreement> | ApiAgreement[]>(`/agreements${query.size ? `?${query}` : ""}`).then(normalizeApiList);
  },

  getAgreement(agreementId: number | string) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}`);
  },

  createAgreementVersion(agreementId: number | string, payload: Record<string, unknown>) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/versions`, { method: "POST", body: payload });
  },

  acceptAgreement(agreementId: string | number, versionNumber: number) {
    return request<ApiAgreement>(`/agreements/${path(agreementId)}/accept`, { method: "POST", body: { version_number: versionNumber } });
  },

  createEscrow(agreementId: string | number) {
    return request<ApiEscrow>("/escrows", { method: "POST", body: { agreement_id: String(agreementId) } });
  },

  listEscrows(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiList<ApiEscrow> | ApiEscrow[]>(`/escrows${query.size ? `?${query}` : ""}`).then(normalizeApiList);
  },

  getEscrow(escrowId: number | string) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}`);
  },

  fundEscrow(escrowId: number | string, payload: { idempotency_key: string }) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/fund`, { method: "POST", body: payload });
  },

  releaseEscrow(escrowId: number | string, idempotencyKey = `release-${escrowId}-v1`) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/release`, { method: "POST", body: { idempotency_key: idempotencyKey } });
  },

  refundEscrow(escrowId: number | string, idempotencyKey = `refund-${escrowId}-v1`) {
    return request<ApiEscrow>(`/escrows/${path(escrowId)}/refund`, { method: "POST", body: { idempotency_key: idempotencyKey } });
  },

  computeMatches(jobId: number | string) {
    return autoEscrowApi.matchJobAgents(jobId);
  },

  getMatches(_jobId: number | string) {
    return Promise.reject(new AutoEscrowApiError(501, "The backend exposes matching as a POST computation; rerun matching to refresh results."));
  },

  async getEscrowForAgreement(agreementId: number | string) {
    const escrows = await autoEscrowApi.listEscrows({ limit: 100, offset: 0 });
    return escrows.items.find((item) => String(item.agreement_id) === String(agreementId)) ?? null;
  },

  async getEscrowForJob(jobId: number | string) {
    const agreement = await autoEscrowApi.getAgreementForJob(jobId);
    if (!agreement) return null;
    return autoEscrowApi.getEscrowForAgreement(agreement.id);
  },

  submitJob(escrowId: number | string, payload: ApiSubmissionCreateRequest) {
    return request<ApiSubmission>(`/escrows/${path(escrowId)}/submissions`, { method: "POST", body: payload });
  },

  getLedgerBalance() {
    return request<ApiLedgerBalance>("/ledger/me");
  },

  getLedgerTransactions(params: Record<string, string | number | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && query.set(key, String(value)));
    return request<ApiLedgerHistory>(`/ledger/me/transactions${query.size ? `?${query}` : ""}`);
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

  async getSubmissions(jobId: number | string) {
    const escrow = await autoEscrowApi.getEscrowForJob(jobId);
    return escrow ? autoEscrowApi.getEscrowSubmissions(escrow.id) : [];
  },

  async getEscrowSubmissions(escrowId: number | string) {
    const response = await request<ApiList<ApiSubmission> | ApiSubmission[]>(`/escrows/${path(escrowId)}/submissions`);
    return normalizeListResponse(response);
  },

  createEscrowSubmission(escrowId: number | string, payload: ApiSubmissionCreateRequest) {
    return request<ApiSubmission>(`/escrows/${path(escrowId)}/submissions`, { method: "POST", body: payload });
  },

  demoExecuteEscrow(escrowId: number | string) {
    return request<Record<string, unknown>>(`/escrows/${path(escrowId)}/demo-execute`, { method: "POST" });
  },

  reviewSubmission(submissionId: number | string, decision: "approve" | "reject", note: string) {
    return request<ApiSubmission>(`/submissions/${path(submissionId)}/review`, { method: "POST", body: { decision, note } });
  },

  createSubmissionDispute(submissionId: number | string, reason: string) {
    if (reason.trim().length < 10) throw new Error("Please explain the dispute in at least 10 characters.");
    return request<ApiDispute>(`/submissions/${path(submissionId)}/disputes`, { method: "POST", body: { reason: reason.trim() } });
  },

  getLedger(escrowId: number | string) {
    return request<ApiLedgerEntry[]>(`/escrows/${path(escrowId)}/ledger`);
  },

  async listDisputes(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await request<ApiList<ApiDispute> | ApiDispute[]>(`/disputes${query}`);
    return normalizeListResponse(response);
  },

  resolveDispute(disputeId: number | string, resolution: "release" | "refund", note: string) {
    if (note.trim().length < 10) throw new Error("Resolution note must contain at least 10 characters.");
    return request<ApiDispute>(`/disputes/${path(disputeId)}/resolve`, { method: "POST", body: { resolution, note: note.trim() } });
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
