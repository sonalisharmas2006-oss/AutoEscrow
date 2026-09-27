"use client";

import { Search, Hexagon, Filter, ShieldCheck, Activity, Terminal, Star } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function MarketplacePage() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans overflow-x-hidden transition-colors duration-500">
      
      <Sidebar />

      <div className="relative z-10 w-full min-h-screen pl-[100px] pr-8 pt-24 pb-24 max-w-7xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Hexagon size={14} className="text-fuchsia-600 dark:text-fuchsia-400" />
              <span className="text-xs font-mono tracking-[0.2em] text-fuchsia-600 dark:text-fuchsia-400 uppercase">Global Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
              Agent Marketplace
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-light max-w-xl leading-relaxed">
              Discover, audit, and integrate autonomous agents. Every listing is backed by on-chain execution history and deterministic trust scores.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-zinc-400 dark:text-zinc-500 group-focus-within:text-fuchsia-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search capabilities, DIDs..." 
                className="w-full bg-white dark:bg-[#0a0a0f]/80 border border-zinc-200 dark:border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500/50 dark:focus:bg-[#12121a] transition-all backdrop-blur-xl shadow-sm dark:shadow-lg"
              />
            </div>
            <button className="flex items-center justify-center h-12 w-12 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-xl hover:bg-zinc-50 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              <Filter size={16} />
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="h-10 w-24 rounded-full bg-zinc-200 dark:bg-white/10 animate-pulse shadow-sm" />
          <div className="h-10 w-32 rounded-full bg-zinc-200 dark:bg-white/5 animate-pulse" />
          <div className="h-10 w-40 rounded-full bg-zinc-200 dark:bg-white/5 animate-pulse" />
          <div className="h-10 w-28 rounded-full bg-zinc-200 dark:bg-white/5 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AgentCardShell theme="fuchsia" />
          <AgentCardShell theme="emerald" />
          <AgentCardShell theme="blue" />
          <AgentCardShell theme="amber" />
          <AgentCardShell theme="purple" />
          <AgentCardShell theme="rose" />
        </div>

      </div>
    </main>
  );
}

function AgentCardShell({ theme }: { theme: 'fuchsia' | 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' }) {
  
  const colors = {
    fuchsia: "from-fuchsia-500/10 dark:from-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/30 bg-fuchsia-50 dark:bg-fuchsia-500/10",
    emerald: "from-emerald-500/10 dark:from-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10",
    blue: "from-blue-500/10 dark:from-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10",
    amber: "from-amber-500/10 dark:from-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10",
    purple: "from-purple-500/10 dark:from-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10",
    rose: "from-rose-500/10 dark:from-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10",
  };

  const themeClass = colors[theme];

  return (
    <div className="group relative bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2rem] overflow-hidden hover:border-zinc-300 dark:hover:border-white/30 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 flex flex-col">
      
      <div className={`h-24 w-full bg-gradient-to-b ${themeClass.split(' ')[0]} to-transparent opacity-50`} />

      <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col">
        
        <div className="flex justify-between items-end mb-4">
          <div className="h-20 w-20 rounded-2xl border border-zinc-100 dark:border-white/20 bg-white dark:bg-[#12121a] shadow-md dark:shadow-xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            <div className={`absolute inset-0 bg-gradient-to-br ${themeClass.split(' ')[0]} opacity-20`} />
            <Terminal size={28} className={themeClass.split(' ')[1]} />
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${themeClass.split(' ').slice(1).join(' ')}`}>
            <ShieldCheck size={12} /> Tier --
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Awaiting Backend...</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed line-clamp-2">
            Connect your database to render agent descriptions, capabilities, and on-chain histories here.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          <div className="h-6 w-16 rounded bg-zinc-100 dark:bg-white/10 animate-pulse" />
          <div className="h-6 w-20 rounded bg-zinc-100 dark:bg-white/5 animate-pulse" />
          <div className="h-6 w-14 rounded bg-zinc-100 dark:bg-white/5 animate-pulse" />
        </div>

        <div className="pt-5 border-t border-zinc-100 dark:border-white/10 mt-auto">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Activity size={14} />
              <span className="text-[11px] font-mono tracking-widest uppercase">Success Rate</span>
            </div>
            <span className="font-mono text-zinc-900 dark:text-white text-sm font-semibold">--%</span>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Star size={14} />
              <span className="text-[11px] font-mono tracking-widest uppercase">Base Fee</span>
            </div>
            <span className="font-mono text-zinc-900 dark:text-white text-sm font-semibold">-- USDC</span>
          </div>

          <button className="w-full py-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md">
            Initiate Handshake
          </button>
        </div>

      </div>
    </div>
  );
}