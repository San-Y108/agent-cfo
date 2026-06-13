"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Scanline } from "./scanline";
import type { HudColor } from "./hud-label";

interface FrostedPanelProps {
  children: React.ReactNode;
  /** 顶部强调色 */
  glowColor?: HudColor;
  /** 是否显示顶部扫描线 */
  scanline?: boolean;
  /** 是否启用顶部高光条 */
  sheen?: boolean;
  className?: string;
}

const glowColorMap: Record<HudColor, string> = {
  lime: "shadow-[0_0_40px_-12px_var(--glow-lime)]",
  cyan: "shadow-[0_0_40px_-12px_var(--glow-cyan)]",
  coral: "shadow-[0_0_40px_-12px_var(--glow-coral)]",
  amber: "shadow-[0_0_40px_-12px_var(--glow-amber)]",
  blue: "shadow-[0_0_40px_-12px_var(--glow-blue)]",
  violet: "shadow-[0_0_40px_-12px_var(--glow-violet)]",
};

const sheenColorMap: Record<HudColor, string> = {
  lime: "from-hud-lime/10",
  cyan: "from-hud-cyan/10",
  coral: "from-hud-coral/10",
  amber: "from-hud-amber/10",
  blue: "from-hud-blue/10",
  violet: "from-hud-violet/10",
};

/**
 * 磨砂玻璃面板 — Command Deck 卫星卡容器。
 * 集成 backdrop-blur、细边框、顶部扫描线、微弱 glow。
 * 例：<FrostedPanel glowColor="lime" scanline sheen>...</FrostedPanel>
 */
export function FrostedPanel({
  children,
  glowColor,
  scanline = false,
  sheen = false,
  className,
}: FrostedPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card border border-border-token bg-surface/80 backdrop-blur-xl",
        glowColor && glowColorMap[glowColor],
        className
      )}
    >
      {sheen && (
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r via-border-strong/40 to-transparent",
            sheenColorMap[glowColor ?? "lime"]
          )}
        />
      )}
      {scanline && (
        <Scanline
          color={glowColor ?? "white"}
          className="absolute inset-x-0 top-0 opacity-50"
        />
      )}
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}
