"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const BEAMS = [
  { rotate: 35, x: "-40%", delay: 0 },
  { rotate: -35, x: "40%", delay: 0.08 },
  { rotate: 90, x: "0%", delay: 0.04 },
] as const;

export interface BeamBurstProps {
  color?: string;
  className?: string;
}

/**
 * One-shot converging beams + flash — Treasury Executing (V-022 lite).
 * No infinite loop; respects prefers-reduced-motion.
 */
export function BeamBurst({ color = "#5EEAD4", className }: BeamBurstProps) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {BEAMS.map((beam, i) => (
        <motion.div
          key={i}
          className="absolute top-[18%] h-20 w-px origin-top"
          style={{
            left: `calc(50% + ${beam.x})`,
            rotate: beam.rotate,
            background: `linear-gradient(to bottom, ${color}, transparent 85%)`,
            boxShadow: `0 0 14px ${color}55`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.95, 0], scaleY: [0, 1, 0.6], y: [0, 48, 96] }}
          transition={{ duration: 0.85, delay: beam.delay, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="absolute left-1/2 top-[42%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full blur-lg"
        style={{ backgroundColor: color }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.6, 2.2], opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
      />
    </div>
  );
}
