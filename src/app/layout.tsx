import "./globals.css";
import { FlowProvider } from "@/context/FlowContext";
import { ThemeProvider } from "next-themes";
import { GlobalCookieBanner } from "@/components/ui/GlobalCookieBanner";

export const metadata = {
  title: "AutoEscrow — Trust Infrastructure for Autonomous AI Commerce",
  description: "Secure, verifiable escrow and multi-layer work verification for AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Suppress hydration warning is required for next-themes
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-50 dark:bg-[#07090E] text-zinc-900 dark:text-slate-100 antialiased font-sans transition-colors duration-300">
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <FlowProvider>
            {children}
            <GlobalCookieBanner />
          </FlowProvider>
        </ThemeProvider>
        
      </body>
    </html>
  );
}