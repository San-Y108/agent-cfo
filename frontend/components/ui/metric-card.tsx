"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  tone?: "neutral" | "gold" | "emerald" | "red" | "blue" | "amber";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, subValue, tone = "neutral", icon, className }: MetricCardProps) {
  const toneClasses = {
    neutral: "border-white/[0.06] text-slate-50",
    gold: "border-amber-500/20 text-amber-400",
    emerald: "border-emerald-500/20 text-emerald-400",
    red: "border-red-500/20 text-red-400",
    blue: "border-blue-500/20 text-blue-400",
    amber: "border-amber-500/20 text-amber-400",
  };

  const glowClasses = {
    neutral: "",
    gold: "shadow-[0_0_24px_rgba(245,158,11,0.08)]",
    emerald: "shadow-[0_0_24px_rgba(16,185,129,0.08)]",
    red: "shadow-[0_0_24px_rgba(239,68,68,0.08)]",
    blue: "shadow-[0_0_24px_rgba(59,130,246,0.08)]",
    amber: "shadow-[0_0_24px_rgba(245,158,11,0.08)]",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-[#0B1120]/80 backdrop-blur-xl px-5 py-4",
        toneClasses[tone],
        glowClasses[tone],
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className={cn("mt-1 text-2xl font-bold tracking-tight font-mono-numbers", tone === "neutral" ? "text-slate-50" : "")}>
            {value}
          </p>
          {subValue && <p className="mt-0.5 text-[11px] text-slate-500">{subValue}</p>}
        </div>
        {icon && <div className="text-slate-600">{icon}</div>}
      </div>
    </motion.div>
  );
}
