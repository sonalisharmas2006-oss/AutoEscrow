"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { 
  CheckCircle2, Sun, Moon, Monitor, Shield, 
  Bot, User, Cookie, Settings2 
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("appearance");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for themes
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-zinc-50 dark:bg-[#050508] transition-colors duration-500 text-zinc-900 dark:text-white selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black font-sans overflow-x-hidden">
      
      {/* Background Ambience (Only visible in dark mode for contrast) */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center hidden dark:flex">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[20%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-zinc-900/40 blur-[120px]" />
      </div>

      <Sidebar />

      <div className="relative z-10 w-full min-h-screen pl-[100px] pr-8 pt-24 pb-24 max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* =========================================================
            SETTINGS SIDEBAR
            ========================================================= */}
        <aside className="w-full md:w-64 shrink-0">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Settings</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-light">Manage your protocol preferences.</p>
          </header>

          <nav className="flex flex-col gap-2">
            <TabButton icon={User} label="Account Profile" id="account" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton icon={Sun} label="Appearance" id="appearance" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton icon={Bot} label="Agent Rules" id="agent" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton icon={Shield} label="Security" id="security" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton icon={Cookie} label="Privacy & Cookies" id="privacy" activeTab={activeTab} setActiveTab={setActiveTab} />
          </nav>
        </aside>

        {/* =========================================================
            SETTINGS CONTENT
            ========================================================= */}
        <section className="flex-1 bg-white dark:bg-[#0a0a0f]/80 dark:backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-xl dark:shadow-2xl min-h-[600px] transition-colors duration-500">
          
          {/* --- APPEARANCE TAB --- */}
          {activeTab === "appearance" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Interface Theme</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mb-8 max-w-md">
                Customize the look and feel of the AutoEscrow protocol. Select your preferred color mode.
              </p>

              {mounted && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <ThemeCard id="light" icon={Sun} label="Light Mode" currentTheme={theme} setTheme={setTheme} />
                  <ThemeCard id="dark" icon={Moon} label="Dark Mode" currentTheme={theme} setTheme={setTheme} />
                  <ThemeCard id="system" icon={Monitor} label="System" currentTheme={theme} setTheme={setTheme} />
                </div>
              )}
            </div>
          )}

          {/* --- AGENT RULES TAB --- */}
          {activeTab === "agent" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Settings2 size={18} />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Autonomous Agent Settings</h2>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mb-8 max-w-md">
                Configure risk tolerances, automated spending caps, and verification bypass rules for your deployed agents.
              </p>

              <div className="flex flex-col gap-4">
                <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Auto-Release Escrow on 5-Layer Pass</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Execute settlement instantly without manual review.</div>
                  </div>
                  <div className="w-12 h-6 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-end px-1 cursor-pointer">
                    <div className="w-4 h-4 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-sm dark:shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Maximum Single Task Spend</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Require multi-sig manual approval beyond this value.</div>
                  </div>
                  <div className="relative w-32">
                    <input 
                      type="number" 
                      placeholder="500" 
                      className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-emerald-500/30 rounded-xl py-2 px-3 pr-12 text-sm font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600/50 dark:text-emerald-500/50 pointer-events-none">USDC</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PRIVACY & COOKIES TAB --- */}
          {activeTab === "privacy" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Privacy & Cookies</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mb-8 max-w-md">
                Manage how AutoEscrow utilizes telemetry, local storage, and tracking cookies to improve your experience.
              </p>

              <div className="flex flex-col gap-4">
                <CookieToggle title="Strictly Necessary" desc="Core infrastructure cookies required for wallet connection and sessions." locked={true} />
                <CookieToggle title="Performance & Analytics" desc="Anonymous telemetry to help us improve UI routing and RPC node latency." locked={false} active={true} />
                <CookieToggle title="Marketing & Retargeting" desc="Cookies used for off-site marketing and ecosystem partner integrations." locked={false} active={false} />
              </div>
            </div>
          )}

          {/* --- PLACEHOLDER --- */}
          {(activeTab === "account" || activeTab === "security") && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full text-center pt-10">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Settings2 size={24} className="text-zinc-400 dark:text-zinc-500" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Under Construction</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">This configuration pane will be available once the user database is connected.</p>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function TabButton({ icon: Icon, label, id, activeTab, setActiveTab }: any) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        isActive 
          ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white shadow-inner" 
          : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5"
      }`}
    >
      <Icon size={18} className={isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-500"} />
      {label}
    </button>
  );
}

function ThemeCard({ id, icon: Icon, label, currentTheme, setTheme }: any) {
  const isActive = currentTheme === id;
  return (
    <button 
      onClick={() => setTheme(id)}
      className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${
        isActive 
          ? "border-blue-500 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10 shadow-lg dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]" 
          : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10"
      }`}
    >
      {isActive && (
        <div className="absolute top-3 right-3 text-blue-500 dark:text-blue-400">
          <CheckCircle2 size={16} />
        </div>
      )}
      <Icon size={32} className={isActive ? "text-blue-500 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"} strokeWidth={1.5} />
      <span className={`text-sm font-semibold ${isActive ? "text-blue-700 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>{label}</span>
    </button>
  );
}

function CookieToggle({ title, desc, locked, active }: { title: string, desc: string, locked: boolean, active?: boolean }) {
  return (
    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex items-start justify-between">
      <div className="pr-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-bold text-zinc-900 dark:text-white">{title}</div>
          {locked && <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">Always Active</span>}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</div>
      </div>
      
      {!locked ? (
        <div className={`shrink-0 w-12 h-6 rounded-full border flex items-center px-1 cursor-pointer transition-colors ${
          active ? "bg-blue-100 dark:bg-blue-500/20 border-blue-300 dark:border-blue-500/50 justify-end" : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 justify-start"
        }`}>
          <div className={`w-4 h-4 rounded-full ${active ? "bg-blue-500 dark:bg-blue-400 shadow-sm" : "bg-zinc-400 dark:bg-zinc-500"}`} />
        </div>
      ) : (
        <div className="shrink-0 w-12 h-6 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 flex items-center justify-end px-1 opacity-50 cursor-not-allowed">
          <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full" />
        </div>
      )}
    </div>
  );
}