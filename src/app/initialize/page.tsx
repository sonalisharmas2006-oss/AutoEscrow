"use client";

import { Hexagon, Shield, ChevronDown, Lock, Cpu, ArrowRight, Network, Fingerprint } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function InitializeEscrowPage() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans overflow-x-hidden transition-colors duration-500">
      
      <Sidebar />

      <div className="relative z-10 w-full min-h-screen pl-[100px] pr-8 pt-24 pb-24 max-w-6xl mx-auto">
        
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Hexagon size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-mono tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase">Contract Deployment</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
            Initialize Smart Escrow
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-light max-w-xl leading-relaxed">
            Configure multi-sig parameters and SLA conditions. Capital remains cryptographically locked until execution proofs are verified by the network.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm dark:shadow-lg hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Fingerprint size={18} />
                </div>
                1. Assign Counterparty
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3 block">Agent DID / Network Hash</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. 0x..." 
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-black/60 transition-all shadow-inner" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm dark:shadow-lg hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Network size={18} />
                </div>
                2. Verification Schema
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3 block">Required Consensus Layers</label>
                  <div className="flex gap-3">
                    <div className="h-10 flex-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 animate-pulse" />
                    <div className="h-10 flex-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 animate-pulse" />
                    <div className="h-10 flex-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono mt-3">Awaiting backend schema configurations...</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0f]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm dark:shadow-lg hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Lock size={18} />
                </div>
                3. Capital Allocation
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3 block">Asset Token</label>
                  <div className="relative">
                    <select className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-3.5 pl-4 pr-10 text-sm text-zinc-900 dark:text-white font-mono appearance-none focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:bg-white dark:focus:bg-black/60 transition-all cursor-pointer">
                      <option>-- Select --</option>
                      <option>USDC (Base)</option>
                      <option>ETH (Mainnet)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-3 block">Lock Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:bg-white dark:focus:bg-black/60 transition-all shadow-inner" 
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#0a0a0f]/90 dark:to-[#050508]/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 sticky top-32 shadow-xl dark:shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col relative overflow-hidden">
              
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 dark:via-emerald-500/50 to-transparent" />

              <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-500 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Transaction Preview</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-pulse" />
              </div>

              <div className="flex flex-col gap-5 mb-8 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">Escrow Principal</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-400">--</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">Network Fee (0.1%)</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-400">--</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">Gas Estimate</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-400">--</span>
                </div>
                
                <div className="h-px w-full bg-zinc-100 dark:bg-white/5 my-2" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-zinc-200 dark:bg-white/5 rounded animate-pulse" />
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-6 border-t border-zinc-200 dark:border-white/10">
                <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Total Lock</span>
                <span className="text-3xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">--</span>
              </div>

              <button className="group w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                Deploy Smart Contract 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-6">
                <Cpu size={12} className="text-zinc-400 dark:text-zinc-600" />
                <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                  Awaiting backend connection...
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}