"use client";

import { cn } from "@/lib/utils";
import { motion, useSpring, useTransform } from "framer-motion";
import React, { useEffect } from "react";

interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  tone?: "neutral" | "amber" | "emerald" | "red" | "blue";
}

export function StatsStrip({
  stats,
  className,
}: {
  stats: StatItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) =>
    stat.decimals
      ? v.toFixed(stat.decimals)
      : Math.round(v).toLocaleString()
  );

  useEffect(() => {
    spring.set(stat.value);
  }, [spring, stat.value]);

  const toneStyles = {
    neutral: "bg-surface-2 text-fg-muted border-border-token",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5",
        toneStyles[stat.tone ?? "neutral"]
      )}
    >
      <span className="text-sm font-bold tabular-nums">
        {stat.prefix}
        <motion.span>{display}</motion.span>
        {stat.suffix}
      </span>
      <span className="text-[10px] uppercase tracking-wider opacity-60">
        {stat.label}
      </span>
    </motion.div>
  );
}
