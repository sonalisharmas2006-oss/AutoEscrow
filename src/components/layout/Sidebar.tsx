"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Compass, 
  ShieldAlert, 
  MessageSquareCode, 
  Lock, 
  PlayCircle, 
  CheckCircle2, 
  Award, 
  PlusCircle, 
  Store, 
  Settings 
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Risk Matrix", href: "/risk", icon: ShieldAlert },
    { label: "Negotiation", href: "/negotiation", icon: MessageSquareCode },
    { label: "Escrow Vault", href: "/escrow", icon: Lock },
    { label: "Execution", href: "/execution", icon: PlayCircle },
    { label: "Verification", href: "/verification", icon: CheckCircle2 },
    { label: "Reputation", href: "/reputation", icon: Award },
    { label: "Initialize Escrow", href: "/initialize", icon: PlusCircle },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handlePrefetch = (href: string) => {
    // Actively triggers Next.js compiler in the background before the user clicks
    router.prefetch(href);
  };

  return (
    <aside 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{ width: isExpanded ? "240px" : "68px" }}
      className="fixed left-3 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-start py-4 px-2.5 rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out overflow-hidden"
    >
      
      {/* Brand Logo Dock Icon */}
      <Link 
        href="/"
        onMouseEnter={() => handlePrefetch("/")}
        className="flex items-center gap-3 w-full p-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs mb-3 shadow-md shrink-0 cursor-pointer"
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 dark:bg-zinc-100 shrink-0">
          AE
        </div>
        <span 
          style={{ opacity: isExpanded ? 1 : 0 }} 
          className="whitespace-nowrap transition-opacity duration-150 font-semibold text-xs tracking-tight"
        >
          AutoEscrow
        </span>
      </Link>

      <div className="w-full h-[1px] bg-zinc-200 dark:bg-white/10 mb-3" />

      {/* Navigation Links Dock */}
      <nav className="flex flex-col items-start gap-1 w-full overflow-y-auto max-h-[75vh] scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              onMouseEnter={() => handlePrefetch(item.href)}
              className="flex items-center gap-3.5 w-full p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-150 shrink-0 cursor-pointer"
            >
              <div className="flex items-center justify-center w-7 h-7 shrink-0">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <span 
                style={{ opacity: isExpanded ? 1 : 0 }} 
                className="whitespace-nowrap transition-opacity duration-150 text-xs font-medium tracking-wide"
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}