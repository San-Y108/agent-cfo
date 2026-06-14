"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { HudLabel } from "./hud-label";
import type { HudColor } from "./hud-label";

export interface ConsolePanelHeaderProps {
  title: string;
  subtitle?: string;
  hudPrefix?: string;
  hudValue?: string;
  hudColor?: HudColor;
  trailing?: React.ReactNode;
  className?: string;
  /** Compact header — smaller padding / font, for space-constrained panels. */
  compact?: boolean;
}

export function ConsolePanelHeader({
  title,
  subtitle,
  hudPrefix,
  hudValue,
  hudColor = "cyan",
  trailing,
  className,
  compact,
}: ConsolePanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-border-token",
        compact
          ? "px-3 py-2 md:px-4 md:py-2.5"
          : "px-4 py-3 md:px-5 md:py-4",
        className
      )}
    >
      <div className="min-w-0">
        {hudPrefix && hudValue && (
          <HudLabel prefix={hudPrefix} value={hudValue} color={hudColor} size={compact ? "sm" : "sm"} />
        )}
        <h2
          className={cn(
            "font-bold tracking-tight text-fg",
            compact ? "text-[13px]" : "text-[14px]",
            hudPrefix && hudValue && (compact ? "mt-0" : "mt-0.5")
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "text-fg-muted",
              compact ? "mt-0 text-[11px] leading-snug" : "mt-0.5 text-[12px] leading-relaxed"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
