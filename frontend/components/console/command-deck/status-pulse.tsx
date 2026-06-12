"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { HudColor } from "./hud-label";

interface StatusPulseProps {
  /** 状态色 */
  color?: HudColor;
  /** 状态标签文本 */
  label?: string;
  /** 尺寸 */
  size?: "sm" | "md" | "lg";
  /** 是否停止动画 */
  static?: boolean;
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
  sm: { dot: "w-1.5 h-1.5", text: "text-[10px]", gap: "gap-1.5" },
  md: { dot: "w-2 h-2", text: "text-[11px]", gap: "gap-2" },
  lg: { dot: "w-2.5 h-2.5", text: "text-xs", gap: "gap-2" },
};

/**
 * 状态脉冲 — 呼吸圆点 + 可选标签，用于 Command Deck 状态指示。
 * 例：<StatusPulse color="lime" label="ONLINE" />
 */
export function StatusPulse({
  color = "lime",
  label,
  size = "md",
  static: isStatic = false,
  className,
}: StatusPulseProps) {
  return (
    <div className={cn("inline-flex items-center", sizeMap[size].gap, className)}>
      <span
        className={cn(
          "rounded-full",
          colorMap[color],
          sizeMap[size].dot,
          !isStatic && "animate-status-pulse"
        )}
        style={{ backgroundColor: "currentColor" }}
      />
      {label && (
        <span className={cn("font-mono uppercase tracking-wider text-fg", sizeMap[size].text)}>
          {label}
        </span>
      )}
    </div>
  );
}
