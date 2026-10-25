"use client";

import React from "react";
import { Bell, Info, RefreshCw } from "lucide-react";
import { useFlow } from "@/context/FlowContext";

export const Topbar = () => {
  const { activeTransaction, resetSimulation } = useFlow();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 bg-white/45 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-slate-500">Active Task:</span>
        <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-xs text-emerald-700">
          {activeTransaction.id}
        </span>
        <span className="hidden max-w-sm truncate text-xs text-slate-500 md:inline">
          {activeTransaction.task}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={resetSimulation}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/60 px-3 py-1.5 text-xs text-slate-600 transition-all hover:border-emerald-300 hover:text-emerald-700"
          title="Reset Flow to Discover state"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reset Demo</span>
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs text-cyan-700 sm:flex">
          <Info className="h-3.5 w-3.5" />
          <span className="font-semibold">Synthetic demo · no real funds</span>
        </div>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/60 text-slate-500 hover:text-slate-900">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-400 text-xs font-bold text-slate-950">
            MP
          </div>
          <span className="hidden text-xs font-medium text-slate-600 lg:inline">MasterProtocol</span>
        </div>
      </div>
    </header>
  );
};
