"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ArrowUpRight, Filter, Hexagon, RefreshCw, Search, ShieldCheck, Terminal } from "lucide-react";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ApiAgent, ApiList, autoEscrowApi } from "@/lib/api";

type AgentFilters = {
  availability: string;
  category: string;
  status: string;
};

const emptyFilters: AgentFilters = { availability: "", category: "", status: "" };
const asSearchText = (values: unknown[]) => values.filter((value): value is string => typeof value === "string").join(" ").toLowerCase();
const displayList = (values: string[] | undefined) => values?.length ? values.join(", ") : "Not provided";

export default function MarketplacePage() {
  const router = useRouter();
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AgentFilters>(emptyFilters);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ApiAgent | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileRetry, setProfileRetry] = useState(0);

  useEffect(() => {
    const syncProfileFromUrl = () => setProfileId(new URLSearchParams(window.location.search).get("agent"));
    syncProfileFromUrl();
    window.addEventListener("popstate", syncProfileFromUrl);
    return () => window.removeEventListener("popstate", syncProfileFromUrl);
  }, []);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setError(null);
    autoEscrowApi.listMarketplaceAgents({ limit: 100, offset: 0 }).then((response: ApiList<ApiAgent>) => {
      if (active) setAgents(Array.isArray(response.items) ? response.items : []);
    }).catch((caught: unknown) => {
      if (active) setError(caught instanceof Error ? caught.message : "Unable to load registered agents.");
    }).finally(() => {
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    if (!profileId) {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfile(null);
    setProfileError(null);
    setProfileLoading(true);
    autoEscrowApi.getMarketplaceAgent(profileId).then((agent) => {
      if (active) setProfile(agent);
    }).catch((caught: unknown) => {
      if (active) setProfileError(caught instanceof Error ? caught.message : "Unable to load this agent profile.");
    }).finally(() => {
      if (active) setProfileLoading(false);
    });
    return () => { active = false; };
  }, [profileId, profileRetry]);

  const options = useMemo(() => ({
    availability: uniqueAgentValues(agents, (agent) => agent.availability),
    category: uniqueAgentValues(agents, (agent) => [...(agent.category ? [agent.category] : []), ...(agent.task_categories ?? []), ...(agent.supported_task_types ?? [])]),
    status: uniqueAgentValues(agents, (agent) => agent.status),
  }), [agents]);

  const visibleAgents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return agents.filter((agent) => {
      const searchable = asSearchText([
        agent.name,
        agent.description,
        agent.category,
        agent.owner_display_name,
        agent.external_id,
        agent.status,
        agent.availability,
        agent.pricing_model,
        agent.price_amount,
        agent.currency,
        ...(agent.capabilities ?? []),
        ...(agent.skills ?? []),
        ...(agent.task_categories ?? []),
        ...(agent.supported_task_types ?? []),
      ]);
      return (!query || searchable.includes(query))
        && (!filters.availability || agent.availability === filters.availability)
        && (!filters.category || agent.category === filters.category || agent.task_categories?.includes(filters.category) || agent.supported_task_types?.includes(filters.category))
        && (!filters.status || agent.status === filters.status);
    });
  }, [agents, filters, search]);

  const openProfile = (agentId: string | number) => {
    const id = String(agentId);
    setProfileId(id);
    router.push(`/marketplace/?agent=${encodeURIComponent(id)}`);
  };

  const closeProfile = () => {
    setProfileId(null);
    router.push("/marketplace/");
  };

  const hasFilters = Boolean(search.trim() || Object.values(filters).some(Boolean));

  return (
    <main className="marketplace-page relative flex min-h-screen w-full bg-transparent font-sans text-white selection:bg-white selection:text-black">
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-7xl min-w-0 px-6 pb-28 pt-14 sm:px-8 lg:px-12">
        <header className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2">
              <Hexagon size={14} className="text-[#CCCCCC]" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#CCCCCC]">Live V2 marketplace</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{profileId ? "Agent profile" : "Agent Marketplace"}</h1>
            <p className="max-w-2xl text-sm font-light leading-relaxed text-[#A3A3A3] md:text-base">
              Browse synthetic demo registry records returned by the V2 marketplace. These listings are sample data and are not connected to executing agent runtimes.
            </p>
          </div>
          {!profileId && <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[520px]">
            <label className="group relative block min-w-0">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] transition-colors group-focus-within:text-white" />
              <input
                type="search"
                placeholder="Search name, skills and capabilities…"
                aria-label="Search marketplace agents"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-3.5 pl-12 pr-4 text-sm text-white placeholder-[#888888] shadow-sm backdrop-blur-xl focus:border-white/35 focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <FilterSelect label="Availability" value={filters.availability} values={options.availability} onChange={(value) => setFilters({ ...filters, availability: value })} />
              <FilterSelect label="Category" value={filters.category} values={options.category} onChange={(value) => setFilters({ ...filters, category: value })} />
              <FilterSelect label="Status" value={filters.status} values={options.status} onChange={(value) => setFilters({ ...filters, status: value })} />
            </div>
          </div>}
        </header>

        {profileId ? <>
          <LiquidButton type="button" onClick={closeProfile} className="mb-5 inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-sm"><ArrowLeft size={16} /> Back to marketplace</LiquidButton>
          {profileLoading ? <ProfileSkeleton /> : profileError ? <ErrorPanel title="Profile unavailable" message={profileError} retry={() => setProfileRetry((value) => value + 1)} /> : profile ? <AgentProfile agent={profile} /> : null}
        </> : <>
          {error ? <ErrorPanel message={error} retry={() => setRetry((value) => value + 1)} /> : !loaded ? <MarketplaceSkeleton /> : agents.length === 0 ? <EmptyState title="No live agents are currently available from the V2 registry." detail="The marketplace API returned an empty collection. Registered agents will appear here when the backend publishes them." /> : visibleAgents.length ? <>
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[#A3A3A3]" role="status">
              <span>{visibleAgents.length} of {agents.length} agents</span>
              {hasFilters && <button type="button" onClick={() => { setSearch(""); setFilters(emptyFilters); }} className="underline underline-offset-4">Clear filters</button>}
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visibleAgents.map((agent) => <AgentCard key={agent.id} agent={agent} onOpen={() => openProfile(agent.id)} />)}
            </div>
          </> : <EmptyState title="No agents match these filters." detail="Try a different search or clear one or more filters." action={hasFilters ? <button type="button" onClick={() => { setSearch(""); setFilters(emptyFilters); }} className="mt-4 underline underline-offset-4">Clear filters</button> : undefined} />}
        </>}
      </div>
    </main>
  );
}

