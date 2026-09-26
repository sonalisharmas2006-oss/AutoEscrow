"use client";

import React from "react";
import { Bell, Wallet, ShieldCheck, RefreshCw } from "lucide-react";
import { useFlow } from "@/context/FlowContext";

export const Topbar = () => {
  const { activeTransaction, resetSimulation } = useFlow();

  return (
    <header className="h-16 border-b border-white/5 bg-[#090C14]/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400">Active Task:</span>
        <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/10 text-emerald-400">
          {activeTransaction.id}
        </span>
        <span className="text-xs text-slate-400 hidden md:inline truncate max-w-sm">
          {activeTransaction.task}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={resetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all bg-white/[0.02]"
          title="Reset Flow to Discover state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Demo</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs">
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-slate-200">2,840 USDC</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-semibold">Trust 94.7</span>
        </div>

        <button className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white bg-white/[0.02]">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-black">
            MP
          </div>
          <span className="text-xs font-medium text-slate-300 hidden lg:inline">MasterProtocol</span>
        </div>
      </div>
    </header>
  );
};