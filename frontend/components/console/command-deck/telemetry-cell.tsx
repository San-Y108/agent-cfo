"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { HudColor } from "./hud-label";

const hudAccentClass: Record<HudColor, string> = {
  lime: "text-hud-lime",
  cyan: "text-hud-cyan",
  blue: "text-hud-blue",
  violet: "text-hud-violet",
  coral: "text-hud-coral",
  amber: "text-hud-amber",
};

export interface ConsoleTelemetryCellProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Semantic HUD token or explicit hex */
  accent?: HudColor | string;
  className?: string;
  compact?: boolean;
}

export function ConsoleTelemetryCell({
  label,
  value,
  unit,
  accent = "cyan",
  className,
  compact = false,
}: ConsoleTelemetryCellProps) {
  const valueClass =
    accent in hudAccentClass
      ? hudAccentClass[accent as HudColor]
      : undefined;
  const valueStyle =
    valueClass ? undefined : { color: accent as string };

  return (
    <div
      className={cn(
        "rounded-xl border border-border-token bg-surface-2/70",
        compact ? "px-2 py-2" : "px-3 py-2.5",
        className
      )}
    >
      <div
        className={cn(
          "font-mono font-medium uppercase tracking-[0.1em] text-fg-muted",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        {label}
      </div>
      <div className={cn("flex items-baseline gap-1", compact ? "mt-1" : "mt-1.5")}>
        <span
          className={cn(
            "font-mono font-bold tabular-nums",
            compact ? "text-sm" : "text-base",
            valueClass
          )}
          style={valueStyle}
        >
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[10px] text-fg-subtle">{unit}</span>
        )}
      </div>
    </div>
  );
}

export interface ConsoleTelemetryGridProps {
  items: ConsoleTelemetryCellProps[];
  className?: string;
  columns?: 1 | 2;
  compact?: boolean;
}

export function ConsoleTelemetryGrid({
  items,
  className,
  columns = 2,
  compact = false,
}: ConsoleTelemetryGridProps) {
  return (
    <div
      className={cn(
        "grid",
        compact ? "gap-1.5" : "gap-2.5",
        columns === 2 ? "grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {items.map((item) => (
        <ConsoleTelemetryCell key={item.label} compact={compact} {...item} />
      ))}
    </div>
  );
}
