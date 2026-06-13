"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { HudColor } from "./hud-label";
import { FrostedPanel } from "./frosted-panel";

export interface DetailDeckShellProps {
  glowColor?: HudColor;
  children: React.ReactNode;
  className?: string;
}

/** Standard filled DetailDeck panel — avoids empty collapsed void under module stages. */
export function DetailDeckShell({
  glowColor = "lime",
  children,
  className,
}: DetailDeckShellProps) {
  return (
    <FrostedPanel
      glowColor={glowColor}
      sheen
      className={cn("rounded-card p-3 md:p-4", className)}
    >
      {children}
    </FrostedPanel>
  );
}

export interface PreflightRowProps {
  label: string;
  value: string;
  status?: "ok" | "warn" | "idle";
}

export function PreflightRow({ label, value, status = "idle" }: PreflightRowProps) {
  const dot =
    status === "ok"
      ? "bg-emerald-400"
      : status === "warn"
      ? "bg-hud-coral"
      : "bg-fg/30";
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[11px]">
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
        <span className="truncate text-fg-muted">{label}</span>
      </div>
      <span className="shrink-0 font-mono font-semibold text-fg">{value}</span>
    </div>
  );
}
