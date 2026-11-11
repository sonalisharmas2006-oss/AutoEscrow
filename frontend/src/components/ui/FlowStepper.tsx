"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, CheckCircle2 } from "lucide-react";

// Paths matched EXACTLY to your VS Code folder structure
const steps = [
  { id: "discover", label: "Discover", path: "/discover" },
  { id: "risk", label: "Risk", path: "/risk" },
  { id: "negotiation", label: "Negotiate", path: "/negotiation" },
  { id: "escrow", label: "Escrow", path: "/escrow" },
  { id: "execution", label: "Execute", path: "/execution" },
  { id: "verification", label: "Verify", path: "/verification" },
  { id: "reputation", label: "Reputation", path: "/reputation" },
];

export function FlowStepper() {
  const pathname = usePathname();

  // Hide the stepper if we are on the Home (Overview) or Settings page
  if (pathname === "/" || pathname === "/settings") return null;

  return (
    <div className="absolute left-1/2 top-10 z-50 flex w-full max-w-7xl -translate-x-1/2 items-center justify-center px-6 text-[10px] font-bold uppercase tracking-widest sm:px-8 lg:px-12">
      {steps.map((step, index) => {
        const isActive = pathname === step.path;
        const isPast = steps.findIndex((s) => s.path === pathname) > index;

        return (
          <div key={step.id} className="flex items-center">
            <Link
              href={step.path}
              className={`flex items-center gap-1.5 transition-all ${
                isActive
                  ? "rounded-full border border-black/30 bg-black/10 px-3 py-1.5 text-black shadow-sm dark:border-white/30 dark:bg-white/10 dark:text-white"
                  : isPast
                  ? "text-[#888888] hover:text-black dark:text-[#CCCCCC] dark:hover:text-white"
                  : "text-[#888888]/60 hover:text-black dark:text-[#888888] dark:hover:text-white"
              }`}
            >
              {isActive ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black shadow-[0_0_6px_rgba(0,0,0,0.5)] dark:bg-white dark:shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              ) : (
                <CheckCircle2 size={12} className={isPast ? "text-black dark:text-[#CCCCCC]" : "opacity-40"} />
              )}
              {step.label}
            </Link>
            {index < steps.length - 1 && (
              <ChevronRight size={12} className="mx-3 text-[#888888] opacity-60" />
            )}
          </div>
        );
      })}
    </div>
  );
}
