"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ScanlineProps {
  /** 扫描线颜色 */
  color?: "lime" | "cyan" | "coral" | "amber" | "blue" | "violet" | "white";
  /** 是否带移动高亮光条 */
  sweep?: boolean;
  className?: string;
}

const colorMap = {
  lime: "bg-hud-lime/30",
  cyan: "bg-hud-cyan/30",
  coral: "bg-hud-coral/30",
  amber: "bg-hud-amber/30",
  blue: "bg-hud-blue/30",
  violet: "bg-hud-violet/30",
  white: "bg-white/20",
};

/**
 * 扫描线 — 1px 水平线 + 移动高亮光条，用于 Command Deck 数据面板分隔。
 * 例：<Scanline color="lime" sweep />
 */
export function Scanline({ color = "white", sweep = true, className }: ScanlineProps) {
  return (
    <div
      className={cn(
        "relative h-px w-full overflow-hidden",
        colorMap[color],
        className
      )}
    >
      {sweep && (
        <div
          className="absolute inset-0 animate-scanline"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%)",
            backgroundSize: "50% 100%",
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}
