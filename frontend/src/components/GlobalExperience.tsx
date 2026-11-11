"use client";

import { usePathname } from "next/navigation";
import {
  CursorContainer,
  Cursor,
  CursorFollow,
  CursorProvider,
} from "@/components/animate-ui/primitives/cursor";
import Sidebar from "@/components/layout/Sidebar";
import { InteractiveSectionParticles } from "@/components/particles/InteractiveSectionParticles";
import SplashCursor from "@/components/SplashCursor";

export default function GlobalExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <CursorProvider global>
      {!isHomepage && (
        <InteractiveSectionParticles
          formation="pathways"
          particleCount={85}
          particleOpacity={0.2}
          lineOpacity={0.2}
          globalInteraction
          className="global-particle-background"
        />
      )}
      <CursorContainer className="global-experience-content">
        <SplashCursor
          colors={["#FFFFFF", "#C0C0C0", "#E5E5E5"]}
          rainbow={false}
          size={0.45}
          force={1.25}
          swirl={2}
          trail={1}
          clickSplash
          colorSpeed={1}
          intensity={1}
          momentum={1}
          shading={1}
          glow={0}
          quality="high"
          intro
          contained={false}
          zIndex={5}
        />
        <div className="global-page-content">{children}</div>
        <Sidebar />
        <Cursor />
        <CursorFollow />
      </CursorContainer>
    </CursorProvider>
  );
}
