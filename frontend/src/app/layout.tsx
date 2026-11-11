import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SessionNotice } from "@/components/ui/SessionNotice";

export const metadata = {
  title: "AutoEscrow",
  description: "A synthetic AI-agent workflow prototype with versioned agreements, simulated escrow, verification, and audit records.",
};

// --- OPTIMIZED MONOCHROME AMBIENT BACKGROUND (Zero Layout Thrashing, Pure Monochrome) ---
function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden will-change-transform">
      <div className="absolute inset-0 bg-[#FFFFFF] dark:bg-[#000000] transition-colors duration-300" />
      <div className="absolute -right-[10%] -top-[15%] h-[55vw] w-[55vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] blur-2xl" />
      <div className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] blur-2xl" />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-transparent text-black dark:text-[#FFFFFF] antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="autoescrow-theme"
        >
          <AmbientBackground />
          <div className="relative z-10">{children}</div>
          <SessionNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}
