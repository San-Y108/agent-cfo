"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* =============================================================================
 * COLOR TOKENS
 * ===========================================================================*/

const COLOR_MAP = {
  lime: {
    border: "border-[#B5FF4D]/30",
    text: "text-[#B5FF4D]",
    glow: "rgba(181,255,77,0.15)",
    glowStrong: "rgba(181,255,77,0.25)",
  },
  blue: {
    border: "border-[#60A5FA]/30",
    text: "text-[#60A5FA]",
    glow: "rgba(96,165,250,0.15)",
    glowStrong: "rgba(96,165,250,0.25)",
  },
  coral: {
    border: "border-[#FB7185]/30",
    text: "text-[#FB7185]",
    glow: "rgba(251,113,133,0.15)",
    glowStrong: "rgba(251,113,133,0.25)",
  },
  violet: {
    border: "border-[#C084FC]/30",
    text: "text-[#C084FC]",
    glow: "rgba(192,132,252,0.15)",
    glowStrong: "rgba(192,132,252,0.25)",
  },
  cyan: {
    border: "border-[#5EEAD4]/30",
    text: "text-[#5EEAD4]",
    glow: "rgba(94,234,212,0.15)",
    glowStrong: "rgba(94,234,212,0.25)",
  },
} as const;

/* =============================================================================
 * HOLOGRAPHIC BUTTON
 * ===========================================================================*/

export interface HolographicButtonProps {
  variant?: keyof typeof COLOR_MAP;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  glowOnHover?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}

export function HolographicButton({
  children,
  variant = "lime",
  size = "md",
  icon,
  glowOnHover = true,
  className,
  disabled,
  onClick,
  type = "button",
}: HolographicButtonProps) {
  const c = COLOR_MAP[variant];

  const sizeClass = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-8 py-3 text-base gap-2.5",
  }[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={
        glowOnHover && !disabled
          ? {
              scale: 1.02,
              boxShadow: `0 0 30px ${c.glowStrong}, 0 0 60px ${c.glow}`,
            }
          : { scale: 1.02 }
      }
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl font-semibold backdrop-blur-sm transition-colors",
        "bg-white/[0.03] hover:bg-white/[0.06]",
        "border",
        c.border,
        c.text,
        sizeClass,
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      disabled={disabled}
    >
      {/* Subtle inner glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity",
          "bg-gradient-to-br from-white/[0.05] to-transparent"
        )}
      />

      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}

/* =============================================================================
 * HOLOGRAPHIC LINK (for navigation)
 * ===========================================================================*/

export function HolographicLink({
  children,
  href,
  variant = "lime",
  size = "md",
  icon,
  className,
}: {
  children: React.ReactNode;
  href: string;
  variant?: keyof typeof COLOR_MAP;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  className?: string;
}) {
  const c = COLOR_MAP[variant];

  const sizeClass = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-8 py-3 text-base gap-2.5",
  }[size];

  return (
    <motion.a
      href={href}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 30px ${c.glowStrong}, 0 0 60px ${c.glow}`,
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl font-semibold backdrop-blur-sm transition-colors",
        "bg-white/[0.03] hover:bg-white/[0.06]",
        "border",
        c.border,
        c.text,
        sizeClass,
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.a>
  );
}
