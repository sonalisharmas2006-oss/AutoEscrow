"use client";

import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface LiquidButtonProps extends HTMLMotionProps<"button"> {
  delay?: number | string;
  fillHeight?: number | string;
  tapScale?: number;
  variant?: "primary" | "secondary" | "outline";
  children?: React.ReactNode;
}

export const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  (
    {
      delay = 0.3,
      fillHeight = 3,
      tapScale = 0.97,
      variant = "primary",
      className = "",
      children,
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const numericDelay =
      typeof delay === "string" ? parseFloat(delay) : delay;
    const numericHeight =
      typeof fillHeight === "string" ? parseFloat(fillHeight) : fillHeight;

    const isSecondary = variant === "secondary";
    const isOutline = variant === "outline";

    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: tapScale }}
        transition={{ type: "spring", stiffness: 550, damping: 30 }}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        disabled={disabled}
        className={`group relative isolate overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${className}`}
        style={style}
        {...props}
      >
        {/* Base button background (Monochrome) */}
        <span className="absolute inset-0 -z-20 bg-[#0A0A0A] transition-colors duration-300 dark:bg-[#050505]" />

        {/* Subtle glass border (Monochrome) */}
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-white/20 transition-colors duration-300 group-hover:border-white/60 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:border-white/15 dark:group-hover:border-white/50" />

        {/* Liquid initial bottom line & rising fluid fill (Monochrome) */}
        <motion.span
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10"
          initial={false}
          animate={{
            height: isHovered && !disabled ? "100%" : `${numericHeight}px`,
            opacity: isHovered && !disabled ? 1 : isOutline ? 0 : 0.8,
          }}
          transition={{
            height: {
              duration: numericDelay,
              ease: [0.25, 1, 0.5, 1],
            },
            opacity: { duration: 0.2 },
          }}
          style={{
            background: isSecondary
              ? "linear-gradient(135deg, #CCCCCC 0%, #888888 100%)"
              : "linear-gradient(135deg, #FFFFFF 0%, #BDBDBD 100%)",
            boxShadow: isHovered
              ? "0 0 25px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
              : "0 0 8px rgba(255, 255, 255, 0.3)",
          }}
        />

        {/* Button Content with crisp contrast shift on liquid fill */}
        <span
          className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-250 ${
            isHovered && !disabled
              ? "text-[#000000] font-semibold"
              : "text-[#FFFFFF]"
          }`}
        >
          {children}
        </span>
      </motion.button>
    );
  }
);

LiquidButton.displayName = "LiquidButton";
