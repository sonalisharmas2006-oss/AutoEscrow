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
  startCurrentExecution: () => Promise<ApiExecution>;
  submitCurrentJob: (payload: { submitted_output: string; evidence?: Record<string, unknown>; notes?: string }) => Promise<ApiSubmission>;
  verifyCurrentJob: () => Promise<ApiVerification>;
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
  const selectedCandidate = match?.candidates.find((candidate) => candidate.agent_id === agent.backendId);
  const score = selectedCandidate ? Number(selectedCandidate.score) : 82;
  return {
    id: job.public_id || String(job.id),
    buyer: job.requester_agent_id ? `Requester Agent #${job.requester_agent_id}` : "AutoEscrow Requester",
    provider: agent,
    task: job.title,
    amount: Number(job.budget),
    currency: job.currency,
    status: workflowStatus(job, extras.escrow || null, extras.execution || null, extras.verification || null),
    riskScore: Math.max(0, Math.min(100, Math.round(100 - score))),
    slaMinutes: Math.max(0, Math.round((new Date(job.deadline).getTime() - Date.now()) / 60000)),
    timestamp: new Date(job.updated_at || job.created_at).toLocaleString(),
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
      description: options.description || `Execute the requested AutoEscrow task with ${agent.name}.`,
      required_skills: options.requiredSkills || agent.backendSkills || [],
      task_category: options.taskCategory || agent.backendTaskCategories?.[0] || "general",
      expected_output: options.expectedOutput || "A structured task result.",
      acceptance_criteria: options.acceptanceCriteria || ["The requested output is returned and can be verified."],
      budget: options.budget || (agent.priceAmount > 0 ? agent.priceAmount.toFixed(2) : "35.00"),
      currency: options.currency || "USD",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      additional_instructions: "Created by the AutoEscrow frontend integration.",
    });
    const match = await autoEscrowApi.computeMatches(job.id);
    const candidate = match.candidates.find((item) => item.agent_id === agent.backendId && item.eligible);
    if (!candidate) {
      throw new Error(`The backend did not mark ${agent.name} as an eligible match for this job.`);
    }
    const selectedJob = await autoEscrowApi.selectAgent(job.id, agent.backendId, match.run_id);
    return { job: selectedJob, match };
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
      !identifier || String(agent.id) === identifier || agent.external_id.toLowerCase() === identifier || agent.name.toLowerCase() === identifier,
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
    const agreement = await autoEscrowApi.createAgreement(job.id, {
      currency: job.currency,
      terms: {
        scope: job.description,
        expected_deliverable: job.expected_output,
        acceptance_criteria: job.acceptance_criteria,
        verification_method: "Deterministic backend verification",
        cancellation_conditions: "Cancel only before execution starts.",
        dispute_conditions: "Open a dispute when the deliverable or verification result is contested.",
      },
    });
    const acceptedAgreement = await autoEscrowApi.acceptAgreement(agreement.id);
    const escrow = await autoEscrowApi.fundEscrow(job.id, {
      idempotency_key: `frontend-${job.id}`,
      reference: "frontend-initialization",
    });
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
    const [agreement, escrow, execution, verification] = await Promise.all([
      autoEscrowApi.getAgreementForJob(job.id),
      autoEscrowApi.getEscrowForJob(job.id),
      autoEscrowApi.getExecution(job.id),
      autoEscrowApi.getVerification(job.id),
    ]);
    setActiveTransaction(transactionFromJob(job, selectedAgent, undefined, { agreement, escrow, execution, verification }));
    if (verification?.overall_result === "passed") setVerificationOutcome("PASSED");
    if (verification?.overall_result === "failed" || verification?.overall_result === "manual_review") setVerificationOutcome("FAILED");
  }), [activeTransaction.backendJobId, selectedAgent, run]);

  const requireJobId = () => {
    if (!activeTransaction.backendJobId) throw new Error("No backend job is active. Start a task from Marketplace first.");
    return activeTransaction.backendJobId;
  };

  const proposeAgreement = async (payload: ApiAgreementCreateRequest = {}) => run(async () => {
    const agreement = await autoEscrowApi.createAgreement(requireJobId(), payload);
    setActiveTransaction((previous) => ({ ...previous, agreementId: agreement.id, status: "NEGOTIATED" }));
    return agreement;
  });

  const acceptCurrentAgreement = async () => run(async () => {
    if (!activeTransaction.agreementId) throw new Error("No agreement is active for this task.");
    const agreement = await autoEscrowApi.acceptAgreement(activeTransaction.agreementId);
    setTransactionStatus("NEGOTIATED");
    return agreement;
  });

  const fundCurrentEscrow = async () => run(async () => {
    const escrow = await autoEscrowApi.fundEscrow(requireJobId(), {
      idempotency_key: `frontend-${requireJobId()}`,
      reference: "frontend-funding",
    });
    setActiveTransaction((previous) => ({ ...previous, escrowId: escrow.id, status: "FUNDS_LOCKED" }));
    return escrow;
  });

  const startCurrentExecution = async () => run(async () => {
    const execution = await autoEscrowApi.startExecution(requireJobId());
    setActiveTransaction((previous) => ({ ...previous, executionStatus: execution.execution_status, status: "EXECUTING" }));
    return execution;
  });

  const submitCurrentJob = async (payload: { submitted_output: string; evidence?: Record<string, unknown>; notes?: string }) => run(async () => {
    const submission = await autoEscrowApi.submitJob(requireJobId(), {
      ...payload,
      agent_id: selectedAgent.backendId,
    });
    setActiveTransaction((previous) => ({ ...previous, status: "VERIFICATION_PENDING" }));
    return submission;
  });

  const verifyCurrentJob = async () => run(async () => {
    setVerificationOutcome("IN_PROGRESS");
    try {
      const verification = await autoEscrowApi.verifyJob(requireJobId());
      const passed = verification.overall_result === "passed";
      setVerificationOutcome(passed ? "PASSED" : "FAILED");
      setActiveTransaction((previous) => ({ ...previous, verificationId: verification.id, status: passed ? "VERIFICATION_PASSED" : "VERIFICATION_FAILED" }));
      return verification;
    } catch (caught) {
      setVerificationOutcome("FAILED");
      throw caught;
    }
  });

  const releaseCurrentEscrow = async () => run(async () => {
    if (!activeTransaction.escrowId) throw new Error("No escrow is active for this task.");
    const escrow = await autoEscrowApi.releaseEscrow(activeTransaction.escrowId);
    setTransactionStatus("PAYMENT_RELEASED");
    return escrow;
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
        verifyCurrentJob,
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
