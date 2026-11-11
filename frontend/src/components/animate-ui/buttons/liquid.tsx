"use client";

import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface LiquidButtonProps extends HTMLMotionProps<"button"> {
  delay?: number | string;
  fillHeight?: number | string;
  tapScale?: number;
  asChild?: boolean;
  children?: React.ReactNode;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      delay = 0.3,
      fillHeight = 3,
      tapScale = 0.97,
      className = "",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const numericDelay =
      typeof delay === "string" ? parseFloat(delay) : delay;
    const numericHeight =
      typeof fillHeight === "string" ? parseFloat(fillHeight) : fillHeight;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: tapScale }}
        transition={{ type: "spring", stiffness: 550, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative isolate overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8FF] ${className}`}
        style={{
          ...style,
        }}
        {...props}
      >
        {/* Base button background */}
        <span
          className="absolute inset-0 -z-20 transition-colors duration-300"
          style={{
            backgroundColor: "var(--liquid-button-background-color, rgba(12, 18, 32, 0.85))",
          }}
        />

        {/* Ambient border glow */}
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-[rgba(0,200,255,0.3)] transition-colors duration-300 group-hover:border-[rgba(0,200,255,0.8)] group-hover:shadow-[0_0_25px_rgba(0,200,255,0.4)]" />

        {/* Liquid initial bottom line & rising fluid fill */}
        <motion.span
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10"
          initial={false}
          animate={{
            height: isHovered ? "100%" : `${numericHeight}px`,
            opacity: isHovered ? 1 : 0.85,
          }}
          transition={{
            height: {
              duration: numericDelay,
              ease: [0.25, 1, 0.5, 1],
            },
            opacity: { duration: 0.2 },
          }}
          style={{
            background:
              "var(--liquid-button-color, linear-gradient(135deg, #00C8FF 0%, #536DFF 55%, #8855FF 100%))",
            boxShadow: isHovered
              ? "0 0 30px rgba(0, 200, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
              : "0 0 10px rgba(0, 200, 255, 0.4)",
          }}
        />

        {/* Liquid surface highlight wave when rising */}
        <motion.span
          className="pointer-events-none absolute inset-x-0 -z-10 h-1 bg-white/40 blur-[1px]"
          initial={false}
          animate={{
            bottom: isHovered ? "98%" : `${numericHeight}px`,
            opacity: isHovered ? [0.6, 0.9, 0] : 0,
          }}
          transition={{
            duration: numericDelay,
            ease: [0.25, 1, 0.5, 1],
          }}
        />

        {/* Button Content */}
        <span className="relative z-10 flex items-center justify-center gap-2 text-[#F5F7FF] transition-colors duration-200">
          {children}
        </span>
      </motion.button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";
