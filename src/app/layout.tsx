import "./globals.css";
import { FlowProvider } from "@/context/FlowContext";
import { ThemeProvider } from "next-themes";
import { GlobalCookieBanner } from "@/components/ui/GlobalCookieBanner";

export const metadata = {
  title: "AutoEscrow",
  description: "Trust Infrastructure",
};

// --- THIS IS THE NEW 0% GPU BACKGROUND ---
function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center hidden dark:flex">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      {/* Replaced heavy blur filters with fast radial gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(76,29,149,0.15)_0%,transparent_70%)]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.15)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)]" />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-50 dark:bg-[#07090E] text-zinc-900 dark:text-slate-100 antialiased font-sans transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <FlowProvider>
            <AmbientBackground /> {/* <-- ADDED HERE */}
            {children}
            <GlobalCookieBanner />
          </FlowProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}