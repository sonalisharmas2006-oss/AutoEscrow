"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CursorContextType {
  mouseX: any;
  mouseY: any;
  springX: any;
  springY: any;
  isVisible: boolean;
  isTouch: boolean;
  isPointer: boolean;
  global: boolean;
}

const CursorContext = createContext<CursorContextType>({
  mouseX: null,
  mouseY: null,
  springX: null,
  springY: null,
  isVisible: false,
  isTouch: false,
  isPointer: false,
  global: false,
});

export const useCursor = () => useContext(CursorContext);

export interface CursorProviderProps {
  global?: boolean;
  children: React.ReactNode;
}

export function CursorProvider({ global = false, children }: CursorProviderProps) {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Check if device supports fine pointer (mouse)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsTouch(!mediaQuery.matches);

    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsTouch(!e.matches);
    };
    mediaQuery.addEventListener("change", onMediaChange);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive =
          target.closest("button, a, input, select, textarea, [role='button']") !== null;
        setIsPointer(interactive);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      mediaQuery.removeEventListener("change", onMediaChange);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <CursorContext.Provider
      value={{
        mouseX,
        mouseY,
        springX,
        springY,
        isVisible,
        isTouch,
        isPointer,
        global,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function CursorContainer({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={`relative ${className}`}>{children}</div>;
}

export interface CursorProps {
  children?: React.ReactNode;
  className?: string;
}

export function Cursor({ children, className = "" }: CursorProps) {
  const { mouseX, mouseY, isVisible, isTouch, isPointer } = useCursor();

  if (isTouch || !isVisible) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ${className}`}
      style={{
        left: mouseX,
        top: mouseY,
      }}
    >
      {children ?? (
        <motion.div
          animate={{
            scale: isPointer ? 1.6 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
          className="relative flex items-center justify-center"
        >
          {/* Subtle electric cyan reticle dot */}
          <div className="h-2 w-2 rounded-full bg-[#00C8FF] shadow-[0_0_12px_#00C8FF]" />
        </motion.div>
      )}
    </motion.div>
  );
}

export interface CursorFollowProps {
  children?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  alignOffset?: number;
  className?: string;
}

export function CursorFollow({
  children,
  sideOffset = 15,
  alignOffset = 5,
  className = "",
}: CursorFollowProps) {
  const { springX, springY, isVisible, isTouch, isPointer } = useCursor();

  if (isTouch || !isVisible) return null;

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none fixed z-[9998] transition-opacity duration-300 ${className}`}
      style={{
        left: springX,
        top: springY,
        x: alignOffset,
        y: sideOffset,
      }}
    >
      {children ?? (
        <motion.div
          animate={{
            scale: isPointer ? 1.8 : 1,
            opacity: isPointer ? 0.8 : 0.45,
          }}
          transition={{ duration: 0.2 }}
          className="h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00C8FF]/40 bg-[#00C8FF]/10 blur-[1px] shadow-[0_0_15px_rgba(0,200,255,0.25)]"
        />
      )}
    </motion.div>
  );
}
