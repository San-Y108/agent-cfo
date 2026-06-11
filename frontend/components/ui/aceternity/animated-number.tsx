"use client";

import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/**
 * AnimatedNumber — 数字从 0 滚动到目标值的动效。
 * 用于金额 / 计数等需要强调的数字。
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  className,
  springConfig,
}: {
  value: number;
  decimals?: number;
  className?: string;
  springConfig?: { stiffness?: number; damping?: number };
}) {
  const spring = useSpring(0, {
    stiffness: springConfig?.stiffness ?? 90,
    damping: springConfig?.damping ?? 28,
  });
  const display = useTransform(spring, (v) =>
    decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </motion.span>
  );
}
