import React from "react";
import { ShieldCheck } from "lucide-react";

export const TrustScoreBadge = ({ score }: { score: number }) => {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-black/5 px-3 py-1 text-xs font-semibold text-black dark:border-white/20 dark:bg-white/10 dark:text-white">
      <ShieldCheck className="h-3.5 w-3.5" />
      <span>Trust Score {score.toFixed(1)}</span>
    </div>
  );
};
