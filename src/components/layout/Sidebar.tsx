"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Telescope, 
  ShieldAlert, 
  Handshake, 
  Landmark, 
  Cpu, 
  ShieldCheck, 
  ScrollText, 
  Settings 
} from "lucide-react";

type NavItem = { label: string; icon: React.ElementType; path: string };

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutGrid, path: "/" },
  { label: "Discover", icon: Telescope, path: "/discover" },
  { label: "Risk", icon: ShieldAlert, path: "/risk" },
  { label: "Negotiate", icon: Handshake, path: "/negotiation" },
  { label: "Escrow", icon: Landmark, path: "/escrow" },
  { label: "Execute", icon: Cpu, path: "/execution" },
  { label: "Verify", icon: ShieldCheck, path: "/verification" },
  { label: "Reputation", icon: ScrollText, path: "/reputation" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center justify-between h-[90vh] w-[64px] rounded-full py-6 bg-white/80 dark:bg-black/20 backdrop-blur-xl border border-zinc-200 dark:border-white/5 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors duration-500">
      <div className="flex flex-col items-center gap-6">
        
        {/* Brand Logo */}
        <Link 
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-zinc-900 dark:text-white hover:scale-110 transition-transform mb-2"
          title="AutoEscrow Home"
        >
          <span className="font-extrabold text-[13px] tracking-tighter">AE</span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className="group flex h-10 w-10 items-center justify-center bg-transparent transition-all"
                title={item.label}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.75}
                  className={`transition-all duration-300 ${
                    isActive 
                      ? "text-blue-600 dark:text-white scale-110 drop-shadow-md dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                      : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings Tab */}
      <Link 
        href="/settings"
        className="flex h-10 w-10 items-center justify-center bg-transparent transition-all mt-4"
        title="Settings"
      >
        <Settings 
          size={18} 
          strokeWidth={1.75} 
          className={`transition-all duration-300 ${
            pathname === "/settings" 
              ? "text-blue-600 dark:text-white scale-110" 
              : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`} 
        />
      </Link>
    </aside>
  );
}