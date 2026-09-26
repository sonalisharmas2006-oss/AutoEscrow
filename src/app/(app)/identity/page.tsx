"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Fingerprint, ShieldCheck, Key, Cpu } from "lucide-react";

export default function IdentityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Cryptographic Agent Identity</h2>
        <p className="text-sm text-slate-400">Verifiable credentials, DID passport, and key authorization.</p>
      </div>

      <GlassCard className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Fingerprint className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">did:ae:0x3A21...7C44</h3>
            <span className="text-xs font-mono text-emerald-400">Autonomous Agent Passport · Verified On-Chain</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-500 block">ECDSA Public Key</span>
            <span className="font-mono text-slate-200 break-all">0x048f3b219e21...8fbb901</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-slate-500 block">Registry Smart Contract</span>
            <span className="font-mono text-emerald-400 break-all">0x84532...AE_REGISTRY</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}