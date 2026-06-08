"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

type BentoTone = "neutral" | "emerald" | "red" | "blue" | "amber" | "purple";

const toneGlow: Record<BentoTone, string> = {
  neutral: "hover:shadow-[0_0_24px_-4px_rgba(120,120,120,0.18)] hover:border-border-strong",
  emerald: "hover:shadow-[0_0_28px_-4px_rgba(16,185,129,0.35)] hover:border-emerald-500/40",
  red: "hover:shadow-[0_0_28px_-4px_rgba(239,68,68,0.35)] hover:border-red-500/40",
  blue: "hover:shadow-[0_0_28px_-4px_rgba(59,130,246,0.35)] hover:border-blue-500/40",
  amber: "hover:shadow-[0_0_28px_-4px_rgba(245,158,11,0.35)] hover:border-amber-500/40",
  purple: "hover:shadow-[0_0_28px_-4px_rgba(168,85,247,0.35)] hover:border-purple-500/40",
};

export function BentoCard({
  className,
  children,
  colSpan = 1,
  rowSpan = 1,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  tone?: BentoTone;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border-token bg-surface p-6 backdrop-blur-sm transition-all duration-300",
        toneGlow[tone],
        colSpan === 2 && "md:col-span-2",
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      {/* Subtle top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fg/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}

export function BentoCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-base font-semibold tracking-tight text-fg",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function BentoCardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-2 text-sm text-fg-muted", className)}>
      {children}
    </p>
  );
}
