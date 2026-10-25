"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquareCode,
  PlayCircle,
  PlusCircle,
  Settings,
  ShieldAlert,
  Store,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Guided Demo", href: "/demo", icon: PlayCircle },
  { label: "Jobs", href: "/jobs", icon: PlusCircle },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Risk Matrix", href: "/risk", icon: ShieldAlert },
  { label: "Negotiation", href: "/negotiation", icon: MessageSquareCode },
  { label: "Escrow Vault", href: "/escrow", icon: Lock },
  { label: "Execution", href: "/execution", icon: PlayCircle },
  { label: "Verification", href: "/verification", icon: CheckCircle2 },
  { label: "Disputes", href: "/disputes", icon: ShieldAlert },
  { label: "Audit history", href: "/audit", icon: Award },
  { label: "Initialize Escrow", href: "/initialize", icon: PlusCircle },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handlePrefetch = (href: string) => router.prefetch(href);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const dockSurface = "border-white/70 bg-white/40 text-slate-700 shadow-slate-500/20";
  const idleItem = "hover:bg-white/60 hover:text-[#0b4779]";
  const activeItem = "bg-white/70 text-[#0b4779] shadow-[0_6px_18px_rgba(52,102,145,.16)]";

  return <>
    <nav className={`fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2.5 shadow-2xl backdrop-blur-2xl ${dockSurface}`} aria-label="Workspace dock">
      <Link href="/" onMouseEnter={() => handlePrefetch("/")} aria-label="Auto Escrow home" title="Auto Escrow home" className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b2447] text-[10px] font-bold text-white shadow-md transition-all duration-300 ease-out hover:scale-125 hover:bg-[#12345d]">
        AE
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">Auto Escrow home</span>
      </Link>

      <div className="scrollbar-none flex max-w-[calc(100vw-8rem)] items-center gap-1.5 overflow-x-auto px-1 py-1 md:max-w-none md:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = active(item.href);
          return <Link key={item.label} href={item.href} onMouseEnter={() => handlePrefetch(item.href)} aria-current={selected ? "page" : undefined} aria-label={item.label} title={item.label} className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out hover:scale-125 focus-visible:scale-110 focus-visible:outline-none ${selected ? activeItem : idleItem}`}>
            <Icon size={18} strokeWidth={1.8} />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">{item.label}</span>
            {selected && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#0b4779]" />}
          </Link>;
        })}
      </div>

      <button type="button" className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-125 hover:bg-white/60 hover:text-[#0b4779] md:hidden" aria-expanded={mobileOpen} aria-controls="mobile-links" aria-label={mobileOpen ? "Close workspace navigation" : "Open workspace navigation"} title={mobileOpen ? "Close workspace navigation" : "Open workspace navigation"} onClick={() => setMobileOpen((open) => !open)}>
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">{mobileOpen ? "Close workspace navigation" : "Open workspace navigation"}</span>
      </button>

      {mobileOpen && <div id="mobile-links" role="navigation" aria-label="Mobile navigation" className={`absolute bottom-full right-0 mb-3 grid max-h-[60vh] w-[min(22rem,calc(100vw-1.5rem))] grid-cols-2 gap-1 overflow-auto rounded-3xl border p-3 shadow-2xl backdrop-blur-2xl ${dockSurface}`}>
        {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`rounded-2xl px-3 py-3 text-sm font-medium transition ${active(item.href) ? activeItem : idleItem}`}>{item.label}</Link>)}
      </div>}
    </nav>
  </>;
}
