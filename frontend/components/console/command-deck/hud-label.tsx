"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type HudColor = "lime" | "cyan" | "coral" | "amber" | "blue" | "violet";

interface HudLabelProps {
  /** 等宽前缀，例如 "TVL://" / "CAW.STATUS" / "0x1A" / "BUDGET::" */
  prefix: string;
  /** 要显示的值，可以是字符串或 React 节点 */
  value: React.ReactNode;
  /** 强调色 */
  color?: HudColor;
  /** 整体尺寸 */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorMap: Record<HudColor, string> = {
  lime: "text-hud-lime",
  cyan: "text-hud-cyan",
  coral: "text-hud-coral",
  amber: "text-hud-amber",
  blue: "text-hud-blue",
  violet: "text-hud-violet",
};

const sizeMap = {
  sm: { prefix: "text-[11px]", value: "text-xs" },
  md: { prefix: "text-xs", value: "text-sm" },
  lg: { prefix: "text-sm", value: "text-base" },
};

/**
 * HUD 数据标签 — 等宽字体前缀 + 值，用于 Command Deck 数据展示。
 * 例：<HudLabel prefix="BUDGET::" value="50,000 USDC" color="lime" />
 */
export function HudLabel({ prefix, value, color = "lime", size = "md", className }: HudLabelProps) {
  return (
    <div className={cn("inline-flex items-baseline gap-1.5 font-mono", className)}>
      <span className={cn("uppercase tracking-wider text-fg-muted", sizeMap[size].prefix)}>
        {prefix}
      </span>
      <span className={cn("font-semibold tabular-nums", colorMap[color], sizeMap[size].value)}>
        {value}
      </span>
    </div>
  );
}
