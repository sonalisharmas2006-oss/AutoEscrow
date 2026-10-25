"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Hexagon, Filter, ShieldCheck, Activity, Terminal, Star } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
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
    autoEscrowApi.listAgents({}, { session: "optional" }).then((response) => {
      if (active) setAgents(response.items.map(mapApiAgentToAgent));
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
      router.push(`/demo/?agent=${agent.backendId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The backend could not create this handshake.");
    }
  };

  const themes: Array<"blue"> = ["blue"];

  return (
    <main className="relative flex min-h-screen w-full bg-gradient-to-tr from-slate-100 via-sky-50/50 to-slate-200 text-slate-900 selection:bg-slate-900 selection:text-white font-sans overflow-x-hidden">
      
      <Sidebar />

      <div className="relative z-10 min-h-screen w-full max-w-7xl min-w-0 mx-auto px-6 pb-28 pt-14 sm:px-8 lg:px-12">
        
        <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Hexagon size={14} className="text-fuchsia-600" />
              <span className="text-xs font-mono tracking-[0.2em] text-blue-600 uppercase">Synthetic demo registry</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Agent Marketplace
            </h1>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-slate-600 md:text-base">
               Browse synthetic agent records exposed by the backend. Compare capabilities and availability before sending a synthetic job brief into matching.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative group min-w-0 flex-1 lg:w-80">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400 transition-colors group-focus-within:text-fuchsia-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search names or capabilities…"
                aria-label="Search agent capabilities"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-full border border-white/70 bg-white/65 py-3.5 pl-12 pr-6 text-sm text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-xl transition-all focus:border-fuchsia-500/50 focus:bg-white/80 focus:outline-none"
              />
            </div>
             <button type="button" onClick={() => setAvailableOnly(!availableOnly)} aria-pressed={availableOnly} title="Show only available agents" aria-label="Show only available agents" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/65 text-blue-600 shadow-sm backdrop-blur-xl">
              <Filter size={16} />
            </button>
          </div>
        </header>

         {error && <div className="error-panel" role="alert"><p>Registry unavailable: {error}</p><button onClick={() => setRetry(retry + 1)}>Retry registry</button></div>}

         {error ? null : !loaded ? <div className="rounded-3xl border border-dashed border-zinc-200 p-16 text-center text-sm text-zinc-500">Loading synthetic agent records…</div> : visibleAgents.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {visibleAgents.map((agent, index) => <AgentCardShell key={agent.id} theme={themes[index % themes.length]} agent={agent} onHandshake={handleHandshake} disabled={isLoading} />)}
         </div> : <div className="rounded-3xl border border-dashed border-zinc-200 p-16 text-center text-sm text-zinc-500">{search.trim() ? "No agents match this search." : "No available synthetic agents were returned by the backend."}</div>}

      </div>
    </main>
  );
}

function AgentCardShell({
  theme,
  agent,
  onHandshake,
  disabled,
}: {
  theme: 'fuchsia' | 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
  agent?: Agent;
  onHandshake: (agent: Agent) => void;
  disabled?: boolean;
}) {
  
  const colors = {
    fuchsia: "from-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200 bg-fuchsia-50",
    emerald: "from-emerald-500/10 text-emerald-600 border-emerald-200 bg-emerald-50",
    blue: "from-blue-500/10 text-blue-600 border-blue-200 bg-blue-50",
    amber: "from-amber-500/10 text-amber-600 border-amber-200 bg-amber-50",
    purple: "from-purple-500/10 text-purple-600 border-purple-200 bg-purple-50",
    rose: "from-rose-500/10 text-rose-600 border-rose-200 bg-rose-50",
  };

  const themeClass = colors[theme];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white hover:bg-white/80 hover:shadow-xl">
      
      <div className={`h-24 w-full bg-gradient-to-b ${themeClass.split(' ')[0]} to-transparent opacity-50`} />

      <div className="px-6 pb-6 -mt-12 flex-1 flex flex-col">
        
        <div className="flex justify-between items-end mb-4">
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-md transition-transform duration-500 group-hover:scale-105">
            <div className={`absolute inset-0 bg-gradient-to-br ${themeClass.split(' ')[0]} opacity-20`} />
            <Terminal size={28} className={themeClass.split(' ')[1]} />
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${themeClass.split(' ').slice(1).join(' ')}`}>
             <ShieldCheck size={12} /> Synthetic profile
          </div>
        </div>

        <div className="mb-4">
           <h3 className="mb-2 text-xl font-bold text-slate-950">{agent?.name || "Awaiting Backend..."}</h3>
           <p className="line-clamp-2 text-sm font-light leading-relaxed text-slate-600">
             {agent?.description || "No description supplied by the registry."}
           </p>
        </div>

         <div className="flex flex-wrap gap-2 mb-6 mt-auto">
           {(agent?.capabilities.slice(0, 3) || []).map((capability) => (
              <span key={capability} className="rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{capability}</span>
           ))}
           {!agent && <>
              <div className="h-6 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-14 animate-pulse rounded bg-slate-100" />
           </>}
        </div>

         <div className="mt-auto border-t border-slate-200/80 pt-5">
          <div className="flex justify-between items-center mb-5">
             <div className="flex items-center gap-2 text-slate-500">
              <Activity size={14} />
              <span className="text-[11px] font-mono tracking-widest uppercase">Estimate</span>
            </div>
              <span className="font-mono text-sm font-semibold text-slate-900">{agent?.avgResponseTime || "Unknown"}</span>
          </div>
          
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 text-slate-500">
              <Star size={14} />
              <span className="text-[11px] font-mono tracking-widest uppercase">Pricing</span>
            </div>
             <span className="font-mono text-sm font-semibold text-slate-900">Set in agreement</span>
          </div>

            <details className="mb-5 text-xs text-slate-600"><summary className="cursor-pointer">Profile details</summary><p className="mt-2">Availability: {agent?.availability} · Status: {agent?.status}</p><p>Categories: {agent?.backendTaskCategories?.join(", ")}</p><p>Output formats: {agent?.supportedFormats?.join(", ")}</p><p className="mt-2">Capabilities are synthetic profile attributes, not measured real-world performance.</p></details>
            <button disabled={!agent || disabled || agent.availability !== "available" || agent.status !== "active"} onClick={() => agent && onHandshake(agent)} className="w-full rounded-xl bg-[#0b2447] py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#12345d]">
              {agent?.availability === "available" ? "Define a job with this agent" : "Not currently available"}
           </button>
        </div>

      </div>
    </div>
  );
}
