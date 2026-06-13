"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { HudColor } from "./hud-label";

const strokeMap: Record<HudColor, string> = {
  lime: "rgba(181,255,77,0.35)",
  cyan: "rgba(94,234,212,0.35)",
  blue: "rgba(96,165,250,0.35)",
  violet: "rgba(192,132,252,0.35)",
  coral: "rgba(251,113,133,0.35)",
  amber: "rgba(245,158,11,0.35)",
};

/** Lightweight corner accent — Aceternity SvgGradientLines 的 Console 简化版 */
export function StageCornerAccent({
  color = "cyan",
  className,
}: {
  color?: HudColor;
  className?: string;
}) {
  const stroke = strokeMap[color];

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit]", className)}
      aria-hidden
    >
      <svg className="absolute left-3 top-3 h-8 w-8" viewBox="0 0 32 32" fill="none">
        <path d="M4 28V4H28" stroke={stroke} strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-3 right-3 h-8 w-8 rotate-180" viewBox="0 0 32 32" fill="none">
        <path d="M4 28V4H28" stroke={stroke} strokeWidth="1" />
      </svg>
    </div>
  );
}
