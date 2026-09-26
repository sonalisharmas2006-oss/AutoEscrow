"use client";

import React from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { TrustScoreBadge } from "@/components/ui/TrustScoreBadge";
import { MOCK_AGENTS } from "@/data/mockData";
import { useFlow } from "@/context/FlowContext";
import { ArrowUpRight, ShieldCheck, Lock, Activity, CheckCircle, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const chartData = [
  { day: "Mon", transactions: 12, trust: 92 },
  { day: "Tue", transactions: 18, trust: 93 },
  { day: "Wed", transactions: 15, trust: 93.5 },
  { day: "Thu", transactions: 24, trust: 94.1 },
  { day: "Fri", transactions: 32, trust: 94.7 },
];

export default function DashboardPage() {
  const { activeTransaction, startTransactionWithAgent } = useFlow();

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Transactions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold mt-2 text-white">08</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>+2 autonomous in flight</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Escrow Locked</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold mt-2 text-white">$2,840</div>
          <div className="text-[11px] text-slate-400 mt-1">Smart Contract Escrow (USDC)</div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Successful Verifications</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold mt-2 text-white">97.4%</div>
          <div className="text-[11px] text-emerald-400 mt-1">Multi-layer SLA compliance</div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Network Trust Score</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-mono font-bold mt-2 text-white">94.7</div>
          <div className="text-[11px] text-slate-400 mt-1">Autonomous Prime tier</div>
        </GlassCard>
      </div>

      {/* Transaction Pipeline Visualization */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Autonomous Transaction Pipeline</h3>
            <p className="text-xs text-slate-400">Current active flow for {activeTransaction.id}</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Status: {activeTransaction.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs">
          {[
            { label: "Discovery", active: true },
            { label: "Risk Assess", active: true },
            { label: "Negotiate", active: activeTransaction.status !== "DISCOVERY" },
            { label: "Escrow Lock", active: ["FUNDS_LOCKED", "EXECUTING", "VERIFICATION_PENDING", "VERIFICATION_PASSED", "PAYMENT_RELEASED"].includes(activeTransaction.status) },
            { label: "Execution", active: ["EXECUTING", "VERIFICATION_PENDING", "VERIFICATION_PASSED", "PAYMENT_RELEASED"].includes(activeTransaction.status) },
            { label: "Verification", active: ["VERIFICATION_PENDING", "VERIFICATION_PASSED", "PAYMENT_RELEASED"].includes(activeTransaction.status) },
            { label: "Settlement", active: ["VERIFICATION_PASSED", "PAYMENT_RELEASED"].includes(activeTransaction.status) },
          ].map((pipe) => (
            <div
              key={pipe.label}
              className={`p-3 rounded-xl border transition-all ${
                pipe.active
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                  : "bg-white/[0.02] border-white/5 text-slate-500"
              }`}
            >
              {pipe.label}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Charts & Available Agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Settlement Volume & Trust Velocity</h3>
            <span className="text-xs text-slate-400">Last 5 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0D111A",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2} fill="url(#colorTx)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Quick Agent Dispatch */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Fast Dispatch Agents</h3>
            <Link href="/discover" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_AGENTS.slice(0, 3).map((agent) => (
              <div key={agent.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{agent.name}</div>
                  <div className="text-[11px] text-slate-400">{agent.category} · {agent.priceRate}</div>
                </div>
                <Link
                  href="/risk"
                  onClick={() => startTransactionWithAgent(agent)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-semibold text-xs transition-all"
                >
                  Hire
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}