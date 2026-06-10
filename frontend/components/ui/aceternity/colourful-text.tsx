"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * ColourfulText — Aceternity-style animated text with cycling colors.
 * Adapted for AgentCFO theme using lime/cyan/coral/violet/blue palette.
 */

const AGENTCFO_COLORS = [
  "#B5FF4D", // lime
  "#5EEAD4", // cyan
  "#FB7185", // coral
  "#C084FC", // violet
  "#60A5FA", // blue
  "#FBBF24", // amber
];

export function ColourfulText({
  text,
  className,
  colors = AGENTCFO_COLORS,
  interval = 5000,
}: {
  text: string;
  className?: string;
  colors?: string[];
  interval?: number;
}) {
  const [currentColors, setCurrentColors] = useState(colors);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [colors, interval]);

  return (
    <span className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${count}-${index}`}
          initial={{ y: 0 }}
          animate={{
            color: currentColors[index % currentColors.length],
            y: [0, -3, 0],
            scale: [1, 1.01, 1],
            filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
            opacity: [1, 0.9, 1],
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.03,
          }}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * GradientText — simpler alternative with static gradient.
 */
export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-gradient-to-r from-lime-500 via-cyan-400 to-violet-400 bg-clip-text text-transparent ${className || ""}`}
    >
      {children}
    </span>
  );
}
