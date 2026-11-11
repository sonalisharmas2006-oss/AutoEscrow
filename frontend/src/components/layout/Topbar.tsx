"use client";

import React from "react";
import { Bell, Info, RefreshCw } from "lucide-react";
import { useFlow } from "@/context/FlowContext";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";

export const Topbar = () => {
  const { activeTransaction, resetSimulation } = useFlow();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/10 bg-white/70 px-6 backdrop-blur-xl dark:border-white/10 dark:bg-[#0A0A0A]/80">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-[#888888]">Active Task:</span>
        <span className="rounded border border-black/15 bg-black/5 px-2 py-1 font-mono text-xs text-black dark:border-white/20 dark:bg-white/10 dark:text-white">
          {activeTransaction.id}
        </span>
        <span className="hidden max-w-sm truncate text-xs text-[#888888] md:inline">
          {activeTransaction.task}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <LiquidButton
          type="button"
          onClick={resetSimulation}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white transition-all hover:bg-white/10"
          title="Reset Flow to Discover state"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Demo</span>
        </LiquidButton>

        <div className="hidden items-center gap-2 rounded-lg border border-black/10 bg-black/[0.03] px-3 py-1.5 text-xs text-[#888888] dark:border-white/10 dark:bg-white/5 dark:text-[#CCCCCC] sm:flex">
          <Info className="h-3.5 w-3.5" />
          <span className="font-semibold">Synthetic demo · no real funds</span>
        </div>

        <LiquidButton type="button" aria-label="Notifications" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10">
          <Bell className="h-4 w-4" />
        </LiquidButton>

        <div className="flex items-center gap-2 border-l border-black/10 pl-2 dark:border-white/10">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 bg-black font-mono text-xs font-bold text-white dark:border-white/20 dark:bg-white dark:text-black">
            MP
          </div>
          <span className="hidden text-xs font-medium text-black dark:text-white lg:inline">MasterProtocol</span>
        </div>
      </div>
    </header>
  );
};
