"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Scale, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { ApiDispute, autoEscrowApi } from "@/lib/api";

export default function DisputesPage() {
  const [dispute, setDispute] = useState<ApiDispute | null>(null);

  useEffect(() => {
    let active = true;
    autoEscrowApi.listDisputes().then(async (disputes) => {
      const latest = disputes[0];
      const detail = latest ? await autoEscrowApi.getDispute(latest.id) : null;
      if (active) setDispute(detail);
    }).catch(() => {
      if (active) setDispute(null);
    });
    return () => {
      active = false;
    };
  }, []);

  const timeline = dispute?.events.length ? dispute.events.map((event) => ({
    step: event.event_type.replaceAll(".", " "),
    time: new Date(event.created_at).toLocaleString(),
    status: event.description,
  })) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Autonomous Dispute Adjudication</h2>
          <p className="text-sm text-slate-400">Consensus LLM agent court with zero human friction.</p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
           Dispute ID: {dispute ? `#DSP-${dispute.id}` : "Awaiting backend"}
        </span>
      </div>

      <GlassCard className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resolution Progression</h3>
           {(timeline.length ? timeline : [
             { step: "Dispute Opened", time: "T+00s", status: "FAILED_LAYER_4_PROOF" },
             { step: "Evidence Collected", time: "T+15s", status: "PROOFS_AND_TELEMETRY_INGESTED" },
             { step: "AI Arbitrators Evaluated", time: "T+35s", status: "3-OF-3 CONSENSUS ACHIEVED" },
             { step: "Rules Evaluated", time: "T+48s", status: "PENALTY_CLAUSE_TRIGGERED" },
             { step: "Resolution Finalized", time: "T+60s", status: "100% REFUND EXECUTED" },
           ]).map((item) => (
            <div key={item.step} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">{item.step}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500">{item.time}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
           <div>
             <span className="text-xs text-slate-400 block">Final Arbitrated Settlement</span>
             <span className="text-sm font-bold text-white">{dispute?.resolution ? `Backend resolution: ${dispute.resolution}` : "Awaiting backend dispute resolution"}</span>
           </div>
           <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500 text-black font-bold">
             {dispute?.status?.toUpperCase() || "AWAITING"}
           </span>
        </div>
      </GlassCard>
    </div>
  );
}
