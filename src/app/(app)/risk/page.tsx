"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Hexagon } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useFlow } from "@/context/FlowContext";
import { ApiEscrow, ApiJob, autoEscrowApi, formatMoney } from "@/lib/api";

export default function RiskEscrowPage() {
  const { activeTransaction, refreshActiveTransaction } = useFlow();
  const [rows, setRows] = useState<Array<{ job: ApiJob; escrow: ApiEscrow | null }>>([]);
  const [search, setSearch] = useState("");
  const [openDisputes, setOpenDisputes] = useState<number | null>(null);
  const [riskScore, setRiskScore] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshActiveTransaction().catch(() => undefined);
    let active = true;
    const load = async () => {
      try {
        const jobs = await autoEscrowApi.listJobs({ limit: 100 });
        const escrows = await Promise.all(
          jobs.items.map(async (job) => ({ job, escrow: await autoEscrowApi.getEscrowForJob(job.id) })),
        );
        if (!active) return;
        setRows(escrows);
        setError(null);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Unable to load risk data.");
      } finally {
        if (active) setLoaded(true);
      }

      try {
        const metrics = await autoEscrowApi.getDashboardMetrics();
        if (active) {
          setOpenDisputes(metrics.open_disputes);
          setRiskScore(metrics.risk_score);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load risk metrics.");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [activeTransaction.backendJobId]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter(({ job, escrow }) => `${job.public_id} ${escrow?.id || ""} ${escrow?.provider_reference || ""}`.toLowerCase().includes(query));
  }, [rows, search]);
  const totalLocked = rows.reduce(
    (total, row) => total + (
      row.escrow && ["funded", "held"].includes(row.escrow.status)
        ? Number(row.escrow.funded_amount || row.escrow.accepted_amount)
        : 0
    ),
    0,
  );

  return (
    <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-[#0b0c10] text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans transition-colors duration-500">
      <Sidebar />

      <div className="relative z-10 w-full min-h-screen pl-[100px] pr-8 pt-28 pb-24 max-w-7xl mx-auto">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Hexagon size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-mono tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">Capital Escrow</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
              Active Escrows & Risk
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-light max-w-xl">
              Monitor multi-sig smart contracts, autonomous dispute resolutions, and systemic risk scores across the agent network.
            </p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={16} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <input 
                type="text"
                placeholder="Search Contract Hash..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-white dark:bg-transparent border border-zinc-200 dark:border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-300 dark:focus:border-white/30 transition-all shadow-sm dark:shadow-none"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <StatCard title="Total Value Locked" value={loaded ? formatMoney(totalLocked) : "--"} trend={loaded ? "Backend ledger" : "Awaiting Data"} accent="text-zinc-500" />
          <StatCard title="Active Contracts" value={loaded ? String(rows.filter(({ escrow }) => escrow && !["released", "refunded"].includes(escrow.status)).length) : "--"} trend={loaded ? "Backend ledger" : "Awaiting Data"} accent="text-zinc-500" />
          <StatCard title="Active Disputes" value={openDisputes === null ? "--" : String(openDisputes)} trend={openDisputes === null ? (error || "Awaiting Data") : openDisputes ? "Requires review" : "Backend metrics"} accent="text-zinc-500" />
          <StatCard title="System Risk Score" value={riskScore === null ? "--" : Number(riskScore).toFixed(2)} trend={riskScore === null ? (error || "Awaiting Data") : "0-100 · higher is riskier"} accent="text-zinc-500" />
        </div>

        <div className="w-full border border-zinc-200 dark:border-white/5 rounded-3xl p-2 bg-white dark:bg-black/20 shadow-sm dark:shadow-none transition-colors duration-500">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-100 dark:border-white/5 text-[10px] font-mono tracking-widest text-zinc-500 dark:text-zinc-600 uppercase mb-2">
            <div className="col-span-4">Transaction / Parties</div>
            <div className="col-span-3">Contract Hash</div>
            <div className="col-span-2">Value Locked</div>
            <div className="col-span-3 text-right">Escrow Status</div>
          </div>

          {visibleRows.length ? visibleRows.map(({ job, escrow }) => (
            <div key={job.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-100 dark:border-white/5 text-xs items-center">
              <div className="col-span-4 text-zinc-900 dark:text-white font-semibold">{job.title}<span className="block text-[10px] font-mono text-zinc-500">{job.public_id}</span></div>
              <div className="col-span-3 text-zinc-500 dark:text-zinc-400 font-mono">{escrow ? `escrow-${escrow.id}` : "Not created"}</div>
              <div className="col-span-2 text-zinc-500 dark:text-zinc-400 font-mono">{escrow ? formatMoney(escrow.funded_amount || escrow.accepted_amount, escrow.currency) : "--"}</div>
              <div className="col-span-3 text-right text-emerald-500 dark:text-emerald-400 font-mono">{escrow ? escrow.status.toUpperCase() : "NO ESCROW"}</div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500 dark:text-zinc-600 font-mono text-sm">
              {!loaded && <div className="h-8 w-8 border-2 border-zinc-200 border-t-zinc-400 dark:border-zinc-800 dark:border-t-zinc-500 rounded-full animate-spin mb-4" />}
              {error || (loaded ? (search.trim() ? "No matching jobs." : "No jobs found.") : "Awaiting backend data stream...")}
            </div>
          )}
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
