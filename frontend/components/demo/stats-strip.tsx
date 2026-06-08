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
        "grid w-full grid-cols-2 gap-4 md:grid-cols-4 border-y border-neutral-800 bg-neutral-950/50 py-6 px-4",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center"
    >
      <div className="text-2xl font-bold text-white md:text-3xl">
        {stat.prefix}
        <motion.span>{display}</motion.span>
        {stat.suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
        {stat.label}
      </div>
    </motion.div>
  );
}
