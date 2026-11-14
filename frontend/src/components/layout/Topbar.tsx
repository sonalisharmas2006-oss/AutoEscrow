"use client";

import Link from "next/link";
import { Info, Settings } from "lucide-react";

export const Topbar = () => (
 <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#080808]/85 px-4 backdrop-blur-xl sm:px-6">
  <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">AutoEscrow workspace</p><p className="mt-1 text-[11px] text-neutral-500">V2 · backend-scoped demo session</p></div>
  <div className="flex items-center gap-3"><span className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-neutral-400 sm:flex"><Info size={13}/> Simulated ledger only</span><Link href="/settings" aria-label="Session settings" title="Session settings" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-neutral-200 hover:bg-white/10"><Settings size={16}/></Link></div>
 </header>
);
