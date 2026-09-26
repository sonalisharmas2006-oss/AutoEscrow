"use client";

import React, { createContext, useContext, useState } from "react";
import { Agent, Transaction, MOCK_AGENTS, INITIAL_TRANSACTION } from "@/data/mockData";

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

interface FlowContextType {
  activeTransaction: Transaction;
  selectedAgent: Agent;
  setSelectedAgent: (agent: Agent) => void;
  setTransactionStatus: (status: Transaction["status"]) => void;
  verificationOutcome: "IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED";
  setVerificationOutcome: (outcome: "IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED") => void;
  resetSimulation: () => void;
  startTransactionWithAgent: (agent: Agent) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(MOCK_AGENTS[1]);
  const [activeTransaction, setActiveTransaction] = useState<Transaction>({
    ...INITIAL_TRANSACTION,
    provider: MOCK_AGENTS[1],
  });
  const [verificationOutcome, setVerificationOutcome] = useState<"IDLE" | "IN_PROGRESS" | "PASSED" | "FAILED">("IDLE");

  const setTransactionStatus = (status: Transaction["status"]) => {
    setActiveTransaction((prev) => ({ ...prev, status }));
  };

  const startTransactionWithAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTransaction({
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}-AE`,
      buyer: "MasterProtocol Agent (0x4E...8B91)",
      provider: agent,
      task: `Execute verification & task dispatch for ${agent.name}`,
      amount: agent.priceAmount,
      currency: "USDC",
      status: "RISK_ASSESSED",
      riskScore: agent.riskLevel === "Low" ? 18 : agent.riskLevel === "Moderate" ? 44 : 78,
      slaMinutes: 20,
      timestamp: "Just now",
    });
    setVerificationOutcome("IDLE");
  };

  const resetSimulation = () => {
    setSelectedAgent(MOCK_AGENTS[1]);
    setActiveTransaction(INITIAL_TRANSACTION);
    setVerificationOutcome("IDLE");
  };

  return (
    <FlowContext.Provider
      value={{
        activeTransaction,
        selectedAgent,
        setSelectedAgent,
        setTransactionStatus,
        verificationOutcome,
        setVerificationOutcome,
        resetSimulation,
        startTransactionWithAgent,
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