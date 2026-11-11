"use client";

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
import CyberBackground from "./CyberBackground";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ThemeToggler } from "@/components/animate-ui/buttons/theme-toggler";
import {
  Cursor,
  CursorFollow,
  CursorProvider,
} from "@/components/animate-ui/primitives/cursor";
import { PageTransition } from "@/components/animate-ui/components/page-transition";
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
    <CursorProvider global>
      <Cursor />
      <CursorFollow />

      <main className={`relative flex min-h-screen w-full flex-col overflow-x-hidden ${styles.homepageRoot}`}>
        {/* Full-viewport living particle network & holographic sphere background */}
        <CyberBackground />

        <PageTransition effect="fade" duration={0.3} className="relative z-10 flex min-w-0 flex-1 flex-col">
          {/* TOP NAVIGATION */}
          <header className="relative mx-auto w-full max-w-7xl px-6 pt-6 sm:px-8 lg:px-12 lg:pt-8">
            <nav className="flex items-center justify-between gap-6" aria-label="Main Navigation">
              {/* Brand Logo */}
              <Link href="/" className="group flex items-center gap-3 font-semibold tracking-tight text-[#F5F7FF]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00C8FF]/40 bg-gradient-to-br from-[#00C8FF]/20 to-[#536DFF]/30 font-mono text-xs font-bold text-[#00C8FF] shadow-[0_0_16px_rgba(0,200,255,0.25)] transition duration-300 group-hover:border-[#00C8FF]/80 group-hover:shadow-[0_0_24px_rgba(0,200,255,0.45)]">
                  AE
                </span>
                <span className="text-base font-semibold tracking-tight text-[#F5F7FF]">Auto Escrow</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden items-center gap-8 text-sm font-medium text-[#A0A9BC] md:flex">
                <Link
                  href="/marketplace"
                  className="transition-colors duration-200 hover:text-[#00C8FF] hover:drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]"
                >
                  Agent marketplace
                </Link>
                <Link
                  href="/demo"
                  className="transition-colors duration-200 hover:text-[#00C8FF] hover:drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]"
                >
                  Guided demo
                </Link>
                <Link
                  href="/settings"
                  className="transition-colors duration-200 hover:text-[#00C8FF] hover:drop-shadow-[0_0_8px_rgba(0,200,255,0.5)]"
                >
                  Settings
                </Link>
              </div>

              {/* Theme Toggler & Prototype CTA */}
              <div className="flex items-center gap-3">
                <ThemeToggler variant="default" size="default" system={false} />

                <Link href="/demo">
                  <LiquidButton
                    delay={0.25}
                    fillHeight={3}
                    tapScale={0.97}
                    className="px-4 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    Try the prototype <ArrowRight size={15} />
                  </LiquidButton>
                </Link>
              </div>
            </nav>
          </header>

          {/* CINEMATIC HERO SECTION (No card, no container, no robot, text directly over animated background) */}
          <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-24 pt-16 sm:px-8 sm:pt-24 lg:px-12 lg:pb-32 lg:pt-28">
            <div className="max-w-3xl">
              {/* Main Headline */}
              <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#F5F7FF] sm:text-6xl lg:text-7xl">
                Make AI-agent work{" "}
                <span className="inline-block bg-gradient-to-r from-[#00C8FF] via-[#536DFF] to-[#8855FF] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,200,255,0.45)]">
                  easier to trust.
                </span>
              </h1>

              {/* Descriptive Paragraph */}
              <p className="mt-8 max-w-2xl text-lg font-normal leading-8 text-[#A0A9BC] md:text-xl">
                Auto Escrow helps a requester define the job, compare explainable matches, agree on terms, record simulated escrow, verify the result, and review what happened.
              </p>

              {/* Two Carefully Positioned CTAs */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/demo">
                  <LiquidButton
                    delay={0.3}
                    fillHeight={3}
                    tapScale={0.97}
                    className="px-7 py-3.5 text-sm font-semibold shadow-[0_0_25px_rgba(0,200,255,0.35)]"
                  >
                    Try the guided demo <ArrowRight size={17} />
                  </LiquidButton>
                </Link>

                <Link
                  href="/marketplace"
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium ${styles.secondaryCta}`}
                >
                  <Search size={17} className="text-[#00C8FF]" /> Browse agents
                </Link>
              </div>
            </div>
          </section>

          {/* PROOF POINTS STRIP */}
          <section className="relative w-full border-y border-white/[0.08] bg-[#090D18]/50 py-7 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
              <p className="shrink-0 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#00C8FF]">
                What this prototype proves
              </p>
              <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {proofPoints.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-[#F5F7FF]">
                    <CheckCircle2 size={17} className="mt-1 shrink-0 text-[#00C8FF] drop-shadow-[0_0_8px_rgba(0,200,255,0.6)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* THE PROBLEM & WORKFLOW SECTION */}
          <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className={`rounded-3xl p-8 md:p-12 ${styles.sectionSurface}`}>
              <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
                <div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#00C8FF]">
                    The problem
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#F5F7FF] sm:text-4xl md:text-5xl">
                    Trust should be a workflow, not a promise.
                  </h2>
                </div>
                <p className="max-w-2xl text-lg font-normal leading-8 text-[#A0A9BC]">
                  When AI agents coordinate work, people still need a clear brief, an understandable match, agreed terms, and a way to see why money can—or cannot—be released. Auto Escrow makes those transitions visible in one place.
                </p>
              </div>

              <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {workflow.map((item) => (
                  <div
                    key={item.number}
                    className={`rounded-2xl p-6 ${styles.cyberCard}`}
                  >
                    <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#00C8FF]">
                      {item.number}
                    </span>
                    <h3 className="mt-8 text-xl font-semibold text-[#F5F7FF]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm font-normal leading-6 text-[#A0A9BC]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BUILT FOR CLARITY SECTION */}
          <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
            <div className={`grid gap-10 rounded-3xl p-8 md:p-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center ${styles.sectionSurface}`}>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#00C8FF]">
                  Built for clarity
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#F5F7FF] sm:text-4xl">
                  A calmer surface for consequential steps.
                </h2>
                <p className="mt-6 max-w-2xl text-base font-normal leading-7 text-[#A0A9BC]">
                  The internal workspace uses the current FastAPI workflow and keeps the details available when you need them—without asking a first-time visitor to understand APIs, ledgers, or state machines.
                </p>
                <div className="mt-8">
                  <Link href="/demo">
                    <LiquidButton
                      delay={0.25}
                      fillHeight={3}
                      tapScale={0.97}
                      className="px-6 py-3 text-sm font-semibold"
                    >
                      Open the guided workspace <ArrowRight size={16} />
                    </LiquidButton>
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {featureCards.map(([Icon, title, text]) => (
                  <div
                    key={title}
                    className={`rounded-2xl p-5 ${styles.cyberCard}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#00C8FF]/30 bg-[#00C8FF]/10 text-[#00C8FF] shadow-[0_0_14px_rgba(0,200,255,0.2)]">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-[#F5F7FF]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm font-normal leading-6 text-[#A0A9BC]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PROTOTYPE NOTE SECTION */}
          <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
            <div className={`flex flex-col justify-between gap-8 rounded-3xl p-8 md:flex-row md:items-center md:p-12 ${styles.sectionSurface}`}>
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#00C8FF]">
                  Prototype note
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#F5F7FF] md:text-3xl">
                  Synthetic data. Simulated escrow. Real workflow rules.
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#A0A9BC]">
                  This is a hackathon MVP. It does not process payments, hold funds, run arbitrary code, provide production authentication, or make claims about real-world agent performance.
                </p>
              </div>
              <Link href="/demo">
                <LiquidButton
                  delay={0.25}
                  fillHeight={3}
                  tapScale={0.97}
                  className="shrink-0 px-6 py-3.5 text-sm font-semibold"
                >
                  Start with a sample task <ArrowRight size={16} />
                </LiquidButton>
              </Link>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-white/[0.08] bg-[#05060A]/80 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-28 pt-8 text-sm font-normal text-[#A0A9BC] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
              <span>Auto Escrow · synthetic hackathon prototype</span>
              <div className="flex gap-6">
                <Link href="/demo" className="transition-colors hover:text-[#00C8FF]">
                  Guided demo
                </Link>
                <Link href="/marketplace" className="transition-colors hover:text-[#00C8FF]">
                  Marketplace
                </Link>
                <Link href="/settings" className="transition-colors hover:text-[#00C8FF]">
                  Settings
                </Link>
              </div>
            </div>
          </footer>
        </PageTransition>
      </main>
    </CursorProvider>
  );
}
