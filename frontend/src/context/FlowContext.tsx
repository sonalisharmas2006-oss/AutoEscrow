"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import {
  ApiAgreement,
  ApiAgreementCreateRequest,
  ApiEscrow,
  ApiExecution,
  ApiJob,
  ApiMatchRun,
  ApiSubmission,
  ApiVerification,
  authState,
  isAgreementFullyAccepted,
  AutoEscrowApiError,
  autoEscrowApi,
} from "@/lib/api";
import { Agent, Transaction, INITIAL_TRANSACTION, MOCK_AGENTS, mapApiAgentToAgent } from "@/data/mockData";

export type FlowStep =
  | "DISCOVER"
  | "IDENTIFY"
  | "ASSESS_RISK"
  | "NEGOTIATE"
  | "ESCROW"
  | "EXECUTE"
  | "PROOF"
  | "VERIFY"
  | "SETTLEMENT"
  | "REPUTATION";

export interface StartTransactionOptions {
  budget?: string;
  currency?: string;
  title?: string;
  description?: string;
  taskCategory?: string;
  expectedOutput?: string;
  acceptanceCriteria?: string[];
  requiredSkills?: string[];
}

interface FlowContextType {
  activeTransaction: Transaction;
  selectedAgent: Agent;
  isLoading: boolean;
  error: string | null;
  setSelectedAgent: (agent: Agent) => void;
  setTransactionStatus: (status: Transaction["status"]) => void;
  verificationOutcome: "IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED";
  setVerificationOutcome: (outcome: "IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED") => void;
  resetSimulation: () => void;
  startTransactionWithAgent: (agent: Agent, options?: StartTransactionOptions) => Promise<Transaction>;
  initializeEscrow: (input: { agentIdentifier?: string; budget: string; currency?: string }) => Promise<Transaction>;
  refreshActiveTransaction: () => Promise<void>;
  proposeAgreement: (payload?: ApiAgreementCreateRequest) => Promise<ApiAgreement>;
  acceptCurrentAgreement: () => Promise<ApiAgreement>;
  fundCurrentEscrow: () => Promise<ApiEscrow>;
  startCurrentExecution: () => Promise<Record<string, unknown>>;
  submitCurrentJob: (payload: { submitted_output: string; evidence?: Record<string, unknown>; notes?: string }) => Promise<ApiSubmission>;
  releaseCurrentEscrow: () => Promise<ApiEscrow>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

const errorMessage = (error: unknown) => {
  if (error instanceof AutoEscrowApiError) return error.message;
  return error instanceof Error ? error.message : "The AutoEscrow backend request failed.";
};

const workflowStatus = (job: ApiJob, escrow: ApiEscrow | null, execution: ApiExecution | null, verification: ApiVerification | null): Transaction["status"] => {
  if (escrow?.status === "released") return "PAYMENT_RELEASED";
  if (escrow?.status === "refunded") return "REFUNDED";
  if (job.status === "disputed" || escrow?.status === "disputed" || execution?.execution_status === "disputed") return "DISPUTED";
  if (verification?.overall_result === "passed") return "VERIFICATION_PASSED";
  if (verification?.overall_result === "failed" || verification?.overall_result === "manual_review") return "VERIFICATION_FAILED";
  if (job.status === "submitted" || job.status === "under_review" || execution?.execution_status === "awaiting_verification") return "VERIFICATION_PENDING";
  if (job.status === "in_progress" || execution?.started_at) return "EXECUTING";
  if (escrow?.status === "funded" || escrow?.status === "held") return "FUNDS_LOCKED";
  if (job.status === "assigned") return "NEGOTIATED";
  return "RISK_ASSESSED";
};

const transactionFromJob = (
  job: ApiJob,
  agent: Agent,
  match?: ApiMatchRun,
  extras: { agreement?: ApiAgreement | null; escrow?: ApiEscrow | null; execution?: ApiExecution | null; verification?: ApiVerification | null } = {},
): Transaction => {
  const selectedCandidate = match?.matches?.find((candidate) => String(candidate.agent_id) === String(agent.backendId));
  const score = selectedCandidate ? Number(selectedCandidate.score) : 0;
  const deadline = job.deadline ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const updatedAt = job.updated_at || job.created_at || new Date().toISOString();
  return {
    id: job.public_id || String(job.id),
    buyer: job.requester_agent_id ? `Requester Agent #${job.requester_agent_id}` : "AutoEscrow Requester",
    provider: agent,
    task: job.title,
    amount: Number(job.budget_amount ?? 0),
    currency: job.currency ?? "VCR",
    status: workflowStatus(job, extras.escrow || null, extras.execution || null, extras.verification || null),
    riskScore: Math.max(0, Math.min(100, Math.round(100 - score))),
    slaMinutes: Math.max(0, Math.round((new Date(deadline).getTime() - Date.now()) / 60000)),
    timestamp: new Date(updatedAt).toLocaleString(),
    backendJobId: job.id,
    publicJobId: job.public_id,
    agreementId: extras.agreement?.id,
    escrowId: extras.escrow?.id,
    executionStatus: extras.execution?.execution_status,
    verificationId: extras.verification?.id,
  };
};

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(MOCK_AGENTS[1]);
  const [activeTransaction, setActiveTransaction] = useState<Transaction>(INITIAL_TRANSACTION);
  const [verificationOutcome, setVerificationOutcome] = useState<"IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED">("IDLE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setTransactionStatus = (status: Transaction["status"]) => {
    setActiveTransaction((previous) => ({ ...previous, status }));
  };

