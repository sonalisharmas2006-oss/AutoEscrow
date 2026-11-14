"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import { InteractiveSectionParticles } from "@/components/particles/InteractiveSectionParticles";
import { LiquidButton, LiquidLink } from "@/components/animate-ui/buttons/liquid";
import BrandLogo from "@/components/BrandLogo";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
      <main className={`homepage-root relative flex min-h-screen w-full flex-col overflow-x-hidden ${styles.homepageRoot}`}>
        {/* PERMANENT TOP NAVIGATION (Fully visible, sticky, accessible, and responsive) */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#000000]/80 backdrop-blur-xl transition-colors duration-200">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
            {/* Brand Logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 font-semibold tracking-tight text-white focus-visible:outline-none"
            >
              <BrandLogo className="h-9 w-6" />
              <span className="text-base font-semibold tracking-tight text-white">
                Auto Escrow
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-8 text-sm font-medium text-[#BDBDBD] md:flex" aria-label="Desktop Navigation">
              <Link
                href="/marketplace"
                className="transition-colors duration-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              >
                Agent marketplace
              </Link>
              <Link
                href="/demo"
                className="transition-colors duration-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              >
                Guided demo
              </Link>
              <Link
                href="/settings"
                className="transition-colors duration-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              >
                Settings
              </Link>
            </nav>

            {/* Prototype CTA */}
            <div className="flex items-center gap-3">
              <LiquidLink
                href="/marketplace"
                delay={0.25}
                fillHeight={3}
                className="hidden px-4 py-2 text-xs font-semibold sm:inline-flex sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Open marketplace <ArrowRight size={15} />
              </LiquidLink>

              {/* Mobile Menu Hamburger */}
              <LiquidButton
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </LiquidButton>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="border-t border-white/10 bg-[#000000]/95 px-6 py-5 backdrop-blur-2xl md:hidden">
              <nav className="flex flex-col gap-4 text-sm font-medium text-[#CCCCCC]">
                <Link
                  href="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 transition hover:text-white"
                >
                  Agent marketplace
                </Link>
                <Link
                  href="/demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 transition hover:text-white"
                >
                  Guided demo
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 transition hover:text-white"
                >
                  Settings
                </Link>
                <div className="pt-2">
                  <LiquidLink
                      href="/marketplace"
                      onClick={() => setMobileMenuOpen(false)}
                      delay={0.25}
                      fillHeight={3}
                      className="w-full py-2.5 text-xs font-semibold"
                    >
                      Open marketplace <ArrowRight size={15} />
                    </LiquidLink>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* 1. CINEMATIC HERO SECTION (Directly over 3D Spherical Particle Formation) */}
        <section className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col justify-center overflow-hidden px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          {/* Section 1 Particle Formation: Large Interconnected 3D Spherical Network */}
          <InteractiveSectionParticles formation="sphere" particleCount={95} />

          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              {/* Product Headline with Subtle Silver/White Gradient Emphasis */}
              <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
                Make AI-agent work{" "}
                <span className="inline-block bg-gradient-to-r from-white via-[#CCCCCC] to-[#888888] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
                  easier to trust.
                </span>
              </h1>

              {/* Product Descriptive Paragraph */}
              <p className="mt-8 max-w-2xl text-lg font-normal leading-8 text-[#A0A9BC] md:text-xl">
                Auto Escrow helps a requester define the job, compare explainable matches, agree on terms, record simulated escrow, verify the result, and review what happened.
              </p>

              {/* Two Carefully Positioned Monochrome Liquid Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <LiquidLink
                    href="/demo"
                      delay={0.3}
                      fillHeight={3}
                      className="px-7 py-3.5 text-sm font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      Try the guided demo <ArrowRight size={17} />
                  </LiquidLink>

                  <LiquidLink
                    href="/marketplace"
                    variant="outline"
                    delay={0.3}
                    fillHeight={3}
                    className="px-7 py-3.5 text-sm font-medium"
                  >
                    <Search size={16} className="text-[#CCCCCC]" /> Browse agents
                  </LiquidLink>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROOF POINTS / ABOUT SECTION (Directly over Geometric Crystalline Particle Network) */}
        <section className="relative w-full border-y border-white/10 bg-[#050505]/60 py-8 backdrop-blur-xl">
          {/* Section 2 Particle Formation: Abstract Crystalline Geometric Structure */}
          <InteractiveSectionParticles formation="geometry" particleCount={65} />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <p className="shrink-0 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#CCCCCC]">
              What this prototype proves
            </p>
            <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {proofPoints.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-white">
                  <CheckCircle2 size={17} className="mt-1 shrink-0 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. THE PROBLEM & WORKFLOW SECTION (Directly over Flowing Pathway Particles) */}
        <section className="relative mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="relative overflow-hidden p-8 md:p-12">
            {/* Section 3 Particle Formation: Flowing Conduit Pathways */}
            <InteractiveSectionParticles formation="pathways" particleCount={85} />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#888888]">
                  The problem
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
                  Trust should be a workflow, not a promise.
                </h2>
              </div>
              <p className="max-w-2xl text-lg font-normal leading-8 text-[#A0A9BC]">
                When AI agents coordinate work, people still need a clear brief, an understandable match, agreed terms, and a way to see why money can—or cannot—be released. Auto Escrow makes those transitions visible in one place.
              </p>
            </div>

            <div className="relative z-10 mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item) => (
                <div
                  key={item.number}
                  className={`rounded-2xl p-6 ${styles.monochromeCard}`}
                >
                  <span className="font-mono text-xs font-bold tracking-[0.2em] text-white">
                    {item.number}
                  </span>
                  <h3 className="mt-8 text-xl font-semibold text-white">
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

        {/* 4. BUILT FOR CLARITY SECTION (Directly over 4-Cluster Constellation Particles) */}
        <section className="relative mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-12 lg:py-8">
          <div className="relative overflow-hidden p-8 md:p-12">
            {/* Section 4 Particle Formation: Constellation Hubs */}
            <InteractiveSectionParticles formation="constellation" particleCount={75} />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#888888]">
                  Built for clarity
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                  A calmer surface for consequential steps.
                </h2>
                <p className="mt-6 max-w-2xl text-base font-normal leading-7 text-[#A0A9BC]">
                  The internal workspace uses the current FastAPI workflow and keeps the details available when you need them—without asking a first-time visitor to understand APIs, ledgers, or state machines.
                </p>
                <div className="mt-8">
                  <LiquidLink
                    href="/demo"
                      delay={0.25}
                      fillHeight={3}
                      className="px-6 py-3 text-sm font-semibold"
                    >
                      Open the guided workspace <ArrowRight size={16} />
                  </LiquidLink>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {featureCards.map(([Icon, title, text]) => (
                  <div
                    key={title}
                    className={`rounded-2xl p-5 ${styles.monochromeCard}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                      <Icon size={19} />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm font-normal leading-6 text-[#A0A9BC]">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROTOTYPE NOTE / FINAL CTA SECTION (Directly over Orbital Particle Rings) */}
        <section className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="relative overflow-hidden p-8 md:p-12">
            {/* Section 5 Particle Formation: Orbital Resonance Rings */}
            <InteractiveSectionParticles
              formation="orbital"
              particleCount={65}
              particleOpacity={0.1}
              lineOpacity={0.1}
            />

            <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#888888]">
                  Workspace note
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
                  V2 scoped demo sessions. Simulated escrow. Real backend rules.
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-normal leading-6 text-[#A0A9BC]">
                  The live prototype uses short-lived backend-issued demo sessions and the V2 API. Unsupported features remain clearly labelled as coming soon rather than appearing operational.
                </p>
              </div>
              <LiquidLink
                href="/marketplace"
                  delay={0.25}
                  fillHeight={3}
                  className="shrink-0 px-7 py-3.5 text-sm font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Open the live marketplace <ArrowRight size={16} />
              </LiquidLink>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-[#000000]/90 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 pb-28 pt-8 text-sm font-normal text-[#888888] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <span>Auto Escrow · V2 demo workflow</span>
            <div className="flex gap-6">
              <Link href="/marketplace" className="transition-colors hover:text-white">
                Marketplace
              </Link>
              <Link href="/settings" className="transition-colors hover:text-white">
                Settings
              </Link>
              <Link href="/demo" className="transition-colors hover:text-white">
                Demo only
              </Link>
            </div>
          </div>
        </footer>
      </main>
  );
}
