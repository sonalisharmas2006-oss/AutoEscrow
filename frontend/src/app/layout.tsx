import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SessionNotice } from "@/components/ui/SessionNotice";

export const metadata = {
  title: "AutoEscrow",
  description: "A synthetic AI-agent workflow prototype with versioned agreements, simulated escrow, verification, and audit records.",
};

// --- OPTIMIZED INSTANT BACKGROUND (Zero Layout Thrashing) ---
function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden will-change-transform">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 via-sky-50/50 to-slate-200" />
      <div className="absolute -right-[12%] -top-[18%] h-[62vw] w-[62vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,.66),rgba(186,230,253,.2)_44%,transparent_72%)] blur-3xl" />
      <div className="absolute -bottom-[24%] -left-[14%] h-[68vw] w-[68vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,.22),rgba(186,230,253,.2)_42%,transparent_72%)] blur-3xl" />
      <div className="absolute right-[8%] top-[18%] h-[34vw] w-[34vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,.1),rgba(226,232,240,.16)_46%,transparent_74%)] blur-3xl" />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-transparent text-slate-900 antialiased font-sans">
        <ThemeProvider attribute="class" forcedTheme="light" enableColorScheme={false} storageKey="autoescrow-theme">
            <AmbientBackground />
            <div className="relative z-10">{children}</div>
            <SessionNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}