  const run = useCallback(async <T,>(operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await operation();
    } catch (caught) {
      const message = errorMessage(caught);
      setError(message);
      throw caught;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createJobAndSelect = async (agent: Agent, options: StartTransactionOptions = {}) => {
    if (!agent.backendId) throw new Error("This agent is not connected to the AutoEscrow registry yet.");
    const job = await autoEscrowApi.createJob({
      title: options.title || `Task dispatch for ${agent.name}`,
      description: options.description || `Execute the requested task brief for ${agent.name}.`,
      category: options.taskCategory || agent.backendTaskCategories?.[0] || "general",
      required_skills: options.requiredSkills || agent.backendSkills || [],
      required_capabilities: agent.capabilities || [],
      budget_amount: options.budget || (agent.priceAmount > 0 ? agent.priceAmount.toFixed(2) : "35.00"),
      currency: "VCR",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expected_deliverables: (options.expectedOutput || "A structured task result.").split("\n").map((item) => item.trim()).filter(Boolean),
      status: "open",
      visibility: "public",
    });
    const match = await autoEscrowApi.computeMatches(job.id);
    const candidate = match.matches.find((item) => String(item.agent_id) === String(agent.backendId) && item.eligible !== false);
    if (!candidate) {
      throw new Error(`The backend did not return ${agent.name} as a matching agent for this job.`);
    }
    return { job, match };
  };

  const startTransactionWithAgent = async (agent: Agent, options: StartTransactionOptions = {}) => run(async () => {
    const selected = agent.backendId ? agent : selectedAgent.backendId === agent.backendId ? selectedAgent : agent;
    const { job, match } = await createJobAndSelect(selected, options);
    setSelectedAgent(selected);
    const transaction = transactionFromJob(job, selected, match);
    setActiveTransaction(transaction);
    setVerificationOutcome("IDLE");
    return transaction;
  });

  const initializeEscrow = async (input: { agentIdentifier?: string; budget: string; currency?: string }) => run(async () => {
    const registry = await autoEscrowApi.listAgents({ status: "active", availability: "available" });
    const identifier = input.agentIdentifier?.trim().toLowerCase();
    const apiAgent = registry.items.find((agent) =>
      !identifier || String(agent.id) === identifier || (agent.external_id ?? "").toLowerCase() === identifier || agent.name.toLowerCase() === identifier,
    );
    const agent = apiAgent ? mapApiAgentToAgent(apiAgent) : selectedAgent;
    if (!agent.backendId) throw new Error("Enter a registered backend agent id or external id before deploying.");

    const { job, match } = await createJobAndSelect(agent, {
      title: "Smart escrow initialization",
      description: `Funded escrow task assigned to ${agent.name}.`,
      requiredSkills: [],
      taskCategory: "escrow",
      expectedOutput: "A completed escrow task result.",
      acceptanceCriteria: ["The assigned agent returns a verifiable result."],
      budget: input.budget,
      currency: input.currency || "USD",
    });
    const agreement = await autoEscrowApi.createAgreement({
      job_id: String(job.id),
      agent_id: String(agent.backendId),
      terms: {
        scope: job.description,
        deliverables: job.expected_deliverables,
        budget_amount: String(job.budget_amount ?? input.budget),
        currency: "VCR",
        deadline: job.deadline ?? new Date(Date.now() + 7 * 86400000).toISOString(),
        responsibilities: ["Requester provides the brief and timely feedback.", "Agent owner supplies the agreed deliverables."],
        acceptance_conditions: ["The agreed deliverables are supplied and reviewed by the requester."],
      },
    });
    const acceptedAgreement = await autoEscrowApi.acceptAgreement(agreement.id, agreement.current_version_number);
    if (!isAgreementFullyAccepted(acceptedAgreement)) {
      throw new Error("The backend has not confirmed both parties' acceptance. Escrow funding is blocked until the agreement is active.");
    }
    const existingEscrow = await autoEscrowApi.getEscrowForAgreement(acceptedAgreement.id);
    const createdEscrow = existingEscrow ?? await autoEscrowApi.createEscrow(acceptedAgreement.id);
    const fundedEscrow = await autoEscrowApi.fundEscrow(createdEscrow.id, {
      idempotency_key: `autoescrow:escrow:${createdEscrow.id}:fund:v1`,
    });
    const escrow = await autoEscrowApi.getEscrow(fundedEscrow.id);
    setSelectedAgent(agent);
    setActiveTransaction({
      ...transactionFromJob(job, agent, match, { agreement: acceptedAgreement, escrow }),
      status: "FUNDS_LOCKED",
      agreementId: acceptedAgreement.id,
      escrowId: escrow.id,
    });
    setVerificationOutcome("IDLE");
    return transactionFromJob(job, agent, match, { agreement: acceptedAgreement, escrow });
  });

  const refreshActiveTransaction = useCallback(async () => run(async () => {
    if (!activeTransaction.backendJobId || !selectedAgent.backendId) return;
    const job = await autoEscrowApi.getJob(activeTransaction.backendJobId);
    const [agreement, escrow] = await Promise.all([
      autoEscrowApi.getAgreementForJob(job.id),
      autoEscrowApi.getEscrowForJob(job.id),
    ]);
    setActiveTransaction(transactionFromJob(job, selectedAgent, undefined, { agreement, escrow }));
  }), [activeTransaction.backendJobId, selectedAgent, run]);

  const requireJobId = () => {
    if (!activeTransaction.backendJobId) throw new Error("No backend job is active. Start a task from Marketplace first.");
    return activeTransaction.backendJobId;
  };

  const proposeAgreement = async (payload: Partial<ApiAgreementCreateRequest> = {}) => run(async () => {
    const job = await autoEscrowApi.getJob(requireJobId());
    if (!selectedAgent.backendId) throw new Error("Select an agent returned by the live marketplace before creating an agreement.");
    const agreement = await autoEscrowApi.createAgreement({
      job_id: String(job.id),
      agent_id: String(selectedAgent.backendId),
      terms: payload.terms ?? {
        scope: job.description,
        deliverables: job.expected_deliverables ?? [],
        budget_amount: String(job.budget_amount ?? "0"),
        currency: "VCR",
        deadline: job.deadline ?? new Date(Date.now() + 7 * 86400000).toISOString(),
        responsibilities: ["Requester provides the brief and timely feedback.", "Agent owner supplies the agreed deliverables."],
        acceptance_conditions: ["The agreed deliverables are supplied and reviewed by the requester."],
      },
    });
    setActiveTransaction((previous) => ({ ...previous, agreementId: agreement.id, status: "NEGOTIATED" }));
    return agreement;
  });

  const acceptCurrentAgreement = async () => run(async () => {
    if (!activeTransaction.agreementId) throw new Error("No agreement is active for this task.");
    const current = await autoEscrowApi.getAgreement(activeTransaction.agreementId);
    const agreement = await autoEscrowApi.acceptAgreement(current.id, current.current_version_number);
    if (isAgreementFullyAccepted(agreement)) setTransactionStatus("NEGOTIATED");
    return agreement;
  });

  const fundCurrentEscrow = async () => run(async () => {
    if (!activeTransaction.agreementId) throw new Error("Accept the current agreement before funding escrow.");
    const agreement = await autoEscrowApi.getAgreement(activeTransaction.agreementId);
    if (!isAgreementFullyAccepted(agreement)) throw new Error("The backend has not confirmed both parties' agreement acceptance.");
    const created = await autoEscrowApi.createEscrow(agreement.id);
    const escrow = await autoEscrowApi.fundEscrow(created.id, {
      idempotency_key: `autoescrow:escrow:${created.id}:fund:v1`,
    });
    setActiveTransaction((previous) => ({ ...previous, escrowId: escrow.id, status: "FUNDS_LOCKED" }));
    return escrow;
  });

  const startCurrentExecution = async () => run(async () => {
    if (!activeTransaction.escrowId) throw new Error("Fund an escrow before running the deterministic demo adapter.");
    const result = await autoEscrowApi.demoExecuteEscrow(activeTransaction.escrowId);
    const submissions = await autoEscrowApi.getEscrowSubmissions(activeTransaction.escrowId);
    if (submissions.length > 0) {
      setActiveTransaction((previous) => ({ ...previous, status: "VERIFICATION_PENDING", executionStatus: "demo_adapter_submitted" }));
    }
    return result;
  });

  const submitCurrentJob = async (payload: { submitted_output: string; evidence?: Record<string, unknown>; notes?: string }) => run(async () => {
    if (!activeTransaction.escrowId) throw new Error("Fund an escrow before submitting deliverables.");
    const submission = await autoEscrowApi.createEscrowSubmission(activeTransaction.escrowId, {
      summary: payload.submitted_output,
      deliverables: [payload.submitted_output],
      executor: "agent_owner",
    });
    setActiveTransaction((previous) => ({ ...previous, status: "VERIFICATION_PENDING" }));
    return submission;
  });

  const releaseCurrentEscrow = async () => run(async () => {
    if (!activeTransaction.escrowId) throw new Error("No escrow is active for this task.");
    const escrowId = activeTransaction.escrowId;
    const currentEscrow = await autoEscrowApi.getEscrow(escrowId);
    if (String(authState.getUser()?.id) !== String(currentEscrow.buyer_user_id)) {
      throw new Error("Only the escrow buyer can request settlement.");
    }
    const submissions = await autoEscrowApi.getEscrowSubmissions(escrowId);
    if (!submissions.some((item) => item.status === "approved")) {
      throw new Error("Release requires an approved submission.");
    }
    const openDisputes = await autoEscrowApi.listDisputes("open");
    if (openDisputes.some((item) => String(item.escrow_id) === String(escrowId))) {
      throw new Error("Release is blocked while an open dispute exists.");
    }
    if (typeof window !== "undefined" && !window.confirm("Release this simulated VCR escrow? This action cannot be undone.")) {
      throw new Error("Escrow release was cancelled.");
    }
    const result = await autoEscrowApi.releaseEscrow(escrowId, `autoescrow:escrow:${escrowId}:release:v1`);
    const persisted = await autoEscrowApi.getEscrow(escrowId);
    if (persisted.status !== "released") throw new Error(`The backend returned escrow status: ${persisted.status}. Release is not confirmed.`);
    setTransactionStatus("PAYMENT_RELEASED");
    return persisted ?? result;
  });

  const resetSimulation = () => {
    setSelectedAgent(MOCK_AGENTS[1]);
    setActiveTransaction(INITIAL_TRANSACTION);
    setVerificationOutcome("IDLE");
    setError(null);
  };

  return (
    <FlowContext.Provider
      value={{
        activeTransaction,
        selectedAgent,
        isLoading,
        error,
        setSelectedAgent,
        setTransactionStatus,
        verificationOutcome,
        setVerificationOutcome,
        resetSimulation,
        startTransactionWithAgent,
        initializeEscrow,
        refreshActiveTransaction,
        proposeAgreement,
        acceptCurrentAgreement,
        fundCurrentEscrow,
        startCurrentExecution,
        submitCurrentJob,
        releaseCurrentEscrow,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) throw new Error("useFlow must be used within FlowProvider");
  return context;
};
