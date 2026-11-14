"use client";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ReactNode } from "react";

export default function Workspace({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="workspace">
      <div className="workspace-content">
        <header className="workspace-heading">
          <div>
            <Link href="/" className="eyebrow flex items-center gap-2">
              <BrandLogo className="h-8 w-[22px]" />
              <span>Auto Escrow / Live V2 workspace</span>
            </Link>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
          <Link className="primary-button" href="/marketplace/">Open live marketplace →</Link>
        </header>
        <p className="demo-disclaimer">V2 scoped demo session · simulated ledger only · no real funds or independent arbitration.</p>
        {children}
      </div>
    </main>
  );
}
