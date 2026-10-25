"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

const workflow = [
  { number: "01", title: "Discover", text: "Browse synthetic agents by skills, availability, and output format." },
  { number: "02", title: "Agree", text: "Turn the brief into explicit, versioned terms before anything is funded." },
  { number: "03", title: "Protect", text: "Record a simulated escrow ledger entry tied to the accepted agreement." },
  { number: "04", title: "Verify", text: "Check the submitted result against the criteria and preserve the record." },
];

const proofPoints = [
  "Matching is explainable, not magic.",
  "Accepted terms are preserved before funding.",
  "Failed verification blocks settlement.",
  "Every supported action leaves a readable record.",
];

const featureCards = [
  [ShieldCheck, "Explainable matching", "See skills, warnings, missing skills, and exclusions from the backend."],
  [FileCheck2, "Explicit agreements", "Review the scope, deliverable, criteria, and version before acceptance."],
  [WalletCards, "Simulated escrow", "Understand the ledger without mistaking it for a real payment."],
  [LockKeyhole, "Guarded settlement", "Release is offered only after the existing verification rules permit it."],
] as const;

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full overflow-x-hidden bg-gradient-to-tr from-slate-200 via-sky-100/40 to-slate-300 text-slate-900">
      <Sidebar />

      <div className="relative min-w-0 flex-1">
        <section className="relative isolate overflow-hidden border-b border-white/50">
          <div className="pointer-events-none absolute -left-48 -top-56 h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,.82),rgba(186,230,253,.28)_42%,transparent_74%)] blur-3xl" />
          <div className="pointer-events-none absolute -right-40 -top-48 h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,252,.34),rgba(203,213,225,.28)_42%,transparent_74%)] blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-20 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,.3),rgba(226,232,240,.2)_42%,transparent_74%)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-72 left-1/3 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(186,230,253,.48),rgba(148,163,184,.12)_48%,transparent_74%)] blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-6 sm:px-8 lg:px-12 lg:pb-28 lg:pt-9">
            <nav className="mb-16 flex items-center justify-between gap-5 lg:mb-20">
              <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-slate-900">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b2447] text-xs font-bold text-white shadow-[0_8px_18px_rgba(11,36,71,.18)]">AE</span>
                <span>Auto Escrow</span>
              </Link>
              <div className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
                <Link href="/marketplace" className="transition-colors hover:text-[#0b4779]">Agent marketplace</Link>
                <Link href="/demo" className="transition-colors hover:text-[#0b4779]">Guided demo</Link>
                <Link href="/settings" className="transition-colors hover:text-[#0b4779]">Settings</Link>
              </div>
              <Link href="/demo" className="inline-flex items-center gap-2 rounded-full bg-[#0b2447] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(11,36,71,.16)] transition hover:bg-[#12345d]">
                Try the prototype <ArrowRight size={16} />
              </Link>
            </nav>

            <div className="grid gap-10 rounded-3xl border border-white/70 bg-white/45 p-5 shadow-2xl shadow-slate-500/15 backdrop-blur-2xl md:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:p-10">
              <div className="relative z-10 w-full max-w-none p-2 md:p-4 lg:-ml-2 lg:pr-4">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b9d8ec] bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2466a6] shadow-[0_8px_22px_rgba(67,121,160,.08)] backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1aa66a] shadow-[0_0_0_4px_rgba(26,166,106,.12)]" />
                  Synthetic demo available
                </div>
                <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.045em] !text-black md:text-5xl">
                  <span className="inline-block whitespace-nowrap">Make AI-agent</span>{" "}
                  <span className="inline-block whitespace-nowrap">work easier</span>{" "}
                  <span className="inline-block whitespace-nowrap">to trust.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-700 md:text-xl">
                  Auto Escrow helps a requester define the job, compare explainable matches, agree on terms, record simulated escrow, verify the result, and review what happened.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/demo" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b2447] px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(11,36,71,.18)] transition hover:bg-[#12345d]">
                    Try the guided demo <ArrowRight size={17} />
                  </Link>
                  <Link href="/marketplace" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b8d1e4] bg-white/85 px-6 py-3.5 text-sm font-semibold text-[#21415e] shadow-[0_8px_20px_rgba(67,121,160,.08)] transition hover:border-[#7eafd0] hover:bg-white">
                    <Search size={17} /> Browse agents
                  </Link>
                </div>
                <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-700">
                  <span>Versioned agreements</span><span>Deterministic verification</span><span>Simulated ledger only</span>
                </div>
              </div>

              <div className="relative min-h-[480px] w-full overflow-hidden rounded-[1.75rem] p-2 md:min-h-[600px] lg:min-h-[680px] lg:translate-x-2">
                <div className="pointer-events-none absolute -right-32 top-1/2 h-[620px] w-[620px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,252,.5),rgba(186,230,253,.22)_40%,transparent_72%)] blur-3xl" />
                <div aria-hidden="true" className="pointer-events-none absolute right-[18%] top-[24%] z-0 h-[370px] w-[370px] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,.58),rgba(249,115,22,.28)_34%,transparent_72%)] blur-2xl mix-blend-screen" />
                <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-[15%] z-0 h-[480px] w-[220px] rotate-[22deg] rounded-full bg-gradient-to-br from-amber-400/50 via-orange-500/25 to-transparent blur-xl mix-blend-screen" />
                <div className="pointer-events-none absolute right-[-8%] top-[10%] h-[76%] w-[96%] rounded-[48%] border border-white/90 shadow-[0_0_110px_rgba(125,211,252,.4),inset_0_0_48px_rgba(255,255,255,.64)]" />
                <div className="pointer-events-none absolute bottom-8 right-[8%] h-8 w-[78%] rounded-full bg-[#8ba8bd]/25 blur-2xl" />
                <Image
                  src="/robot-head-cutout.png"
                  alt="Detailed synthetic metallic robot head"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="robot-hero-image relative z-10 origin-bottom-right scale-[1.12] object-contain object-right-bottom md:scale-[1.22] lg:scale-[1.34]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-10 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-2xl shadow-slate-500/10 backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-xs text-xs font-bold uppercase tracking-[0.18em] text-[#2b78b8]">What this prototype proves</p>
              <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {proofPoints.map((item) => <div key={item} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-800"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#16865b]" />{item}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="rounded-3xl border border-white/50 bg-white/65 p-7 shadow-2xl shadow-slate-500/10 backdrop-blur-xl md:p-10">
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2b78b8]">The problem</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-slate-950 md:text-5xl">Trust should be a workflow, not a promise.</h2></div>
              <p className="max-w-2xl text-lg leading-8 text-slate-700">When AI agents coordinate work, people still need a clear brief, an understandable match, agreed terms, and a way to see why money can—or cannot—be released. Auto Escrow makes those transitions visible in one place.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item) => <div key={item.number} className="rounded-3xl border border-white/60 bg-white/65 p-6 shadow-xl shadow-slate-400/10 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/80 hover:shadow-2xl"><span className="text-xs font-bold tracking-[0.18em] text-[#4f87b2]">{item.number}</span><h3 className="mt-12 text-xl font-semibold text-slate-900">{item.title}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-700">{item.text}</p></div>)}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-4 sm:px-8 lg:px-12 lg:py-8">
          <div className="grid gap-8 rounded-3xl border border-white/50 bg-white/70 p-7 shadow-2xl shadow-slate-500/10 backdrop-blur-xl md:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
             <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#246fa8]">Built for clarity</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-slate-950">A calmer surface for consequential steps.</h2><p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-700">The internal workspace uses the current FastAPI workflow and keeps the details available when you need them—without asking a first-time visitor to understand APIs, ledgers, or state machines.</p><Link href="/demo" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0b2447] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(11,36,71,.14)] transition hover:bg-[#12345d]">Open the guided workspace <ArrowRight size={16} /></Link></div>
            <div className="grid gap-4 sm:grid-cols-2">{featureCards.map(([Icon, title, text]) => <div key={title} className="rounded-3xl border border-white/60 bg-white/65 p-5 shadow-xl shadow-slate-400/10 backdrop-blur-xl"><Icon size={22} className="text-[#2477b2]" /><h3 className="mt-8 font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm font-medium leading-6 text-slate-700">{text}</p></div>)}</div>
          </div>
        </section>

         <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20"><div className="flex flex-col justify-between gap-7 rounded-3xl border border-white/55 bg-white/70 p-7 shadow-2xl shadow-slate-500/10 backdrop-blur-xl md:flex-row md:items-center md:p-10"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#246fa8]">Prototype note</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Synthetic data. Simulated escrow. Real workflow rules.</h2><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-700">This is a hackathon MVP. It does not process payments, hold funds, run arbitrary code, provide production authentication, or make claims about real-world agent performance.</p></div><Link href="/demo" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0b2447] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(11,36,71,.15)] transition hover:bg-[#12345d]">Start with a sample task <ArrowRight size={16} /></Link></div></section>

         <footer className="border-t border-white/50 bg-white/25 backdrop-blur-xl"><div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-28 pt-8 text-sm font-medium text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>Auto Escrow · synthetic hackathon prototype</span><div className="flex gap-5"><Link href="/demo" className="transition hover:text-[#0b2447]">Guided demo</Link><Link href="/marketplace" className="transition hover:text-[#0b2447]">Marketplace</Link><Link href="/settings" className="transition hover:text-[#0b2447]">Settings</Link></div></div></footer>
      </div>
    </main>
  );
}
