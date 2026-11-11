"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export type Resolved = "light" | "dark";
export type ThemeSelection = "light" | "dark" | "system";

export const themeTogglerButtonVariants = (props?: {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) => {
  const variant = props?.variant ?? "default";
  const size = props?.size ?? "default";

  const base =
    "relative inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C8FF]";
  const variants = {
    default:
      "bg-[#0C1220]/80 text-[#F5F7FF] border border-white/10 hover:border-[#00C8FF]/40 hover:bg-[#090D18] shadow-[0_0_15px_rgba(0,0,0,0.4)]",
    outline:
      "border border-white/20 text-[#A0A9BC] hover:text-[#F5F7FF] hover:border-[#00C8FF]/50",
    ghost: "text-[#A0A9BC] hover:text-[#F5F7FF] hover:bg-white/5",
  };
  const sizes = {
    default: "h-9 w-9",
    sm: "h-8 w-8 text-xs",
    lg: "h-10 w-10",
    icon: "h-9 w-9",
  };

  return `${base} ${variants[variant]} ${sizes[size]}`;
};

interface ThemeTogglerContextType {
  activeTheme: ThemeSelection;
  resolved: Resolved;
}

const ThemeTogglerContext = createContext<ThemeTogglerContextType>({
  activeTheme: "dark",
  resolved: "dark",
});

export const useThemeTogglerButton = () => useContext(ThemeTogglerContext);

export interface ThemeTogglerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ThemeSelection;
  resolvedTheme?: Resolved;
  setTheme?: (theme: string) => void;
  modes?: ThemeSelection[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function ThemeTogglerButton({
  theme = "dark",
  resolvedTheme = "dark",
  setTheme,
  modes = ["light", "dark"],
  variant = "default",
  size = "default",
  className = "",
  children,
  onClick,
  ...props
}: ThemeTogglerButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!setTheme) return;

    const current = theme ?? resolvedTheme;
    const currentIndex = modes.indexOf(current as ThemeSelection);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  return (
    <ThemeTogglerContext.Provider
      value={{
        activeTheme: theme,
        resolved: resolvedTheme,
      }}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleClick}
        className={`${themeTogglerButtonVariants({ variant, size })} ${className}`}
        aria-label="Toggle color theme"
        {...(props as any)}
      >
        {children}
      </motion.button>
    </ThemeTogglerContext.Provider>
  );
}

export interface ThemeTogglerButtonIconProps {
  light?: React.ReactNode;
  dark?: React.ReactNode;
  system?: React.ReactNode;
  className?: string;
}

export function ThemeTogglerButtonIcon({
  light,
  dark,
  system,
  className = "size-4",
}: ThemeTogglerButtonIconProps) {
  const { activeTheme, resolved } = useThemeTogglerButton();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={`inline-block ${className}`} />;
  }

  const isLight = resolved === "light";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={activeTheme === "system" && system ? "system" : isLight ? "light" : "dark"}
        initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="inline-flex items-center justify-center text-current"
      >
        {activeTheme === "system" && system
          ? system
          : isLight
          ? light ?? <Sun size={17} className="text-amber-400" />
          : dark ?? <Moon size={17} className="text-[#00C8FF]" />}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * Ready-to-use ThemeToggler component that binds to next-themes with zero configuration.
 */
export function ThemeToggler({
  variant = "default",
  size = "default",
  system = false,
  className = "",
}: {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  system?: boolean;
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`${themeTogglerButtonVariants({ variant, size })} ${className}`}
      >
        <span className="size-4" />
      </button>
    );
  }

  return (
    <ThemeTogglerButton
      theme={(theme ?? "system") as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? "dark") as Resolved}
      setTheme={setTheme}
      modes={system ? ["light", "dark", "system"] : ["light", "dark"]}
      variant={variant}
      size={size}
      className={className}
    >
      <ThemeTogglerButtonIcon
        light={<Sun size={17} className="text-amber-400" />}
        dark={<Moon size={17} className="text-[#00C8FF]" />}
        system={<Monitor size={17} className="text-[#8855FF]" />}
      />
    </ThemeTogglerButton>
  );
}
