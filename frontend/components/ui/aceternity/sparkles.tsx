"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Sparkles — 随机分布的闪烁粒子，用于执行/高亮区域点缀。
 * 适配 Aceternity 风格，纯 Framer Motion 实现，无图片依赖。
 */
export function Sparkles({
  count = 18,
  className,
  color = "bg-blue-300",
}: {
  count?: number;
  className?: string;
  color?: string; // Tailwind class (e.g. "bg-blue-300") or hex (e.g. "#B5FF4D")
}) {
  const particles = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const rng = seededRandom(i + 1);
        return {
          id: i,
          top: rng() * 100,
          left: rng() * 100,
          size: rng() * 2 + 1,
          duration: rng() * 2 + 2,
          delay: rng() * 2,
        };
      }),
    [count]
  );

  const isHex = color.startsWith("#");

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={cn("absolute rounded-full", !isHex && color)}
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: isHex ? color : undefined,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
