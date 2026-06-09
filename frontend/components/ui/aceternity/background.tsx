"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

/**
 * Noise texture overlay — 暗色质感纹理，叠加在背景最底层。
 * 使用 public/aceternity/noise.webp。
 */
export function NoiseOverlay({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 opacity-[0.04] mix-blend-soft-light",
        className
      )}
      style={{
        backgroundImage: "url(/aceternity/noise.webp)",
        backgroundSize: "300px 300px",
        backgroundRepeat: "repeat",
      }}
    />
  );
}

export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function DotBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 70% 50% at 50% 30%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 50% at 50% 30%, black 30%, transparent 100%)",
        }}
      />
    </div>
  );
}

export function GradientOrb({
  className,
  color = "blue",
}: {
  className?: string;
  color?: "blue" | "purple" | "cyan" | "amber" | "emerald" | "lime";
}) {
  const colorMap = {
    blue: "bg-blue-500/20",
    purple: "bg-purple-500/20",
    cyan: "bg-cyan-500/20",
    amber: "bg-amber-500/20",
    emerald: "bg-emerald-500/20",
    lime: "bg-[#B5FF4D]/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute z-0 h-[400px] w-[400px] rounded-full blur-[120px]",
        colorMap[color],
        className
      )}
    />
  );
}

/**
 * 组合背景层：base + grid + noise，用于 /demo 全局底座。随主题切换。
 */
export function DemoBackdrop() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#F8F8F8]" />
      <GridBackground />
      <NoiseOverlay className="opacity-[0.02]" />
    </>
  );
}
