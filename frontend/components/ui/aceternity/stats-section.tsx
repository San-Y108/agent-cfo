"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";

/**
 * StatsSection — Aceternity-style animated stats display.
 * Adapted for AgentCFO dark theme.
 * Supports both desktop (tab switch) and mobile (stacked) layouts.
 */

interface StatItem {
  label: string;
  value: string | number;
  subtext?: string;
  content?: React.ReactNode;
}

export function StatsSection({
  items,
  className,
}: {
  items: StatItem[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <StatsDesktop items={items} />
      <StatsMobile items={items} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop — tab grid with animated content switch                    */
/* ------------------------------------------------------------------ */

function StatsDesktop({ items }: { items: StatItem[] }) {
  const [active, setActive] = useState(items[0]);
  const direction = useMotionValue(0);

  const isActive = (stat: StatItem) => stat.label === active.label;

  const handleSetActive = (stat: StatItem) => {
    const currentIndex = items.findIndex((s) => s.label === active.label);
    const newIndex = items.findIndex((s) => s.label === stat.label);
    direction.set(newIndex > currentIndex ? 1 : -1);
    setActive(stat);
  };

  if (items.length === 0) return null;

  return (
    <div className="mx-auto hidden w-full max-w-7xl px-4 md:px-8 lg:block">
      {/* Tab row */}
      <div
        className={cn(
          "grid w-full gap-3",
          items.length <= 3 && "grid-cols-3",
          items.length === 4 && "grid-cols-4",
          items.length >= 5 && "grid-cols-5"
        )}
      >
        {items.map((stat, index) => (
          <button
            key={`stat-tab-${index}`}
            onClick={() => handleSetActive(stat)}
            className={cn(
              "flex items-center rounded-xl p-4 transition-colors duration-200",
              "hover:bg-white/[0.03]",
              isActive(stat) ? "bg-white/[0.05] border border-white/[0.08]" : "border border-transparent"
            )}
          >
            <div className="flex flex-col items-start text-left w-full">
              <span className="text-[11px] uppercase tracking-wider text-fg-subtle font-mono">
                {stat.label}
              </span>
              <span className="mt-1 text-2xl font-bold text-fg font-mono tabular-nums">
                {stat.value}
              </span>
              {stat.subtext && (
                <span className="mt-1 text-xs text-fg-subtle">{stat.subtext}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="relative mt-6 w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-surface p-8">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={String(active.label)}
            initial={{ x: direction.get() * 80, opacity: 0 }}
            exit={{ x: direction.get() * -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ease: "easeOut", duration: 0.35 }}
            className="w-full"
          >
            {active.content ? (
              active.content
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-fg-subtle">
                <span className="text-sm">{active.label}: {active.value}</span>
                {active.subtext && <span className="text-xs mt-1">{active.subtext}</span>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile — stacked cards                                             */
/* ------------------------------------------------------------------ */

function StatsMobile({ items }: { items: StatItem[] }) {
  return (
    <div className="mx-auto block w-full max-w-7xl px-4 md:px-8 lg:hidden space-y-4">
      {items.map((stat, index) => (
        <motion.div
          key={`stat-mobile-${index}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-surface p-5"
        >
          <span className="text-[11px] uppercase tracking-wider text-fg-subtle font-mono">
            {stat.label}
          </span>
          <div className="mt-2 text-xl font-bold text-fg font-mono tabular-nums">
            {stat.value}
          </div>
          {stat.subtext && (
            <div className="mt-1 text-xs text-fg-subtle">{stat.subtext}</div>
          )}
          {stat.content && <div className="mt-4">{stat.content}</div>}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * StatCard — simple standalone stat card.
 */
export function StatCard({
  label,
  value,
  subtext,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-surface p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-fg-subtle font-mono">
          {label}
        </span>
        {icon && <div className="text-fg-subtle">{icon}</div>}
      </div>
      <div className="mt-3 text-2xl font-bold text-fg font-mono tabular-nums">
        {value}
      </div>
      {subtext && (
        <div className="mt-1 text-xs text-fg-subtle">{subtext}</div>
      )}
    </motion.div>
  );
}
