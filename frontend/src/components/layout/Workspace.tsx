"use client";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";

export default function Workspace({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <main className="workspace"><Sidebar /><div className="workspace-content"><header className="workspace-heading"><div><Link href="/" className="eyebrow">Auto Escrow / Synthetic workspace</Link><h1>{title}</h1><p>{intro}</p></div><Link className="primary-button" href="/demo/">Open guided workflow →</Link></header><p className="demo-disclaimer">Hackathon MVP · synthetic profiles · simulated ledger only · no real payments or independent arbitration.</p>{children}</div></main>;
}
