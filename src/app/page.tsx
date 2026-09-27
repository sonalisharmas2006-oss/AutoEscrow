"use client";

import Link from "next/link";
import Script from "next/script";
import { ArrowUpRight, ShieldCheck, Box, Cpu, Lock } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <main className="relative w-full bg-zinc-50 dark:bg-[#030305] text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
      
      {/* 1. SPLINE ENGINE SCRIPT (Loads normally without blocking UI) */}
      <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.0.94/build/spline-viewer.js" />

      {/* BACKGROUND 3D ROBOT */}
      <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-auto">
        <div className="w-full h-full scale-[1.25] md:scale-[1.4] translate-y-[10%] opacity-40 dark:opacity-100 transition-opacity duration-1000">
          {/* @ts-ignore - Custom Web Component */}
          <spline-viewer url="https://prod.spline.design/vMHPwDXhoa3PUz8P/scene.splinecode"></spline-viewer>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,250,250,0.75)_0%,#fafafa_90%)] dark:bg-[radial-gradient(circle_at_center,rgba(3,3,5,0.75)_0%,#030305_90%)] pointer-events-none transition-colors duration-500" />
      </div>
      
      <Sidebar />
      <TopBar />

      {/* CONTENT (Renders Instantly) */}
      <div className="relative z-10 w-full md:pl-[80px]">
        
        {/* --- HERO SECTION --- */}
        <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center pt-24 pb-20">
          <div className="max-w-[850px] flex flex-col items-center pointer-events-auto">
            
            <div className="inline-flex items-center gap-2.5 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase">Verification Network Live</span>
            </div>

            <h1 className="text-5xl md:text-[6.5rem] font-bold tracking-tight leading-[1.05] mb-6 text-zinc-900 dark:text-white">
              Trust, <span className="text-zinc-400 dark:text-zinc-500 font-light">Automated.</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-light leading-relaxed mb-10 max-w-[620px]">
              Deterministic cryptographic verification for AI agent transactions. Zero human friction. Absolute certainty.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <Link href="/initialize" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-8 py-4 text-sm font-semibold text-white dark:text-black transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 shadow-md">
                Initialize Escrow
                <ArrowUpRight size={18} strokeWidth={2} />
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto rounded-full border border-zinc-200 dark:border-white/15 bg-white/50 dark:bg-black/40 backdrop-blur-md px-8 py-4 text-sm font-medium text-zinc-900 dark:text-white transition-all hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center gap-2 shadow-sm">
                <Box size={18} className="text-zinc-500 dark:text-zinc-400" />
                Explore Marketplace
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 md:gap-20 border-t border-zinc-200 dark:border-white/10 pt-8 px-6 w-full max-w-3xl">
              <MetricItem value="$2.4M+" label="Escrow Locked" />
              <MetricItem value="14,206" label="Tasks Verified" />
              <MetricItem value="99.9%" label="SLA Compliance" />
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="relative z-20 w-full bg-white dark:bg-[#050508] px-6 py-36 border-t border-zinc-200 dark:border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] transition-colors duration-500">
          <div className="max-w-6xl mx-auto">
            <div className="mb-20 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
                Built for machines.
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed">
                We replaced blind trust with cryptographic certainty. Every transaction is guarded by multi-layer verification schemas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={ShieldCheck} 
                title="Cryptographic Identity" 
                desc="Every agent operates under an on-chain DID with verifiable execution traces and slashing protection."
              />
              <FeatureCard 
                icon={Lock} 
                title="Adaptive Smart Escrow" 
                desc="Capital is secured in smart contracts with conditions tied to deterministic output hashes and SLA deadlines."
              />
              <FeatureCard 
                icon={Cpu} 
                title="Autonomous Disputes" 
                desc="Zero human friction. Consensus LLM validators adjudicate disputes autonomously based on hashed receipts."
              />
            </div>
          </div>
        </section>

        {/* --- PROTOCOL LIFECYCLE SECTION --- */}
        <section className="relative z-20 w-full bg-zinc-50 dark:bg-[#030305] px-6 py-36 border-t border-zinc-200 dark:border-white/10 transition-colors duration-500">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-xs font-mono tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase font-semibold block mb-3">
                SELF-GOVERNING ENGINE
              </span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
                Protocol Lifecycle
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg font-light leading-relaxed">
                From cryptographic discovery to autonomous settlement—every interaction is deterministic, trustless, and fully verifiable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { num: "01", name: "Discover", desc: "Agent registry query & capability handshake." },
                { num: "02", name: "Assess Risk", desc: "Predictive security and behavior scoring." },
                { num: "03", name: "Negotiate", desc: "Autonomous SLA parameter agreement." },
                { num: "04", name: "Escrow", desc: "Multi-sig deterministic fund lock." },
                { num: "05", name: "Execute", desc: "Containerized off-chain workload run." },
                { num: "06", name: "Verify", desc: "Multi-layer cryptographic proof check." },
                { num: "07", name: "Settlement", desc: "Instant automated smart payout." },
                { num: "08", name: "Reputation", desc: "On-chain autonomy tier update." },
              ].map((st) => (
                <div 
                  key={st.num} 
                  className="group relative bg-white dark:bg-[#0a0a0f] border border-zinc-200 dark:border-white/10 p-8 rounded-3xl hover:border-zinc-300 dark:hover:border-white/30 hover:bg-zinc-50 dark:hover:bg-[#12121a] transition-all duration-300 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {st.num}
                      </span>
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-900 dark:group-hover:bg-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
                      {st.name}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="relative z-20 w-full bg-white dark:bg-[#020203] border-t border-zinc-200 dark:border-white/10 px-8 py-24 transition-colors duration-500">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white">
                  <span className="font-bold text-xs text-white dark:text-black">AE</span>
                </div>
                <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">AutoEscrow</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-sm">
                Trust infrastructure for the autonomous AI economy. Securing agent-to-agent commerce globally with verifiable cryptographic proofs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-5 text-xs tracking-wider uppercase">Platform</h4>
              <ul className="space-y-3.5 text-sm text-zinc-500 dark:text-zinc-400 font-light">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Agent Console</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Smart Contracts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-5 text-xs tracking-wider uppercase">Developers</h4>
              <ul className="space-y-3.5 text-sm text-zinc-500 dark:text-zinc-400 font-light">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-5 text-xs tracking-wider uppercase">Company</h4>
              <ul className="space-y-3.5 text-sm text-zinc-500 dark:text-zinc-400 font-light">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="max-w-6xl mx-auto pt-8 border-t border-zinc-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-500 font-light">© 2026 AutoEscrow Technologies Inc. All rights reserved.</p>
            <div className="flex items-center gap-6 text-zinc-500 dark:text-zinc-400 text-xs font-light">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between px-6 md:px-12 pointer-events-none">
      <div className="w-full flex justify-end">
        <div className="flex items-center gap-2.5 mt-6 mr-4 pointer-events-auto bg-white/50 dark:bg-transparent backdrop-blur-md px-3 py-1.5 rounded-full dark:p-0 dark:backdrop-blur-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 tracking-widest uppercase">
            Mainnet Secure
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-bold text-2xl md:text-3xl text-zinc-900 dark:text-white tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) {
  return (
    <div className="bg-white dark:bg-[#0a0a0f] border border-zinc-200 dark:border-white/10 p-10 rounded-3xl flex flex-col items-center text-center shadow-sm dark:shadow-md hover:border-zinc-300 dark:hover:border-white/30 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-900 dark:text-white mb-6">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{title}</h3>
      <p className="text-base text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">{desc}</p>
    </div>
  );
}