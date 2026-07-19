"use client";

import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/i18n/context";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  color: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Agent quick-command chips — shared frame; primary = solid fill, secondary = glass.
 */
export function QuickActionButton({
  label,
  icon: Icon,
  color,
  primary = false,
  disabled = false,
  onClick,
}: QuickActionButtonProps) {
  const { theme } = useApp();
  // The brand accents (cyan/violet/lime) are light pastels tuned for dark mode;
  // on the light theme they wash out, so darken the text/icon for readable
  // contrast while keeping the tinted border/background as-is.
  const inkColor =
    theme === "dark" ? color : `color-mix(in srgb, ${color} 58%, #0b0f0a)`;

  return (
    <div className="group relative overflow-hidden rounded-full p-[1px]">
      <span
        className={cn(
          "pointer-events-none absolute inset-[-160%] rounded-full transition-opacity duration-300",
          primary
            ? "animate-border-spin opacity-75 group-hover:opacity-100"
            : "animate-border-spin-slow opacity-50 group-hover:opacity-90"
        )}
        style={{
          background: primary
            ? `conic-gradient(from 0deg, transparent 0%, ${color} 20%, transparent 40%, ${color}bb 60%, transparent 80%)`
            : `conic-gradient(from 0deg, transparent 0%, ${color}99 22%, transparent 44%, ${color}55 66%, transparent 88%)`,
        }}
        aria-hidden
      />

      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative flex items-center gap-2 overflow-hidden rounded-full px-3.5 py-2",
          "text-[12px] font-semibold transition-all",
          "disabled:cursor-not-allowed disabled:opacity-40",
          primary
            ? "text-[#0D0D0D]"
            : "border font-medium backdrop-blur-md"
        )}
        style={
          primary
            ? {
                backgroundColor: color,
                boxShadow: `0 0 16px -8px ${color}50`,
              }
            : {
                borderColor: `${color}45`,
                backgroundColor: `${color}0c`,
                color: inkColor,
                boxShadow: `0 0 16px -8px ${color}40`,
              }
        }
      >
        {!primary && (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(ellipse 80% 120% at 50% 120%, ${color}22, transparent 65%)`,
            }}
            aria-hidden
          />
        )}

        {primary && (
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-shimmer"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)",
              backgroundSize: "200% 100%",
            }}
            aria-hidden
          />
        )}

        <span
          className={cn(
            "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            primary ? "border-[#0D0D0D]/12 bg-[#0D0D0D]/10" : ""
          )}
          style={
            primary
              ? undefined
              : {
                  borderColor: `${color}40`,
                  backgroundColor: `${color}18`,
                  boxShadow: `0 0 8px -2px ${color}44`,
                }
          }
        >
          <Icon
            size={11}
            strokeWidth={primary ? 2.25 : 2}
            className={primary ? "text-[#0D0D0D]" : undefined}
            style={primary ? undefined : { color: inkColor }}
          />
        </span>
        <span className="relative z-10 tracking-tight">{label}</span>
      </motion.button>
    </div>
  );
}
