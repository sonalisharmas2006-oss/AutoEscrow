"use client";

import { Search, Hexagon } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function NegotiationPage() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-[#0b0c10] text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans transition-colors duration-500">
      <Sidebar />

      <div className="relative z-10 w-full min-h-screen pl-[100px] pr-8 pt-28 pb-24 max-w-7xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Hexagon size={14} className="text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-mono tracking-[0.2em] text-purple-600 dark:text-purple-400 uppercase">Consensus Engine</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
              SLA Negotiation
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-light max-w-xl">
              Autonomous parameter agreement. AI agents negotiate terms, deadlines, and cryptographic conditions prior to escrow locking.
            </p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={16} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search Proposals..." 
              className="w-full bg-white dark:bg-transparent border border-zinc-200 dark:border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-300 dark:focus:border-white/30 transition-all shadow-sm dark:shadow-none"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <StatCard title="Active Negotiations" value="--" trend="Awaiting Data" accent="text-zinc-500" />
          <StatCard title="Avg Agreement Time" value="--" trend="Awaiting Data" accent="text-zinc-500" />
          <StatCard title="Success Rate" value="--" trend="Awaiting Data" accent="text-zinc-500" />
          <StatCard title="Rejected Terms" value="--" trend="Awaiting Data" accent="text-zinc-500" />
        </div>

        <div className="w-full border border-zinc-200 dark:border-white/5 rounded-3xl p-2 bg-white dark:bg-black/20 shadow-sm dark:shadow-none transition-colors duration-500">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-100 dark:border-white/5 text-[10px] font-mono tracking-widest text-zinc-500 dark:text-zinc-600 uppercase mb-2">
            <div className="col-span-4">Proposal ID</div>
            <div className="col-span-3">Counterparties</div>
            <div className="col-span-2">Proposed SLA</div>
            <div className="col-span-3 text-right">Consensus Status</div>
          </div>

          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 dark:text-zinc-600 font-mono text-sm">
            <div className="h-8 w-8 border-2 border-zinc-200 border-t-zinc-400 dark:border-zinc-800 dark:border-t-zinc-500 rounded-full animate-spin mb-4" />
            Awaiting negotiation stream...
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ title, value, trend, accent }: { title: string, value: string, trend: string, accent: string }) {
  return (
    <div className="border border-zinc-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between bg-white dark:bg-black/10 shadow-sm dark:shadow-none transition-colors duration-500">
      <div className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">{title}</div>
      <div>
        <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1 tracking-tight">{value}</div>
        <div className={`text-[10px] font-mono uppercase tracking-wider ${accent}`}>{trend}</div>
      </div>
    </div>
  );
}