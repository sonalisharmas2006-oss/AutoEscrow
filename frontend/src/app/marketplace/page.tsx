"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Hexagon, Filter, ShieldCheck, Activity, Terminal, Star } from "lucide-react";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { autoEscrowApi } from "@/lib/api";
import { Agent, mapApiAgentToAgent } from "@/data/mockData";

export default function MarketplacePage() {
  const router = useRouter();
  const isLoading = false;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoaded(false); setError(null);
    autoEscrowApi.listAgents({}, { public: true }).then((response) => {
      const items = Array.isArray(response?.items) ? response.items : [];
      if (active) setAgents(items.map(mapApiAgentToAgent));
    }).catch((caught: unknown) => {
      if (active) setError(caught instanceof Error ? caught.message : "Unable to load registered agents.");
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [retry]);

  const visibleAgents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return agents.filter((agent) => (!availableOnly || agent.availability === "available") && (!query || [agent.name, agent.externalId, agent.description, ...agent.capabilities].some((value) => value?.toLowerCase().includes(query))));
  }, [agents, search, availableOnly]);

  const handleHandshake = async (agent: Agent) => {
    setError(null);
    try {
      if (agent.backendId) {
        router.push(`/marketplace?agent=${agent.backendId}`);
        return;
      }
      setError("This marketplace profile is not linked to a live V2 agent record yet.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The backend could not create this handshake.");
    }
  };

  return (
    <main className="marketplace-page relative flex min-h-screen w-full bg-transparent font-sans text-white selection:bg-white selection:text-black">
      <div className="relative z-10 min-h-screen w-full max-w-7xl min-w-0 mx-auto px-6 pb-28 pt-14 sm:px-8 lg:px-12">
        
        <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Hexagon size={14} className="text-[#CCCCCC]" />
              <span className="text-xs font-mono tracking-[0.2em] text-[#CCCCCC] uppercase">Live V2 marketplace</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Agent Marketplace
            </h1>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-[#A3A3A3] md:text-base">
               Browse the authenticated marketplace exposed by the backend. Use your wallet to access the live V2 agent registry and verified profile data.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative group min-w-0 flex-1 lg:w-80">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-[#888888] transition-colors group-focus-within:text-white" />
              </div>
              <input 
                type="text" 
                placeholder="Search names or capabilities…"
                aria-label="Search agent capabilities"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-full border border-white/15 bg-white/[0.04] py-3.5 pl-12 pr-6 text-sm text-white placeholder-[#888888] shadow-sm backdrop-blur-xl transition-all focus:border-white/35 focus:bg-white/[0.06] focus:outline-none"
              />
            </div>
             <LiquidButton type="button" onClick={() => setAvailableOnly(!availableOnly)} aria-pressed={availableOnly} title="Show only available agents" aria-label="Show only available agents" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white shadow-sm backdrop-blur-xl ${availableOnly ? "ring-2 ring-white/30" : ""}`}>
              <Filter size={16} />
            </LiquidButton>
          </div>
        </header>

         {error && <div className="error-panel" role="alert"><p>Registry unavailable: {error}</p><LiquidButton type="button" onClick={() => setRetry(retry + 1)} className="mt-3 px-4 py-2 text-sm">Retry registry</LiquidButton></div>}

         {error ? null : !loaded ? <div className="rounded-3xl border border-dashed border-white/15 p-16 text-center text-sm text-[#888888]">Loading live marketplace agents…</div> : visibleAgents.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {visibleAgents.map((agent) => <AgentCardShell key={agent.id} agent={agent} onHandshake={handleHandshake} disabled={isLoading} />)}
         </div> : <div className="rounded-3xl border border-dashed border-white/15 p-16 text-center text-sm text-[#888888]">{search.trim() ? "No agents match this search." : "No live agents are currently available from the V2 registry."}</div>}

      </div>
    </main>
  );
}

function AgentCardShell({
  agent,
  onHandshake,
  disabled,
}: {
  agent?: Agent;
  onHandshake: (agent: Agent) => void;
  disabled?: boolean;
}) {

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-xl">
      
      <div className="h-24 w-full bg-gradient-to-b from-white/[0.08] to-transparent opacity-50" />

      <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col">
        
        <div className="flex justify-between items-end mb-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] shadow-md transition-transform duration-500 group-hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent opacity-20" />
            <Terminal size={28} className="text-[#CCCCCC]" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#CCCCCC]">
             <ShieldCheck size={12} /> Live V2 profile
          </div>
        </div>

        <div className="mb-4">
           <h3 className="mb-2 text-xl font-bold text-white">{agent?.name || "Awaiting Backend..."}</h3>
           <p className="line-clamp-2 text-sm font-light leading-relaxed text-[#A3A3A3]">
             {agent?.description || "No description supplied by the registry."}
           </p>
        </div>

         <div className="flex flex-wrap gap-2 mb-6 mt-auto">
           {(Array.isArray(agent?.capabilities) ? agent.capabilities : []).slice(0, 3).map((capability) => (
              <span key={capability} className="rounded bg-white/[0.06] px-2 py-1 text-[10px] text-[#CCCCCC]">{capability}</span>
           ))}
           {!agent && <>
              <div className="h-6 w-16 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-6 w-20 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-6 w-14 animate-pulse rounded bg-white/[0.06]" />
           </>}
        </div>

         <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex justify-between items-center mb-5">
             <div className="flex items-center gap-2 text-[#888888]">
              <Activity size={14} />
              <span className="text-[11px] font-mono tracking-widest uppercase">Estimate</span>
            </div>
              <span className="font-mono text-sm font-semibold text-[#CCCCCC]">{agent?.avgResponseTime || "N/A"}</span>
          </div>
          
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 text-[#888888]">
              <Star size={14} />
              <span className="text-[11px] font-mono tracking-widest uppercase">Pricing</span>
            </div>
             <span className="font-mono text-sm font-semibold text-[#CCCCCC]">Set in agreement</span>
          </div>

            <details className="mb-5 text-xs text-[#A3A3A3]"><summary className="cursor-pointer">Profile details</summary><p className="mt-2">Availability: {agent?.availability ?? "unknown"} · Status: {agent?.status ?? "unknown"}</p><p>Categories: {agent?.backendTaskCategories?.join(", ") || "Not provided"}</p><p>Output formats: {agent?.supportedFormats?.join(", ") || "Not provided"}</p><p className="mt-2">Live V2 registry metadata is surfaced here; capability claims require a real wallet-authenticated session.</p></details>
            <LiquidButton type="button" disabled={!agent || disabled || agent.availability !== "available" || agent.status !== "active"} onClick={() => agent && onHandshake(agent)} className="w-full rounded-xl py-3.5 text-xs font-bold shadow-md">
              {agent?.availability === "available" ? "Define a job with this agent" : "Not currently available"}
            </LiquidButton>
        </div>

      </div>
    </div>
  );
}