function uniqueAgentValues(agents: ApiAgent[], select: (agent: ApiAgent) => string | string[] | undefined) {
  return Array.from(new Set(agents.flatMap((agent) => {
    const value = select(agent);
    return Array.isArray(value) ? value : value ? [value] : [];
  }))).sort((left, right) => left.localeCompare(right));
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="min-w-0 text-[11px] text-[#A3A3A3]">
    <span className="mb-1 block">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={`Filter by ${label.toLowerCase()}`} className="w-full rounded-lg border border-white/15 bg-[#111111] px-2.5 py-2.5 text-xs text-white focus:border-white/40 focus:outline-none">
      <option value="">All</option>
      {values.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>;
}

function AgentCard({ agent, onOpen }: { agent: ApiAgent; onOpen: () => void }) {
  const categories = agent.task_categories ?? [];
  return <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/25">
    <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-[#CCCCCC]"><Terminal size={19} /></span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-white">{agent.name}</h2>
          <p className="truncate text-xs text-[#888888]">{agent.external_id || `Agent #${agent.id}`}</p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase text-[#CCCCCC]"><ShieldCheck size={12} /> {agent.status ?? "Unknown"}</span>
    </div>
    <div className="flex flex-1 flex-col px-5 py-4">
      <p className="mb-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#BDBDBD]">{agent.description || "No description provided."}</p>
      {agent.owner_display_name && <p className="mb-3 text-xs text-[#A3A3A3]">By {agent.owner_display_name}</p>}
      {agent.category && <p className="mb-3 text-xs text-[#A3A3A3]">Category: <span className="text-[#D8D8D8]">{agent.category}</span></p>}
      <DataField label="Capabilities" values={agent.capabilities} />
      <DataField label="Skills" values={agent.skills} />
      <DataField label="Task categories" values={[...categories, ...(agent.supported_task_types ?? [])].filter((value, index, list) => list.indexOf(value) === index)} />
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
        <p className="flex items-center gap-2 text-[#A3A3A3]"><Filter size={13} /> {agent.availability ?? "Availability unknown"}</p>
        <p className="flex items-center gap-2 text-[#A3A3A3]"><Activity size={13} /> {agent.estimated_completion_minutes == null ? "No estimate" : `${agent.estimated_completion_minutes} min estimate`}</p>
        <p className="text-[#A3A3A3]">Pricing: <span className="text-[#D8D8D8]">{agent.price_amount == null ? "Not provided" : `${agent.price_amount} ${agent.currency ?? ""}`}</span></p>
        <p className="text-[#A3A3A3]">Model: <span className="text-[#D8D8D8]">{agent.pricing_model ?? "Not provided"}</span></p>
      </div>
      <button type="button" onClick={onOpen} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
        View agent profile <ArrowUpRight size={15} />
      </button>
    </div>
  </article>;
}

function DataField({ label, values }: { label: string; values?: string[] }) {
  if (!values?.length) return null;
  return <div className="mb-3">
    <p className="mb-1.5 text-[10px] font-semibold uppercase text-[#888888]">{label}</p>
    <div className="flex flex-wrap gap-1.5">{values.map((value) => <span key={value} className="max-w-full break-words rounded-md bg-white/[0.07] px-2 py-1 text-[11px] text-[#D8D8D8]">{value}</span>)}</div>
  </div>;
}

function AgentProfile({ agent }: { agent: ApiAgent }) {
  const stats = Object.entries(agent.demo_performance_stats ?? {});
  const metadata = Object.entries(agent.metadata ?? {});
  return <article className="max-w-4xl rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
      <div>
        <p className="mb-2 text-xs uppercase text-[#888888]">Backend agent ID: {agent.id}</p>
        <h2 className="text-3xl font-semibold text-white">{agent.name}</h2>
        {agent.external_id && <p className="mt-2 text-sm text-[#A3A3A3]">{agent.external_id}</p>}
        {agent.owner_display_name && <p className="mt-2 text-sm text-[#A3A3A3]">Listed by {agent.owner_display_name}</p>}
      </div>
      <p className="rounded-md border border-white/15 px-3 py-2 text-xs uppercase text-[#D8D8D8]">{agent.status ?? "Status unknown"} · {agent.availability ?? "Availability unknown"}</p>
    </header>
    <p className="whitespace-pre-wrap py-5 text-sm leading-7 text-[#D0D0D0]">{agent.description || "No description provided."}</p>
    <div className="grid gap-5 border-t border-white/10 pt-5 sm:grid-cols-2">
      <ProfileList label="Category" values={agent.category ? [agent.category] : []} />
      <ProfileList label="Capabilities" values={agent.capabilities} />
      <ProfileList label="Skills" values={agent.skills} />
      <ProfileList label="Task categories" values={[...(agent.task_categories ?? []), ...(agent.supported_task_types ?? [])].filter((value, index, list) => list.indexOf(value) === index)} />
    </div>
    <dl className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
      <ProfileValue label="Pricing model" value={agent.pricing_model} />
      <ProfileValue label="Price" value={agent.price_amount == null ? null : `${agent.price_amount} ${agent.currency ?? ""}`} />
      <ProfileValue label="Public listing" value={agent.is_public == null ? null : agent.is_public ? "Yes" : "No"} />
      <ProfileValue label="Estimated completion" value={agent.estimated_completion_minutes == null ? null : `${agent.estimated_completion_minutes} minutes`} />
      <ProfileValue label="Created" value={agent.created_at ? new Date(agent.created_at).toLocaleString() : null} />
      <ProfileValue label="Updated" value={agent.updated_at ? new Date(agent.updated_at).toLocaleString() : null} />
      <ProfileValue label="Endpoint URL" value={agent.endpoint_url} />
    </dl>
    {stats.length > 0 && <ProfileObject title="Backend performance statistics" entries={stats} />}
    {metadata.length > 0 && <ProfileObject title="Backend metadata" entries={metadata} />}
  </article>;
}

function ProfileList({ label, values }: { label: string; values?: string[] }) {
  return <section><h3 className="mb-2 text-xs font-semibold uppercase text-[#888888]">{label}</h3><p className="text-sm leading-6 text-[#D8D8D8]">{displayList(values)}</p></section>;
}

function ProfileValue({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return <div><dt className="text-xs font-semibold uppercase text-[#888888]">{label}</dt><dd className="mt-1 break-all text-sm text-[#D8D8D8]">{value}</dd></div>;
}

function ProfileObject({ title, entries }: { title: string; entries: [string, unknown][] }) {
  return <details className="mt-6 border-t border-white/10 pt-5">
    <summary className="cursor-pointer text-sm font-semibold text-white">{title}</summary>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">{entries.map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-xs text-[#888888]">{key}</dt><dd className="mt-1 break-words text-sm text-[#D8D8D8]">{typeof value === "string" ? value : JSON.stringify(value)}</dd></div>)}</dl>
  </details>;
}

function MarketplaceSkeleton() {
  return <div aria-label="Loading marketplace agents" role="status" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse rounded-xl border border-white/10 p-5">
      <div className="mb-5 flex items-center gap-3"><div className="h-11 w-11 rounded-lg bg-white/10" /><div className="flex-1"><div className="h-4 w-2/3 rounded bg-white/10" /><div className="mt-2 h-3 w-1/3 rounded bg-white/10" /></div></div>
      <div className="h-4 w-full rounded bg-white/10" /><div className="mt-2 h-4 w-5/6 rounded bg-white/10" /><div className="mt-6 h-3 w-1/4 rounded bg-white/10" /><div className="mt-2 h-8 w-full rounded bg-white/10" />
    </div>)}
    <span className="sr-only">Loading live marketplace agents</span>
  </div>;
}

function ProfileSkeleton() {
  return <div role="status" className="max-w-4xl animate-pulse rounded-xl border border-white/10 p-7"><div className="h-8 w-1/2 rounded bg-white/10" /><div className="mt-5 h-4 w-full rounded bg-white/10" /><div className="mt-2 h-4 w-4/5 rounded bg-white/10" /><span className="sr-only">Loading agent profile</span></div>;
}

function ErrorPanel({ title = "Registry unavailable", message, retry }: { title?: string; message: string; retry: () => void }) {
  return <div className="error-panel" role="alert"><p>{title}: {message}</p><LiquidButton type="button" onClick={retry} className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm"><RefreshCw size={14} /> Retry</LiquidButton></div>;
}

function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-white/20 px-6 py-14 text-center">
    <p className="text-base font-semibold text-white">{title}</p>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#A3A3A3]">{detail}</p>
    {action}
  </div>;
}
