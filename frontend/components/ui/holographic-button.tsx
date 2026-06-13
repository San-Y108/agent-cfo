"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* =============================================================================
 * COLOR TOKENS — mapped to globals.css HUD variables
 * ===========================================================================*/

const COLOR_MAP = {
  lime: {
    border: "border-hud-lime/30",
    text: "text-hud-lime",
    glow: "var(--glow-lime)",
    glowStrong: "var(--glow-lime)",
  },
  blue: {
    border: "border-hud-blue/30",
    text: "text-hud-blue",
    glow: "var(--glow-blue)",
    glowStrong: "var(--glow-blue)",
  },
  coral: {
    border: "border-hud-coral/30",
    text: "text-hud-coral",
    glow: "var(--glow-coral)",
    glowStrong: "var(--glow-coral)",
  },
  violet: {
    border: "border-hud-violet/30",
    text: "text-hud-violet",
    glow: "var(--glow-violet)",
    glowStrong: "var(--glow-violet)",
  },
  cyan: {
    border: "border-hud-cyan/30",
    text: "text-hud-cyan",
    glow: "var(--glow-cyan)",
    glowStrong: "var(--glow-cyan)",
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
  tilt3d?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  form?: string;
  children?: React.ReactNode;
}

export function HolographicButton({
  children,
  variant = "lime",
  size = "md",
  icon,
  glowOnHover = true,
  tilt3d = false,
  className,
  disabled,
  onClick,
  type = "button",
  form,
}: HolographicButtonProps) {
  const c = COLOR_MAP[variant];

  const sizeClass = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-8 py-3 text-base gap-2.5",
  }[size];

  const hoverState = !disabled
    ? {
        scale: 1.02,
        ...(glowOnHover
          ? { boxShadow: `0 0 30px ${c.glowStrong}, 0 0 60px ${c.glow}` }
          : {}),
        ...(tilt3d ? { rotateX: -12, transformPerspective: 600 } : {}),
      }
    : {};

  return (
    <motion.button
      type={type}
      form={form}
      onClick={onClick}
      style={tilt3d ? { transformStyle: "preserve-3d" } : undefined}
      whileHover={hoverState}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        "relative inline-flex items-center justify-center rounded-control font-semibold backdrop-blur-sm transition-colors",
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
          "pointer-events-none absolute inset-0 rounded-control opacity-0 transition-opacity",
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
        "relative inline-flex items-center justify-center rounded-control font-semibold backdrop-blur-sm transition-colors",
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
