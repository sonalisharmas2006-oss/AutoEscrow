"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export type PageTransitionEffect = "fade" | "slide" | "zoom" | "none";

export interface PageTransitionProps {
  effect?: PageTransitionEffect;
  duration?: number;
  className?: string;
  children: React.ReactNode;
}

export function PageTransition({
  effect = "fade",
  duration = 0.25,
  className = "",
  children,
}: PageTransitionProps) {
  const pathname = usePathname();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reducedMotion || effect === "none") {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
    },
  };

  const selectedVariant = variants[effect] || variants.fade;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={selectedVariant.initial}
        animate={selectedVariant.animate}
        exit={selectedVariant.exit}
        transition={{ duration, ease: [0.25, 1, 0.5, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function PageTransitionShared({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
