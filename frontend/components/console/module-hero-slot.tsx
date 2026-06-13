"use client";

import React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { HudColor } from "@/components/console/command-deck";

const GLOW: Record<HudColor, string> = {
  lime: "var(--glow-lime)",
  cyan: "var(--glow-cyan)",
  coral: "var(--glow-coral)",
  amber: "var(--glow-amber)",
  blue: "var(--glow-blue)",
  violet: "var(--glow-violet)",
};

const HEIGHT = {
  sm: "h-[120px]",
  md: "h-[180px]",
  lg: "h-[220px]",
} as const;

export interface ModuleHeroSlotProps {
  src: string;
  alt: string;
  color: HudColor;
  size?: keyof typeof HEIGHT;
  className?: string;
  /** Whether the figure responds to pointer movement with 3D tilt. */
  interactive?: boolean;
  /** Whether the figure is currently in an "active/analyzing" state. */
  active?: boolean;
  /** Optional overlay anchored to the hero bottom (identity chips, badges). */
  footer?: React.ReactNode;
}

/**
 * Grid-embedded module mascot hero — not absolute/floating.
 *
 * - Bottom fade uses semantic `--surface` for light/dark parity.
 * - 3D tilt follows the pointer via Framer Motion springs.
 * - Respects `prefers-reduced-motion`.
 */
export function ModuleHeroSlot({
  src,
  alt,
  color,
  size = "lg",
  className,
  interactive = true,
  active = false,
  footer,
}: ModuleHeroSlotProps) {
  const reduce = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 24 });
  const rotateY = useTransform(springX, (v) => (reduce ? 0 : v / 22));
  const rotateX = useTransform(springY, (v) => (reduce ? 0 : -v / 22));

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - box.left - box.width / 2);
    rawY.set(e.clientY - box.top - box.height / 2);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border-token bg-surface-2/50",
        HEIGHT[size],
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Ambient glow anchored to the mascot bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[75%] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 85% 75% at 50% 100%, ${GLOW[color]} 0%, transparent 65%)`,
        }}
      />

      {/* Surface sheen line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Figure stage with 3D tilt */}
      <div
        className="relative z-10 flex h-full flex-col"
        style={{ perspective: 900 }}
      >
        <div className="relative min-h-0 flex-1">
          <motion.div
            className="absolute inset-0 flex items-end justify-center pb-2"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            animate={
              active
                ? { y: [0, -4, 0], scale: [1, 1.015, 1] }
                : reduce
                  ? undefined
                  : { y: [0, -6, 0] }
            }
            transition={
              active
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <img
              src={src}
              alt={alt}
              className="mx-auto h-full max-h-[95%] w-auto max-w-[92%] select-none object-contain object-bottom px-2 pt-2"
              draggable={false}
              style={{
                filter: `drop-shadow(0 14px 28px rgba(0,0,0,0.45))`,
              }}
            />
          </motion.div>

          {/* Bottom fade to surface so the mascot melts into the card */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48%]"
            style={{
              background:
                "linear-gradient(to top, var(--surface) 0%, color-mix(in srgb, var(--surface) 55%, transparent) 45%, transparent 100%)",
            }}
          />
        </div>

        {footer ? (
          <div className="relative z-20 shrink-0 px-3 pb-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
