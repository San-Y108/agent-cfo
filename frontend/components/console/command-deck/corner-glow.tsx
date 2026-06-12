"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { HudColor } from "./hud-label";

interface CornerGlowProps {
  /** 光晕颜色 */
  color?: HudColor;
  /** 光晕强度 0-1 */
  intensity?: number;
  /** 是否启用缓慢漂移动画 */
  animate?: boolean;
  className?: string;
}

const colorMap: Record<HudColor, string> = {
  lime: "#B5FF4D",
  cyan: "#5EEAD4",
  coral: "#FB7185",
  amber: "#F59E0B",
  blue: "#60A5FA",
  violet: "#C084FC",
};

/**
 * 右上角光晕 — Command Deck 主角模块的氛围装饰。
 * 例：<CornerGlow color="lime" className="-top-20 -right-20" />
 */
export function CornerGlow({
  color = "lime",
  intensity = 0.18,
  animate = true,
  className,
}: CornerGlowProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-0 h-[320px] w-[320px] rounded-full blur-[100px]",
        animate && "animate-corner-glow",
        className
      )}
      style={{
        backgroundColor: colorMap[color],
        opacity: intensity,
      }}
    />
  );
}
