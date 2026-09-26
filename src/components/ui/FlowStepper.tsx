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
    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center text-[10px] uppercase tracking-widest font-bold w-full max-w-5xl px-8">
      {steps.map((step, index) => {
        const isActive = pathname === step.path;
        const isPast = steps.findIndex(s => s.path === pathname) > index;

        return (
          <div key={step.id} className="flex items-center">
            <Link
              href={step.path}
              className={`flex items-center gap-1.5 transition-all hover:text-white ${
                isActive
                  ? "text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 rounded-full"
                  : isPast
                  ? "text-emerald-500/60 hover:text-emerald-400"
                  : "text-zinc-600"
              }`}
            >
              {isActive ? (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <CheckCircle2 size={12} className={isPast ? "text-emerald-500/60" : ""} />
              )}
              {step.label}
            </Link>
            {index < steps.length - 1 && (
              <ChevronRight size={12} className="mx-3 opacity-30 text-zinc-500" />
            )}
          </div>
        );
      })}
    </div>
  );
}