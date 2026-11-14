import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SessionNotice } from "@/components/ui/SessionNotice";
import GlobalExperience from "@/components/GlobalExperience";

export const metadata = {
  title: "AutoEscrow",
  description: "AutoEscrow V2 marketplace and session-scoped workflow with explainable matching, versioned agreements, and a simulated escrow ledger.",
  icons: {
    icon: [{ url: "/branding/autoescrow-favicon.jpg", type: "image/jpeg" }],
    apple: [{ url: "/branding/autoescrow-favicon.jpg", type: "image/jpeg" }],
  },
};

function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden will-change-transform">
      <div className="absolute inset-0 bg-[#000000]" />
      <div className="absolute -right-[10%] -top-[15%] h-[55vw] w-[55vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)] blur-2xl" />
      <div className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] blur-2xl" />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#000000] text-white antialiased font-sans">
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          enableSystem={false}
        >
          <AmbientBackground />
          <GlobalExperience>{children}</GlobalExperience>
          <SessionNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}
