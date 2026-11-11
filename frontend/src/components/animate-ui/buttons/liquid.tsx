"use client";

import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { LinkProps } from "next/link";
import Magnet from "@/components/Magnet";

export interface LiquidButtonProps extends HTMLMotionProps<"button"> {
  delay?: number | string;
  fillHeight?: number | string;
  tapScale?: number;
  variant?: "primary" | "secondary" | "outline";
  contentClassName?: string;
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
      contentClassName = "",
      children,
      style,
      disabled,
      onMouseEnter,
      onMouseLeave,
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
      <Magnet
        padding={80}
        magnetStrength={10}
        maxOffset={8}
        disabled={disabled}
        style={className.includes("w-full") ? { display: "block", width: "100%" } : undefined}
      >
        <motion.button
          ref={ref}
          whileTap={disabled ? undefined : { scale: tapScale }}
          transition={{ type: "spring", stiffness: 550, damping: 30 }}
          onMouseEnter={(event) => {
            if (!disabled) setIsHovered(true);
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            setIsHovered(false);
            onMouseLeave?.(event);
          }}
          disabled={disabled}
          data-liquid-button=""
          className={`group relative isolate overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${className}`}
          style={style}
          {...props}
        >
          <span className="absolute inset-0 -z-20 bg-[#0A0A0A] transition-colors duration-300 dark:bg-[#050505]" />
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-white/20 transition-colors duration-300 group-hover:border-white/60 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:border-white/15 dark:group-hover:border-white/50" />
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
          <span
            className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-250 ${contentClassName} ${
              isHovered && !disabled
                ? "text-[#000000] font-semibold"
                : "text-[#FFFFFF]"
            }`}
          >
            {children}
          </span>
        </motion.button>
      </Magnet>
    );
  }
);

LiquidButton.displayName = "LiquidButton";

type LiquidLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Omit<LinkProps, "href"> & {
    href: LinkProps["href"];
    delay?: number | string;
    fillHeight?: number | string;
    variant?: "primary" | "secondary" | "outline";
  };

export function LiquidLink({
  href,
  delay = 0.3,
  fillHeight = 3,
  variant = "primary",
  className = "",
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: LiquidLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const numericDelay = typeof delay === "string" ? parseFloat(delay) : delay;
  const numericHeight = typeof fillHeight === "string" ? parseFloat(fillHeight) : fillHeight;
  const isOutline = variant === "outline";
  const isSecondary = variant === "secondary";

  return (
    <Magnet
      padding={80}
      magnetStrength={10}
      maxOffset={8}
      style={className.includes("w-full") ? { display: "block", width: "100%" } : undefined}
    >
      <Link
        href={href}
        {...props}
        data-liquid-link=""
        className={`group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
        onMouseEnter={(event) => {
          setIsHovered(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          setIsHovered(false);
          onMouseLeave?.(event);
        }}
      >
        <span className="absolute inset-0 -z-20 bg-[#0A0A0A] dark:bg-[#050505]" />
        <span className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-white/20 transition-colors duration-300 group-hover:border-white/60 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
        <motion.span
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10"
          initial={false}
          animate={{
            height: isHovered ? "100%" : `${numericHeight}px`,
            opacity: isHovered ? 1 : isOutline ? 0 : 0.8,
          }}
          transition={{ height: { duration: numericDelay, ease: [0.25, 1, 0.5, 1] }, opacity: { duration: 0.2 } }}
          style={{
            background: isSecondary
              ? "linear-gradient(135deg, #CCCCCC 0%, #888888 100%)"
              : "linear-gradient(135deg, #FFFFFF 0%, #BDBDBD 100%)",
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
          }}
        />
        <span className={`relative z-10 flex items-center justify-center gap-2 text-white transition-colors duration-250 ${isHovered ? "font-semibold text-black" : ""}`}>
          {children}
        </span>
      </Link>
    </Magnet>
  );
}
