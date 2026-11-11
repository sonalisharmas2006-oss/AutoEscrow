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
import CyberBackground from "./CyberBackground";
import styles from "./homepage.module.css";

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
    <main className={`relative flex min-h-screen w-full overflow-x-hidden ${styles.homepageRoot}`}>
      {/* Sophisticated holographic & animated cyber background */}
      <CyberBackground />

      {/* Floating dock from existing workspace navigation */}
      <Sidebar />

      <div className="relative z-10 min-w-0 flex-1">
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden border-b border-cyan-500/10">
          <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-6 sm:px-8 lg:px-12 lg:pb-28 lg:pt-9">
            {/* Navigation Bar */}
            <nav className="mb-16 flex items-center justify-between gap-5 lg:mb-20">
              <Link href="/" className="group flex items-center gap-3 font-semibold tracking-tight text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-xs font-mono font-bold text-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.25)] transition duration-300 group-hover:border-cyan-400/70 group-hover:shadow-[0_0_24px_rgba(6,182,212,0.45)]">
                  AE
                </span>
                <span className="text-base font-semibold tracking-tight text-white">Auto Escrow</span>
              </Link>

              <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
                <Link
                  href="/marketplace"
                  className="transition-colors duration-200 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                >
                  Agent marketplace
                </Link>
                <Link
                  href="/demo"
                  className="transition-colors duration-200 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                >
                  Guided demo
                </Link>
                <Link
                  href="/settings"
                  className="transition-colors duration-200 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                >
                  Settings
                </Link>
              </div>

              <Link
                href="/demo"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${styles.primaryCta}`}
              >
                Try the prototype <ArrowRight size={16} />
              </Link>
            </nav>

            {/* Main Hero Card */}
            <div className={`grid gap-10 rounded-3xl p-6 md:p-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:p-12 ${styles.glassPanel}`}>
              <div className="relative z-10 w-full max-w-none p-2 md:p-4 lg:-ml-2 lg:pr-4">
                {/* Status Pill Badge */}
                <div className={`mb-6 inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${styles.cyberBadge}`}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </span>
                  Synthetic demo available
                </div>

                {/* Hero Headline */}
                <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-white md:text-5xl lg:text-6xl">
                  <span className="inline-block whitespace-nowrap">Make AI-agent</span>{" "}
                  <span className="inline-block whitespace-nowrap">work easier</span>{" "}
                  <span className="inline-block whitespace-nowrap bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.45)]">
                    to trust.
                  </span>
                </h1>

                {/* Hero Description */}
                <p className="mt-7 max-w-2xl text-lg font-normal leading-8 text-slate-300/90 md:text-xl">
                  Auto Escrow helps a requester define the job, compare explainable matches, agree on terms, record simulated escrow, verify the result, and review what happened.
                </p>

                {/* CTA Action Buttons */}
                <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
                  <Link
                    href="/demo"
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold ${styles.primaryCta}`}
                  >
                    Try the guided demo <ArrowRight size={17} />
                  </Link>
                  <Link
                    href="/marketplace"
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold ${styles.secondaryCta}`}
                  >
                    <Search size={17} className="text-cyan-400" /> Browse agents
                  </Link>
                </div>

                {/* Trust Verification Tags */}
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    Versioned agreements
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    Deterministic verification
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                    Simulated ledger only
                  </span>
                </div>
              </div>

              {/* Robot Asset Integration Column */}
              <div className="relative min-h-[480px] w-full overflow-hidden rounded-[1.75rem] p-2 md:min-h-[580px] lg:min-h-[660px] lg:translate-x-2">
                {/* Ambient glow backing the robot asset */}
                <div className="pointer-events-none absolute -right-20 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.22),rgba(99,102,241,0.12)_42%,transparent_72%)] blur-3xl" />
                <div className="pointer-events-none absolute right-[12%] top-[20%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25),rgba(168,85,247,0.1)_38%,transparent_72%)] blur-2xl" />

                {/* Subtle cyber reticle frame */}
                <div className={styles.heroGlowFrame} />

                {/* Grounding shadow beneath robot */}
                <div className="pointer-events-none absolute bottom-4 right-[6%] h-12 w-[82%] rounded-full bg-black/80 blur-2xl" />

                {/* Robot image asset preserved and integrated */}
                <Image
                  src="/robot-head-cutout.png"
                  alt="Detailed synthetic metallic robot head"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className={`relative z-10 origin-bottom-right scale-[1.12] object-contain object-right-bottom md:scale-[1.22] lg:scale-[1.34] ${styles.robotCutoutGlow}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PROOF POINTS BAR */}
        <section className="relative z-10 mx-auto -mt-10 w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className={`rounded-3xl p-6 md:p-8 ${styles.glassPanel}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-xs font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                What this prototype proves
              </p>
              <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {proofPoints.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-slate-200">
                    <CheckCircle2 size={17} className="mt-1 shrink-0 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* THE PROBLEM & WORKFLOW SECTION */}
        <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className={`rounded-3xl p-7 md:p-10 ${styles.glassPanel}`}>
            <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  The problem
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-white md:text-5xl">
                  Trust should be a workflow, not a promise.
                </h2>
              </div>
              <p className="max-w-2xl text-lg font-normal leading-8 text-slate-300">
                When AI agents coordinate work, people still need a clear brief, an understandable match, agreed terms, and a way to see why money can—or cannot—be released. Auto Escrow makes those transitions visible in one place.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item) => (
                <div
                  key={item.number}
                  className={`rounded-2xl p-6 ${styles.cyberCard}`}
                >
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-cyan-400">
                    {item.number}
                  </span>
                  <h3 className="mt-10 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-normal leading-6 text-slate-300/85">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BUILT FOR CLARITY / FEATURES SECTION */}
        <section className="mx-auto w-full max-w-7xl px-6 py-4 sm:px-8 lg:px-12 lg:py-8">
          <div className={`grid gap-10 rounded-3xl p-7 md:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center ${styles.glassPanel}`}>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Built for clarity
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-white">
                A calmer surface for consequential steps.
              </h2>
              <p className="mt-5 max-w-2xl text-base font-normal leading-7 text-slate-300">
                The internal workspace uses the current FastAPI workflow and keeps the details available when you need them—without asking a first-time visitor to understand APIs, ledgers, or state machines.
              </p>
              <Link
                href="/demo"
                className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${styles.primaryCta}`}
              >
                Open the guided workspace <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureCards.map(([Icon, title, text]) => (
                <div
                  key={title}
                  className={`rounded-2xl p-5 ${styles.cyberCard}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 shadow-[0_0_14px_rgba(6,182,212,0.2)]">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm font-normal leading-6 text-slate-300/85">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROTOTYPE NOTE SECTION */}
        <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className={`flex flex-col justify-between gap-7 rounded-3xl p-7 md:flex-row md:items-center md:p-10 ${styles.glassPanel}`}>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                Prototype note
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
                Synthetic data. Simulated escrow. Real workflow rules.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-slate-300/85">
                This is a hackathon MVP. It does not process payments, hold funds, run arbitrary code, provide production authentication, or make claims about real-world agent performance.
              </p>
            </div>
            <Link
              href="/demo"
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold ${styles.primaryCta}`}
            >
              Start with a sample task <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-800/80 bg-[#05060d]/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-28 pt-8 text-sm font-normal text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <span>Auto Escrow · synthetic hackathon prototype</span>
            <div className="flex gap-6">
              <Link
                href="/demo"
                className="transition-colors hover:text-cyan-300"
              >
                Guided demo
              </Link>
              <Link
                href="/marketplace"
                className="transition-colors hover:text-cyan-300"
              >
                Marketplace
              </Link>
              <Link
                href="/settings"
                className="transition-colors hover:text-cyan-300"
              >
                Settings
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
