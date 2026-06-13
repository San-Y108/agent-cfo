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
}

export function ConsolePanelHeader({
  title,
  subtitle,
  hudPrefix,
  hudValue,
  hudColor = "cyan",
  trailing,
  className,
}: ConsolePanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 border-b border-border-token px-4 py-3 md:px-5 md:py-4",
        className
      )}
    >
      <div className="min-w-0">
        {hudPrefix && hudValue && (
          <HudLabel prefix={hudPrefix} value={hudValue} color={hudColor} size="sm" />
        )}
        <h2
          className={cn(
            "text-[14px] font-bold tracking-tight text-fg",
            hudPrefix && hudValue && "mt-0.5"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">{subtitle}</p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
