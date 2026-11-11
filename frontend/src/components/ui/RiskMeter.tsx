import React from "react";

export const RiskMeter = ({ score }: { score: number }) => {
  const getLevel = (s: number) => {
    if (s <= 25) return { label: "LOW RISK", color: "text-black dark:text-white", bar: "bg-black dark:bg-white" };
    if (s <= 60) return { label: "MODERATE RISK", color: "text-[#666666] dark:text-[#CCCCCC]", bar: "bg-[#666666] dark:bg-[#CCCCCC]" };
    return { label: "HIGH RISK", color: "text-[#999999] dark:text-[#888888]", bar: "bg-[#999999] dark:bg-[#888888]" };
  };

  const level = getLevel(score);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#888888]">Risk Assessment Index</span>
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border border-black/10 dark:border-white/10 ${level.color}`}>
          {level.label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-mono font-bold text-black dark:text-white">{score}</span>
        <span className="text-sm text-[#888888]">/ 100</span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
        <div
          className={`h-full transition-all duration-700 rounded-full ${level.bar}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
};
