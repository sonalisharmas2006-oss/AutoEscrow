"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Terminal } from "lucide-react";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ApiAgent, autoEscrowApi } from "@/lib/api";

const PAGE_SIZE = 9;
type SortMode = "name" | "price-low" | "price-high" | "recent";

function isDemoProfile(agent: ApiAgent) {
  return agent.name.trim().toLowerCase().startsWith("demo") ||
    agent.metadata?.profile_type === "demo" ||
    agent.metadata?.is_demo === true;
}

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("agent");
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [sort, setSort] = useState<SortMode>("name");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<ApiAgent | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await autoEscrowApi.listMarketplaceAgents({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setAgents(Array.isArray(result.items) ? result.items : []);
      setTotal(Number.isFinite(result.total) ? result.total : result.items.length);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Marketplace could not be loaded.");
      setAgents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, status, category, search]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!profileId) { setProfile(null); setProfileError(""); return; }
    let active = true;
    setProfileLoading(true);
    setProfileError("");
    autoEscrowApi.getMarketplaceAgent(profileId)
      .then((value) => { if (active) setProfile(value); })
      .catch((reason) => { if (active) setProfileError(reason instanceof Error ? reason.message : "Agent profile could not be loaded."); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [profileId]);

  const categories = useMemo(() => Array.from(new Set(agents.flatMap((agent) => [
    ...(agent.category ? [agent.category] : []),
    ...(agent.task_categories ?? []),
    ...(agent.supported_task_types ?? []),
  ]))).sort((a, b) => a.localeCompare(b)), [agents]);

  const sortedAgents = useMemo(() => [...agents].sort((a, b) => {
    if (sort === "price-low" || sort === "price-high") {
      const av = Number(a.price_amount ?? Number.POSITIVE_INFINITY);
      const bv = Number(b.price_amount ?? Number.POSITIVE_INFINITY);
      return sort === "price-low" ? av - bv : bv - av;
    }
    if (sort === "recent") return String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""));
    return a.name.localeCompare(b.name);
  }), [agents, sort]);

  const openProfile = (id: string | number) => router.push(`/marketplace?agent=${encodeURIComponent(String(id))}`);
  const clearFilters = () => { setSearch(""); setCategory(""); setStatus(""); setSort("name"); setPage(0); };

  if (profileId) return <main className="min-h-screen bg-transparent px-5 pb-32 pt-14 text-white sm:px-8 lg:px-12">
    <div className="mx-auto max-w-5xl">
      <LiquidButton type="button" onClick={() => router.push("/marketplace")} className="mb-6 inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-sm"><ArrowLeft size={16}/> Marketplace</LiquidButton>
      {profileLoading ? <LoadingState label="Loading agent profile…" /> : profileError ? <ErrorState message={profileError} retry={() => router.refresh()} /> : profile ? <article className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div><p className="text-xs uppercase tracking-widest text-neutral-400">Agent profile · #{profile.id}</p><h1 className="mt-2 text-3xl font-semibold">{profile.name}</h1></div>
          <div className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs uppercase text-neutral-300"><ShieldCheck size={14}/>{profile.status ?? "Status unknown"}</div>
        </div>
        {isDemoProfile(profile) && <p className="mt-4 inline-flex rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs text-amber-200">Demo profile · registry listing only</p>}
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-neutral-300">{profile.description || "No description supplied by the registry."}</p>
        <div className="mt-6 grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
          <ProfileField label="Category" value={profile.category}/>
          <ProfileField label="Availability" value={profile.availability}/>
          <ProfileField label="Pricing" value={profile.price_amount == null ? null : `${profile.price_amount} ${profile.currency ?? ""}`}/>
          <ProfileField label="Pricing model" value={profile.pricing_model}/>
          <ProfileField label="Capabilities" value={profile.capabilities?.join(", ")}/>
          <ProfileField label="Skills" value={profile.skills?.join(", ")}/>
          <ProfileField label="Task types" value={profile.task_categories?.join(", ") || profile.supported_task_types?.join(", ")}/>
          <ProfileField label="Owner" value={profile.owner_display_name}/>
        </div>
        <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-neutral-500">Registry information is supplied by the backend. A listing does not mean that an agent runtime can execute tasks in this release.</p>
      </article> : null}
    </div>
  </main>;

  return <main className="min-h-screen bg-transparent px-5 pb-32 pt-14 text-white sm:px-8 lg:px-12">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="mb-3 text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">Live V2 registry</p><h1 className="text-4xl font-bold sm:text-5xl">Agent Marketplace</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">Public agent profiles returned by the production registry. Listings are not proof of an executable agent runtime.</p></div>
        <div className="text-sm text-neutral-400" aria-live="polite">{loading ? "Loading registry…" : `${total} registered agents`}</div>
      </header>
      <section className="mb-7 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Marketplace filters">
        <label className="relative block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"/><span className="sr-only">Search agents</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search agents…" className="w-full rounded-lg border border-white/15 bg-black/30 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-white/40"/></label>
        <label className="flex items-center gap-2 text-xs text-neutral-400"><SlidersHorizontal size={14}/><span className="sr-only">Category</span><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }} className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-sm text-white"><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="sr-only" htmlFor="market-status">Status</label><select id="market-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-sm text-white"><option value="active">Active</option><option value="">All statuses</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select>
        <label className="sr-only" htmlFor="market-sort">Sort agents</label><select id="market-sort" value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="rounded-lg border border-white/15 bg-[#101010] px-3 py-2.5 text-sm text-white"><option value="name">Sort: Name</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option><option value="recent">Recently listed</option></select>
      </section>
      {error ? <ErrorState message={error} retry={() => void load()}/> : loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({length:6},(_,i)=><div key={i} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"/> )}</div> : sortedAgents.length === 0 ? <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center"><h2 className="text-lg font-semibold">{total === 0 ? "No agents are currently available" : "No agents match these filters"}</h2><p className="mt-2 text-sm text-neutral-400">{total === 0 ? "The live API returned an empty collection. No sample records are inserted by the frontend." : "Try changing the search or filters."}</p><button type="button" onClick={clearFilters} className="mt-4 text-sm underline underline-offset-4">Clear filters</button></div> : <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{sortedAgents.map((agent) => <article key={agent.id} className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-white/25">
          <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]"><Terminal size={17}/></span><div className="min-w-0"><h2 className="truncate font-semibold">{agent.name}</h2><p className="text-xs text-neutral-500">Agent #{agent.id}</p></div></div><span className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase text-neutral-300">{agent.status ?? "Unknown"}</span></div>
          {isDemoProfile(agent) && <span className="mt-4 w-fit rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[10px] uppercase tracking-wide text-amber-200">Demo profile</span>}
          <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-neutral-300">{agent.description || "No description supplied."}</p>
          <p className="mt-3 text-xs text-neutral-400">{agent.category || agent.task_categories?.[0] || "Category not supplied"} · {agent.availability || "Availability unknown"}</p>
          <p className="mt-3 text-sm text-neutral-300">{agent.price_amount == null ? "Pricing not supplied" : `${agent.price_amount} ${agent.currency ?? ""}`} <span className="text-xs text-neutral-500">{agent.pricing_model || ""}</span></p>
          <button type="button" onClick={() => openProfile(agent.id)} className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">View profile <ArrowUpRight size={15}/></button>
        </article>)}</div>
        <nav className="mt-7 flex items-center justify-between gap-4" aria-label="Marketplace pagination"><p className="text-xs text-neutral-500">Page {page+1} of {Math.max(1,Math.ceil(total/PAGE_SIZE))}</p><div className="flex gap-2"><button type="button" disabled={page===0} onClick={()=>setPage((v)=>Math.max(0,v-1))} className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-30">Previous</button><button type="button" disabled={(page+1)*PAGE_SIZE>=total} onClick={()=>setPage((v)=>v+1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-30">Next</button></div></nav>
      </>}
      <p className="mt-8 text-xs leading-5 text-neutral-500">Demo profiles are registry examples. AutoEscrow V2 does not execute agent tasks in the current release. No ratings or reviews are inferred or fabricated.</p>
    </div>
  </main>;
}

function ProfileField({label,value}:{label:string;value?:string|null}) {
  if (!value) return null;
  return <div><p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">{label}</p><p className="mt-1 break-words text-sm text-neutral-200">{value}</p></div>;
}
function LoadingState({label}:{label:string}) { return <div role="status" className="rounded-xl border border-white/10 p-8 text-sm text-neutral-400">{label}</div>; }
function ErrorState({message,retry}:{message:string;retry:()=>void}) { return <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/5 p-6"><p className="text-sm text-red-200">{message}</p><button type="button" onClick={retry} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm"><RefreshCw size={14}/> Retry</button></div>; }
